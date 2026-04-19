import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Plus, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Store,
  Users,
  User,
  BarChart2,
  FileText,
  Download,
  ArrowLeft
} from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';

const PatronDashboard = () => {
  const { products, orders, getStats, confirmOrder, cancelOrder, magasins, users } = useAppContext();
  const [filter, setFilter] = useState('day');
  const [showInvoice, setShowInvoice] = useState(null);

  const stats = getStats(filter);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const historicalOrders = orders.filter(o => o.status !== 'pending');

  const now = new Date();
  let filteredOrders = orders.filter(o => o.status !== 'cancelled');
  if (filter === 'day') {
    filteredOrders = filteredOrders.filter(o => new Date(o.timestamp).toDateString() === now.toDateString());
  } else if (filter === 'week') {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredOrders = filteredOrders.filter(o => new Date(o.timestamp) >= oneWeekAgo);
  }

  const vendorSales = {};
  const clientSales = {};

  filteredOrders.forEach(o => {
    if (o.vendeurId) {
      vendorSales[o.vendeurId] = (vendorSales[o.vendeurId] || 0) + o.total;
    }
    if (o.clientId) {
      clientSales[o.clientId] = (clientSales[o.clientId] || 0) + o.total;
    }
  });

  const sortedClients = Object.entries(clientSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, total]) => ({ client: users.find(u => u.id === id), total }));

  const sortedVendors = Object.entries(vendorSales)
    .sort(([, a], [, b]) => b - a)
    .map(([id, total]) => ({ vendor: users.find(u => u.id === id), total }));

  const globalStock = products.map(p => {
    const total = magasins.reduce((sum, m) => sum + (m.stock[p.id] || 0), 0);
    return { name: p.name, total, id: p.id };
  });
  const maxStock = Math.max(...globalStock.map(s => s.total), 1);

  const exportToExcel = () => {
    // Basic CSV generation
    const headers = ["ID Commande", "Date/Heure", "Point de Vente", "Client", "Vendeur", "Statut", "Total (DH)"];
    
    const rows = filteredOrders.map(o => {
      const vendeur = users.find(u => u.id === o.vendeurId)?.name || 'N/A';
      const date = new Date(o.timestamp).toLocaleString();
      return [
        o.id,
        `"${date}"`,
        `"${o.magasinName}"`,
        `"${o.clientName}"`,
        `"${vendeur}"`,
        o.status,
        o.total
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ventes_marrakech_eggs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showInvoice) {
    return (
      <div className="animate-in">
        <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setShowInvoice(null)}>
          <ArrowLeft size={16} /> Retour au tableau de bord
        </button>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
          <InvoiceTemplate order={showInvoice} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.print()}>
          Télécharger / Imprimer la facture
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Quick Stats - Premium Activity Synthesis */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Synthèse de l'Activité Global</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={exportToExcel}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid var(--surface-border)',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Download size={14} /> Exporter Excel
            </button>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ 
                background: 'var(--surface-color)', 
                color: 'white', 
                border: '1px solid var(--surface-border)',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem'
              }}
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="stat-label">Chiffre d'Affaires</span>
              <TrendingUp size={16} color="var(--primary-color)" />
            </div>
            <span className="stat-value text-terracotta">{stats.totalRevenue} <small style={{ fontSize: '1rem' }}>DH</small></span>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="stat-label">Commandes Totales</span>
              <ShoppingCart size={16} color="var(--secondary-color)" />
            </div>
            <span className="stat-value text-gold">{stats.orderCount}</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Top Vendeurs */}
        <section>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} /> CA par Vendeur
          </h3>
          <div className="glass-card" style={{ padding: '15px' }}>
            {sortedVendors.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune donnée</p> : null}
            {sortedVendors.map(({vendor, total}) => (
              <div key={vendor?.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem' }}>{vendor?.name || 'Inconnu'}</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{total} DH</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Clients */}
        <section>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} /> Meilleurs Clients
          </h3>
          <div className="glass-card" style={{ padding: '15px' }}>
            {sortedClients.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune donnée</p> : null}
            {sortedClients.map(({client, total}) => (
              <div key={client?.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem' }}>{client?.name || 'Inconnu'}</span>
                <span style={{ fontWeight: 800, color: 'var(--secondary-color)' }}>{total} DH</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Global Stock Diagram */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} /> Diagramme du Stock Global
        </h3>
        <div className="glass-card" style={{ padding: '20px' }}>
          {globalStock.map(stock => {
            const percentage = (stock.total / maxStock) * 100;
            return (
              <div key={stock.id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                  <span>{stock.name}</span>
                  <span style={{ fontWeight: 'bold' }}>{stock.total} plateaux</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    background: stock.total < 100 ? 'var(--danger-color)' : 'var(--primary-color)',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Magasins Performance Snapshot */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={18} /> Performance des Points de Vente
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {magasins.map(mag => {
            const magOrders = orders.filter(o => o.magasinId === mag.id && o.status !== 'cancelled');
            const magRevenue = magOrders.reduce((sum, o) => sum + o.total, 0);
            return (
              <div key={mag.id} className="glass-card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{mag.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mag.location}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{magRevenue} DH</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{magOrders.length} commandes</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pending Orders Queue */}
      <section>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} /> File d'Attente des Commandes
        </h3>
        {pendingOrders.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p>Toutes les commandes sont traitées.</p>
          </div>
        ) : (
          pendingOrders.map(order => (
            <div key={order.id} className="glass-card animate-in" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span className="badge badge-pending">En attente</span>
                  <p style={{ fontWeight: 700, marginTop: '10px', fontSize: '1.05rem' }}>{order.clientName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Point: {order.magasinName} • #{order.id}</p>
                  {order.deliveryDate && <p style={{ fontSize: '0.8rem', color: 'var(--danger-color)', fontWeight: 'bold', marginTop: '5px' }}>Livraison: {new Date(order.deliveryDate).toLocaleString()}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>{order.total} DH</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {order.items.reduce((s, i) => s + i.quantity, 0)} plateaux
                  </p>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: '1.5rem' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{products.find(p => p.id === item.productId)?.name}</span>
                    <span style={{ fontWeight: 600 }}>x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="grid-2">
                <button 
                  className="btn btn-outline" 
                  style={{ color: 'var(--danger-color)', borderColor: 'rgba(192, 57, 43, 0.2)' }}
                  onClick={() => cancelOrder(order.id, 'patron')}
                >
                  <XCircle size={18} /> Refuser
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => confirmOrder(order.id)}
                >
                  <CheckCircle2 size={18} /> Valider
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Historical Orders */}
      <section style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Historique & Factures
        </h3>
        {historicalOrders.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <p>Aucune facture disponible.</p>
          </div>
        ) : (
          historicalOrders.map(order => (
            <div key={order.id} className="glass-card" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700 }}>{order.clientName}</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                  <span className={`badge ${order.status === 'cancelled' ? 'badge-cancelled' : 'badge-completed'}`}>
                    {order.status === 'cancelled' ? 'Annulée' : (order.status === 'delivered' ? 'Livrée' : 'Validée')}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.timestamp).toLocaleDateString()} • #{order.id}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{order.total} DH</p>
                </div>
                {order.status !== 'cancelled' && (
                  <button 
                    className="btn btn-outline"
                    style={{ padding: '8px', borderRadius: '8px' }}
                    onClick={() => setShowInvoice(order)}
                    title="Voir la facture"
                  >
                    <FileText size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default PatronDashboard;
