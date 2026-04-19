import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import PatronDashboard from './pages/PatronDashboard';
import LivreurDashboard from './pages/LivreurDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminTeam from './pages/AdminTeam';
import AdminInventory from './pages/AdminInventory';
import VendeurDashboard from './pages/VendeurDashboard';
import { 
  Users, 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  LogOut, 
  FileText,
  Bell,
  Package
} from 'lucide-react';

const AppContent = () => {
  const { currentUser, logout, loading, notifications, setNotifications } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // Auto-redirect based on role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'patron') setActiveTab('dashboard');
      else if (currentUser.role === 'livreur') setActiveTab('delivery');
      else if (currentUser.role === 'vendeur') setActiveTab('vendeur');
      else setActiveTab('order');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <div className="animate-pulse" style={{ background: 'var(--primary-color)', width: 60, height: 60, borderRadius: '15px' }}></div>
        <p style={{ color: 'var(--text-secondary)', letterSpacing: '2px', fontSize: '0.8rem' }}>CHARGEMENT DU DOMAINE...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }} />
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '1px' }}>LE PETIT DOMAINE</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {currentUser.name} • <span style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-outline" 
            style={{ padding: '10px', borderRadius: '12px', position: 'relative' }}
            onClick={() => {
              setShowNotifications(!showNotifications);
              // Mark all as read when opening
              if (!showNotifications) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', top: -5, right: -5, background: 'var(--danger-color)', 
                color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '0.7rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-color)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            className="btn-outline" 
            style={{ padding: '10px', borderRadius: '12px' }}
            onClick={logout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="glass-card animate-in" style={{ position: 'absolute', top: '80px', right: '1.5rem', width: '300px', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            Notifications
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Fermer</button>
          </h4>
          {notifications.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Aucune notification</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--surface-border)' }}>
                <p style={{ fontSize: '0.85rem' }}>{n.message}</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {new Date(n.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="animate-in">
        {currentUser.role === 'patron' && activeTab === 'dashboard' && <PatronDashboard />}
        {(currentUser.role === 'patron' || currentUser.role === 'livreur') && activeTab === 'delivery' && <LivreurDashboard />}
        {(currentUser.role === 'patron' || currentUser.role === 'client') && activeTab === 'order' && <ClientDashboard />}
        {currentUser.role === 'vendeur' && activeTab === 'vendeur' && <VendeurDashboard />}
        {currentUser.role === 'patron' && activeTab === 'admin' && <AdminTeam />}
        {currentUser.role === 'patron' && activeTab === 'inventory' && <AdminInventory />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {currentUser.role === 'patron' && (
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={24} />
            <span>Synthèse</span>
          </a>
        )}
        {(currentUser.role === 'patron' || currentUser.role === 'livreur') && (
          <a href="#" className={`nav-item ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>
            <Truck size={24} />
            <span>Livraisons</span>
          </a>
        )}
        {(currentUser.role === 'vendeur') && (
          <a href="#" className={`nav-item ${activeTab === 'vendeur' ? 'active' : ''}`} onClick={() => setActiveTab('vendeur')}>
            <LayoutDashboard size={24} />
            <span>Mon Magasin</span>
          </a>
        )}
        {(currentUser.role === 'patron' || currentUser.role === 'client') && (
          <a href="#" className={`nav-item ${activeTab === 'order' ? 'active' : ''}`} onClick={() => setActiveTab('order')}>
            <ShoppingCart size={24} />
            <span>Commandes</span>
          </a>
        )}
        {currentUser.role === 'patron' && (
          <>
            <a href="#" className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
              <Package size={24} />
              <span>Stocks</span>
            </a>
            <a href="#" className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Users size={24} />
              <span>Équipe</span>
            </a>
          </>
        )}
      </nav>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
