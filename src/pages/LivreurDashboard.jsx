import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Truck, CheckCircle, MapPin, ClipboardList } from 'lucide-react';

const LivreurDashboard = () => {
  const { orders, products, deliverOrder } = useAppContext();

  // For livreurs, we show 'confirmed' orders that need to be delivered
  const deliveryQueue = orders.filter(o => o.status === 'confirmed');
  const deliveredToday = orders.filter(o => o.status === 'delivered' && new Date(o.timestamp).toDateString() === new Date().toDateString());

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Truck size={24} color="var(--primary-color)" /> Tournée de Livraison
        </h2>
        
        {deliveryQueue.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <ClipboardList size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)' }}>Aucune livraison à effectuer pour le moment.</p>
          </div>
        ) : (
          deliveryQueue.map(order => (
            <div key={order.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ color: 'var(--secondary-color)' }}>{order.clientName}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <MapPin size={12} /> {order.magasinName}
                  </div>
                </div>
                <div className="badge badge-confirmed">Prêt pour Livraison</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Détails du Chargement</p>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem' }}>{products.find(p => p.id === item.productId)?.name}</span>
                    <span style={{ fontWeight: 700 }}>{item.quantity} plateaux</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--surface-border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Total à percevoir:</span>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>{order.total} DH</span>
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => deliverOrder(order.id)}
              >
                <CheckCircle size={18} /> Confirmer la Livraison
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Historique du Jour</h3>
        {deliveredToday.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Aucune livraison terminée aujourd'hui.</p>
        ) : (
          deliveredToday.map(order => (
            <div key={order.id} className="glass-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order.clientName}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Montant encaissé : {order.total} DH</p>
              </div>
              <div className="badge badge-delivered">Livré</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LivreurDashboard;
