import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  ShoppingCart, 
  History, 
  Plus, 
  Minus, 
  Store, 
  Clock, 
  CheckCircle2,
  FileText,
  XCircle,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';

const ClientDashboard = () => {
  const { products, orders, placeOrder, cancelOrder, currentUser, magasins } = useAppContext();
  const [selectedMagasin, setSelectedMagasin] = useState(null);
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [view, setView] = useState('catalog'); // 'catalog' or 'history'
  const [showInvoice, setShowInvoice] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState('');

  const clientOrders = orders.filter(o => o.clientId === currentUser?.id);

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

  const handlePlaceOrder = () => {
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0 || !selectedMagasin) return;
    
    if (!deliveryDate) {
      alert("Veuillez spécifier une date et une heure de livraison souhaitées.");
      return;
    }

    placeOrder(items, currentUser.id, selectedMagasin.id, null, deliveryDate);
    setCart({});
    setDeliveryDate('');
    setView('history');
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((acc, [id, qty]) => {
      const p = products.find(prod => prod.id === id);
      if (!p) return acc;
      const priceToUse = selectedMagasin?.customPrices?.[id] || p.price;
      return acc + (priceToUse * qty);
    }, 0);
  };

  if (showInvoice) {
    return (
      <div className="animate-in">
        <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setShowInvoice(null)}>
          <ArrowLeft size={16} /> Retour aux commandes
        </button>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <InvoiceTemplate order={showInvoice} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.print()}>
          Télécharger / Imprimer la facture
        </button>
      </div>
    );
  }

  // Store Selection View
  if (!selectedMagasin && view === 'catalog') {
    return (
      <div className="animate-in">
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Où souhaitez-vous acheter ?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sélectionnez un point de vente pour voir les produits disponibles.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {magasins.map(mag => (
            <div 
              key={mag.id} 
              className="glass-card" 
              style={{ cursor: 'pointer', padding: '20px', border: '1px solid var(--surface-border)' }}
              onClick={() => setSelectedMagasin(mag)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '15px' }}>
                    <Store size={24} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{mag.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{mag.location}</p>
                  </div>
                </div>
                <button className="btn-outline" style={{ width: 'auto', padding: '8px 15px' }}>Choisir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* View Toggle */}
      <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${view === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px' }}
          onClick={() => setView('catalog')}
        >
          <ShoppingCart size={18} /> Boutique
        </button>
        <button 
          className={`btn ${view === 'history' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px' }}
          onClick={() => setView('history')}
        >
          <History size={18} /> Mon Profil
        </button>
      </div>

      {view === 'catalog' ? (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Catalogue {selectedMagasin.name}</h2>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', padding: 0, cursor: 'pointer' }}
                onClick={() => setSelectedMagasin(null)}
              >
                Changer de magasin
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.filter(p => !selectedMagasin.activeProducts || selectedMagasin.activeProducts.includes(p.id)).map(prod => {
              const stock = selectedMagasin.stock[prod.id] || 0;
              const threshold = selectedMagasin.alertThreshold || 30;
              const priceToUse = selectedMagasin.customPrices?.[prod.id] || prod.price;
              
              return (
                <div key={prod.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--secondary-color)' }}>{prod.name}</h4>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{priceToUse} <small>DH</small></p>
                    <p style={{ fontSize: '0.75rem', color: stock < threshold ? 'var(--danger-color)' : 'var(--text-muted)' }}>
                      Stock: {stock} plateaux
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {cart[prod.id] ? (
                      <>
                        <button className="btn-outline" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }} onClick={() => updateCart(prod.id, -1)}>
                          <Minus size={16} />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' }}>{cart[prod.id]}</span>
                      </>
                    ) : null}
                    <button 
                      className={cart[prod.id] ? "btn-outline" : "btn btn-primary"} 
                      style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }} 
                      disabled={stock <= (cart[prod.id] || 0)}
                      onClick={() => updateCart(prod.id, 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(cart).length > 0 && (
            <div className="glass-card animate-in" style={{ position: 'sticky', bottom: '90px', border: '1px solid var(--primary-color)', zIndex: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Commande</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>{calculateTotal()} DH</p>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Livraison Souhaitée (Jour et Heure)</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <button className="btn btn-primary" onClick={handlePlaceOrder}>
                Confirmer l'achat
              </button>
            </div>
          )}
        </section>
      ) : (
        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Mes Achats</h2>
          {clientOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucune commande effectuée.</p>
          ) : (
            clientOrders.map(order => (
              <div key={order.id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 700 }}>#{order.id}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Magasin: {order.magasinName}</p>
                    {order.deliveryDate && <p style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>Pour le: {new Date(order.deliveryDate).toLocaleString()}</p>}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{order.total} DH</p>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '1rem' }}>
                  {order.status === 'delivered' ? (
                    <button className="btn btn-primary" onClick={() => setShowInvoice(order)}>
                      <FileText size={16} /> Voir Facture
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', gridColumn: 'span 2', textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      La facture sera disponible après livraison.
                    </div>
                  )}
                  {order.status === 'pending' && (
                    <button 
                      className="btn btn-outline" 
                      style={{ color: 'var(--danger-color)' }}
                      onClick={() => cancelOrder(order.id, 'client')}
                    >
                      <XCircle size={16} /> Annuler
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
};

export default ClientDashboard;
