import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Store, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle,
  History,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  User,
  Calculator
} from 'lucide-react';

const VendeurDashboard = () => {
  const { currentUser, magasins, products, orders, confirmOrder, users, placeOrder, deliverOrder } = useAppContext();
  
  // Find the store managed by this vendeur
  const myMagasin = magasins.find(m => m.id === currentUser?.magasinId);
  const myOrders = orders.filter(o => o.magasinId === currentUser?.magasinId);
  
  const [view, setView] = useState('resume'); // 'resume' or 'caisse'
  const [cart, setCart] = useState({});
  const [selectedClient, setSelectedClient] = useState('passager');

  const clients = users.filter(u => u.role === 'client');
  
  const pendingOrders = myOrders.filter(o => o.status === 'pending');
  const salesToday = myOrders.filter(o => 
    (o.status === 'confirmed' || o.status === 'delivered') && 
    new Date(o.timestamp).toDateString() === new Date().toDateString()
  );

  const totalSalesToday = salesToday.reduce((sum, o) => sum + o.total, 0);

  const updateCart = (productId, delta) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((acc, [id, qty]) => {
      const p = products.find(prod => prod.id === id);
      if (!p) return acc;
      const priceToUse = myMagasin?.customPrices?.[id] || p.price;
      return acc + (priceToUse * qty);
    }, 0);
  };

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) return;
    
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    let clientIdToUse = selectedClient;
    
    // Si c'est un passager, on a besoin du vendeur actuel comme proxy ou on crée un faux user "Passager"
    if (selectedClient === 'passager') {
      clientIdToUse = currentUser.id; // Assign to vendor for tracking, or keep a dedicated "passager" ID logic
    }
    
    const newOrder = placeOrder(items, clientIdToUse, myMagasin.id, currentUser.id);
    
    // For direct sales, we assume it's delivered and paid immediately
    confirmOrder(newOrder.id);
    deliverOrder(newOrder.id);
    
    setCart({});
    setSelectedClient('passager');
    alert("Vente enregistrée avec succès !");
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--secondary-color)', padding: '12px', borderRadius: '15px' }}>
          <Store size={28} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{myMagasin?.name || 'Mon Magasin'}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{myMagasin?.location}</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${view === 'resume' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px' }}
          onClick={() => setView('resume')}
        >
          <TrendingUp size={18} /> Résumé
        </button>
        <button 
          className={`btn ${view === 'caisse' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px' }}
          onClick={() => setView('caisse')}
        >
          <Calculator size={18} /> Caisse / Vente
        </button>
      </div>

      {view === 'resume' ? (
        <>
          {/* Stats Grid */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <span className="stat-label">Ventes Aujourd'hui</span>
          <span className="stat-value">{totalSalesToday} <small>DH</small></span>
        </div>
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
          <span className="stat-label">Commandes du jour</span>
          <span className="stat-value">{salesToday.length}</span>
        </div>
      </div>

      {/* Local Stock Check */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} /> État du Stock en Rayon
        </h3>
        <div className="glass-card" style={{ padding: '0' }}>
          {products.filter(p => !myMagasin?.activeProducts || myMagasin.activeProducts.includes(p.id)).map((prod, idx) => (
            <div key={prod.id} style={{ 
              padding: '15px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: idx === products.length - 1 ? 'none' : '1px solid var(--surface-border)'
            }}>
              <div>
                <p style={{ fontWeight: 600 }}>{prod.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{myMagasin?.customPrices?.[prod.id] || prod.price} DH / plateau</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`stock-pill ${myMagasin?.stock[prod.id] < (myMagasin?.alertThreshold || 30) ? 'stock-low' : 'stock-ok'}`}>
                  {myMagasin?.stock[prod.id] || 0} plateaux
                </span>
                {myMagasin?.stock[prod.id] < (myMagasin?.alertThreshold || 30) && <AlertTriangle size={14} color="var(--danger-color)" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Orders for this store */}
      <section>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} /> Commandes Clients à Valider
        </h3>
        {pendingOrders.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Aucune commande en attente pour votre magasin.
          </div>
        ) : (
          pendingOrders.map(order => (
            <div key={order.id} className="glass-card animate-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{order.clientName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Réf: #{order.id}</p>
                  {order.deliveryDate && <p style={{ fontSize: '0.8rem', color: 'var(--danger-color)', fontWeight: 'bold', marginTop: '5px' }}>Date: {new Date(order.deliveryDate).toLocaleString()}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>{order.total} DH</p>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => confirmOrder(order.id)}
              >
                <CheckCircle2 size={18} /> Valider la Commande
              </button>
            </div>
          ))
        )}
      </section>
        </>
      ) : (
        <section className="animate-in">
          {/* Caisse View */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Client
            </label>
            <select 
              className="form-input" 
              value={selectedClient} 
              onChange={e => setSelectedClient(e.target.value)}
              style={{ background: 'var(--surface-color)', padding: '15px', fontSize: '1.1rem' }}
            >
              <option value="passager">Client Passager (Comptoir)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Produits Disponibles</h3>
          <div className="grid-2" style={{ gap: '10px', marginBottom: '2rem' }}>
            {products.filter(p => !myMagasin?.activeProducts || myMagasin.activeProducts.includes(p.id)).map(prod => {
              const stock = myMagasin?.stock[prod.id] || 0;
              return (
                <button 
                  key={prod.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '15px', 
                    textAlign: 'left', 
                    border: '1px solid var(--surface-border)',
                    opacity: stock <= 0 ? 0.5 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                  }}
                  disabled={stock <= 0}
                  onClick={() => updateCart(prod.id, 1)}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{prod.name}</span>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>{myMagasin?.customPrices?.[prod.id] || prod.price} DH</span>
                  <span style={{ fontSize: '0.75rem', color: stock < (myMagasin?.alertThreshold || 30) ? 'var(--danger-color)' : 'var(--text-muted)' }}>Stock: {stock}</span>
                </button>
              );
            })}
          </div>

          {Object.keys(cart).length > 0 && (
            <div className="glass-card" style={{ border: '2px solid var(--primary-color)' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '10px' }}>Panier en cours</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                {Object.entries(cart).map(([prodId, qty]) => {
                  const p = products.find(prod => prod.id === prodId);
                  const priceToUse = myMagasin?.customPrices?.[prodId] || p?.price;
                  return (
                    <div key={prodId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p?.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{priceToUse} DH x {qty}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button className="btn-outline" style={{ width: '35px', height: '35px', padding: 0 }} onClick={() => updateCart(prodId, -1)}>
                          <Minus size={16} />
                        </button>
                        <span style={{ fontWeight: 800, width: '20px', textAlign: 'center' }}>{qty}</span>
                        <button className="btn btn-primary" style={{ width: '35px', height: '35px', padding: 0 }} disabled={(myMagasin?.stock[prodId] || 0) <= qty} onClick={() => updateCart(prodId, 1)}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingTop: '10px', borderTop: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '1.2rem' }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>{calculateTotal()} DH</span>
              </div>
              
              <button className="btn btn-primary" style={{ padding: '15px', fontSize: '1.1rem' }} onClick={handleCheckout}>
                <CheckCircle2 size={20} /> Valider la Vente
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default VendeurDashboard;
