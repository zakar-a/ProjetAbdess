import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Plus, 
  Store, 
  Package, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  ArrowRight,
  Database,
  MapPin,
  Tag
} from 'lucide-react';

const AdminInventory = () => {
  const { products, magasins, addProduct, updateProduct, deleteProduct, addMagasin, updateMagasin, deleteMagasin, refillStock } = useAppContext();
  const [view, setView] = useState('products'); // 'products' or 'magasins'
  const [showAddProd, setShowAddProd] = useState(false);
  const [showAddMag, setShowAddMag] = useState(false);
  const [showRefill, setShowRefill] = useState(null); // { magId, prodId }
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingMagasin, setEditingMagasin] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', location: '', alertThreshold: 30, customPrices: {}, activeProducts: [] });
  const [refillAmount, setRefillAmount] = useState('');

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, { name: formData.name, price: parseFloat(formData.price) });
      setEditingProduct(null);
    } else {
      addProduct({ name: formData.name, price: parseFloat(formData.price) });
    }
    setShowAddProd(false);
    setFormData({ name: '', price: '', location: '', alertThreshold: 30, customPrices: {}, activeProducts: [] });
  };

  const handleEditProduct = (prod) => {
    setFormData({ name: prod.name, price: prod.price, location: '' });
    setEditingProduct(prod);
    setShowAddProd(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Supprimer ce produit définitivement ?")) {
      deleteProduct(id);
    }
  };

  const handleAddMagasin = (e) => {
    e.preventDefault();
    if (editingMagasin) {
      updateMagasin(editingMagasin.id, { name: formData.name, location: formData.location, alertThreshold: parseInt(formData.alertThreshold), customPrices: formData.customPrices, activeProducts: formData.activeProducts });
      setEditingMagasin(null);
    } else {
      addMagasin({ name: formData.name, location: formData.location, alertThreshold: parseInt(formData.alertThreshold), customPrices: formData.customPrices, activeProducts: formData.activeProducts });
    }
    setShowAddMag(false);
    setFormData({ name: '', price: '', location: '', alertThreshold: 30, customPrices: {}, activeProducts: [] });
  };

  const handleEditMagasin = (mag) => {
    setFormData({ name: mag.name, price: '', location: mag.location, alertThreshold: mag.alertThreshold || 30, customPrices: mag.customPrices || {}, activeProducts: mag.activeProducts || products.map(p=>p.id) });
    setEditingMagasin(mag);
    setShowAddMag(true);
  };

  const handleDeleteMagasin = (id) => {
    if (window.confirm("Supprimer ce magasin définitivement ?")) {
      deleteMagasin(id);
    }
  };

  const handleRefill = (e) => {
    e.preventDefault();
    if (showRefill && refillAmount) {
      refillStock(showRefill.magId, showRefill.prodId, refillAmount);
      setShowRefill(null);
      setRefillAmount('');
    }
  };

  return (
    <div className="animate-in">
      <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${view === 'products' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px' }}
          onClick={() => setView('products')}
        >
          <Tag size={18} /> Catalogue Produits
        </button>
        <button 
          className={`btn ${view === 'magasins' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px' }}
          onClick={() => setView('magasins')}
        >
          <Store size={18} /> Gestion Magasins
        </button>
      </div>

      {view === 'products' ? (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Catalogue des Œufs</h3>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setShowAddProd(true)}>
              <Plus size={18} /> Nouveau Produit
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map(prod => (
              <div key={prod.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                    width: '45px', height: '45px', borderRadius: '12px', 
                    background: 'rgba(226, 114, 91, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Package size={20} color="var(--primary-color)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700 }}>{prod.name}</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)' }}>{prod.price} <small>DH</small></p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-outline" style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px' }} onClick={() => handleEditProduct(prod)}>
                    <Edit3 size={16} />
                  </button>
                  <button className="btn-outline" style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px', color: 'var(--danger-color)' }} onClick={() => handleDeleteProduct(prod.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Points de Vente</h3>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setShowAddMag(true)}>
              <Plus size={18} /> Nouveau Magasin
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {magasins.map(mag => (
              <div key={mag.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Store size={24} color="var(--secondary-color)" />
                    <div>
                      <h4 style={{ fontSize: '1.1rem' }}>{mag.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} inline /> {mag.location}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-outline" style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px' }} onClick={() => handleEditMagasin(mag)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="btn-outline" style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px', color: 'var(--danger-color)' }} onClick={() => handleDeleteMagasin(mag.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Niveaux de Stock</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {products.filter(p => !mag.activeProducts || mag.activeProducts.includes(p.id)).map(prod => (
                      <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>{prod.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`stock-pill ${mag.stock[prod.id] < (mag.alertThreshold || 30) ? 'stock-low' : 'stock-ok'}`}>
                            {mag.stock[prod.id] || 0} plateaux
                          </span>
                          <button 
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
                            onClick={() => setShowRefill({ magId: mag.id, prodId: prod.id })}
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      {(showAddProd || showAddMag) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card animate-in" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              {showAddProd ? (editingProduct ? 'Modifier le Produit' : 'Nouveau Produit') : (editingMagasin ? 'Modifier le Magasin' : 'Nouveau Magasin')}
            </h3>
            <form onSubmit={showAddProd ? handleAddProduct : handleAddMagasin}>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input 
                  type="text" className="form-input" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder={showAddProd ? "ex: Calibre Extra" : "ex: Magasin Sidi Youssef"}
                />
              </div>
              {showAddProd ? (
                <div className="form-group">
                  <label className="form-label">Prix (DH)</label>
                  <input 
                    type="number" step="0.5" className="form-input" required 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="35"
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Localisation (Quartier)</label>
                    <input 
                      type="text" className="form-input" required 
                      value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="ex: Médina"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Seuil d'alerte stock (plateaux)</label>
                    <input 
                      type="number" className="form-input" required 
                      value={formData.alertThreshold} onChange={e => setFormData({...formData, alertThreshold: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Catalogue & Prix Spécifiques (DH)</label>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {products.map(p => {
                        const isActive = formData.activeProducts.includes(p.id);
                        return (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isActive ? 1 : 0.5 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', flex: 1 }}>
                              <input 
                                type="checkbox" 
                                checked={isActive}
                                onChange={(e) => {
                                  const newActive = e.target.checked 
                                    ? [...formData.activeProducts, p.id] 
                                    : formData.activeProducts.filter(id => id !== p.id);
                                  setFormData({ ...formData, activeProducts: newActive });
                                }}
                              />
                              {p.name} <small>({p.price} DH)</small>
                            </label>
                            <input 
                              type="number" step="0.5" className="form-input" style={{ width: '80px', padding: '5px' }}
                              placeholder="Prix par défaut"
                              disabled={!isActive}
                              value={formData.customPrices[p.id] || ''}
                              onChange={e => setFormData({
                                ...formData, 
                                customPrices: { 
                                  ...formData.customPrices, 
                                  [p.id]: e.target.value ? parseFloat(e.target.value) : undefined 
                                }
                              })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
              <div className="grid-2">
                <button type="button" className="btn btn-outline" onClick={() => { setShowAddProd(false); setShowAddMag(false); setEditingProduct(null); setEditingMagasin(null); }}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editingProduct || editingMagasin ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRefill && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card animate-in" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                <Plus size={24} color="var(--primary-color)" />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Réapprovisionnement</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ajuster le stock pour {products.find(p => p.id === showRefill.prodId)?.name} à {magasins.find(m => m.id === showRefill.magId)?.name}
                </p>
              </div>
            </div>
            <form onSubmit={handleRefill}>
              <div className="form-group">
                <label className="form-label">Quantité à ajouter (en plateaux)</label>
                <input 
                  type="number" className="form-input" required 
                  value={refillAmount} onChange={e => setRefillAmount(e.target.value)}
                  placeholder="ex: 100"
                  autoFocus
                />
              </div>
              <div className="grid-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowRefill(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Valider le Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
