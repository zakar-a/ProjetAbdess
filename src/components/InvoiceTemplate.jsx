import React from 'react';
import { Egg } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const InvoiceTemplate = ({ order }) => {
  const { products } = useAppContext();
  
  if (!order) return null;

  // Premium Logo Path (User Provided)
  const logoPath = '/logo.png';

  return (
    <div className="invoice-container" style={{ fontSans: 'Inter, sans-serif', color: '#1a1a1a' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '3px solid #E2725B', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={logoPath} 
            alt="Le Petit Domaine Logo" 
            style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px' }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#2C3E50', letterSpacing: '1px' }}>LE PETIT DOMAINE</h1>
            <p style={{ fontSize: '0.85rem', color: '#E2725B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>Qualité & Fraîcheur du Terroir</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#E2725B', margin: '0 0 5px 0' }}>FACTURE OFFICIELLE</h2>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Réf: #{order.id}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d' }}>Date: {new Date(order.timestamp).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Business Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', background: '#FDF7F5', padding: '20px', borderRadius: '12px' }}>
        <div style={{ width: '45%' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#E2725B', fontWeight: 800, margin: '0 0 8px 0' }}>Expéditeur</p>
          <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 5px 0' }}>Le Petit Domaine S.A.R.L</p>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>Route d'Ourika, Km 12</p>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>Marrakech, Maroc</p>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>Tél: +212 524 00 00 00</p>
          <p style={{ fontSize: '0.85rem', marginTop: '5px', fontWeight: 600 }}>ICE: 001234567890123</p>
        </div>
        <div style={{ width: '45%', textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#E2725B', fontWeight: 800, margin: '0 0 8px 0' }}>Client Destinataire</p>
          <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 5px 0' }}>{order.clientName}</p>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>Partenaire Professionnel</p>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>Livraison: Marrakech</p>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#444' }}>ID Client: {order.clientId}</p>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ background: '#2C3E50', color: 'white' }}>
            <th style={{ textAlign: 'left', padding: '15px', borderRadius: '8px 0 0 0' }}>Description des Produits</th>
            <th style={{ textAlign: 'center', padding: '15px' }}>Unité</th>
            <th style={{ textAlign: 'center', padding: '15px' }}>Quantité</th>
            <th style={{ textAlign: 'right', padding: '15px' }}>P.U. (DH)</th>
            <th style={{ textAlign: 'right', padding: '15px', borderRadius: '0 8px 0 0' }}>Total (DH)</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => {
            const prod = products.find(p => p.id === item.productId);
            return (
              <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#F9F9F9' }}>
                <td style={{ padding: '15px', borderBottom: '1px solid #EEE' }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{prod?.name || 'Œufs Calibre ' + item.productId}</p>
                  <p style={{ fontSize: '0.75rem', color: '#7f8c8d', margin: 0 }}>Frais du jour - Qualité A</p>
                </td>
                <td style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid #EEE', color: '#7f8c8d' }}>Plateau</td>
                <td style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid #EEE', fontWeight: 700 }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '15px', borderBottom: '1px solid #EEE' }}>{prod?.price || 0}</td>
                <td style={{ textAlign: 'right', padding: '15px', borderBottom: '1px solid #EEE', fontWeight: 800 }}>{(prod?.price || 0) * item.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '60px' }}>
        <div style={{ width: '300px', background: '#FDF7F5', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '1rem' }}>
            <span style={{ color: '#7f8c8d' }}>Sous-total HT:</span>
            <span style={{ fontWeight: 700 }}>{order.total} DH</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#7f8c8d' }}>
            <span>TVA (Agricole 0%):</span>
            <span>0.00 DH</span>
          </div>
          <div style={{ borderTop: '2px solid #EEE', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.4rem', color: '#E2725B' }}>
            <span>TOTAL TTC:</span>
            <span>{order.total} DH</span>
          </div>
        </div>
      </div>

      {/* Terms & Signature */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '0.8rem', color: '#7f8c8d', maxWidth: '350px', fontStyle: 'italic' }}>
          <p style={{ fontWeight: 700, color: '#E2725B', marginBottom: '5px' }}>CONSERVATION :</p>
          <p>Pour garantir une fraîcheur optimale, veuillez conserver vos œufs entre 4°C et 12°C. Produit issu de l'agriculture raisonnée de notre domaine.</p>
          <p style={{ marginTop: '15px' }}>Merci de votre fidélité.</p>
        </div>
        <div style={{ textAlign: 'center', width: '250px', position: 'relative' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Le Gérant</p>
          
          {/* CSS Stamp */}
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%) rotate(-12deg)', 
            border: '4px solid rgba(226, 114, 91, 0.6)', 
            borderRadius: '50%', 
            width: '130px', 
            height: '130px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            color: 'rgba(226, 114, 91, 0.8)',
            zIndex: 1
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Le Petit</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>Domaine</span>
            <span style={{ fontSize: '0.65rem', marginTop: '5px', borderTop: '1px solid rgba(226, 114, 91, 0.6)', paddingTop: '5px' }}>SARL AU</span>
          </div>

          {/* Cursive Signature */}
          <div style={{ 
            fontFamily: "'Brush Script MT', 'Bradley Hand', cursive", 
            fontSize: '2.5rem', 
            color: '#2C3E50', 
            marginBottom: '10px',
            position: 'relative',
            zIndex: 2,
            transform: 'rotate(-5deg)'
          }}>
            Benkirane
          </div>

          <div style={{ borderBottom: '2px solid #2C3E50', width: '200px', margin: '0 auto', position: 'relative', zIndex: 3 }}></div>
          <p style={{ fontSize: '0.7rem', color: '#bdc3c7', marginTop: '8px' }}>Signature et Cachet Officiel</p>
        </div>
      </div>

      <div style={{ marginTop: '80px', textAlign: 'center', fontSize: '0.75rem', color: '#bdc3c7', borderTop: '2px solid #FDF7F5', paddingTop: '15px' }}>
        LE PETIT DOMAINE SARL AU • Capitale 100.000 DH • RC MARRAKECH 123456 • IF 00123456 • CNSS 1234567
      </div>
    </div>
  );
};

export default InvoiceTemplate;
