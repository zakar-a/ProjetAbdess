import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - User will need to fill these
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('marrakech_eggs_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Local State (Synced with Supabase if available)
  const [products, setProducts] = useState([]);

  const [magasins, setMagasins] = useState([]);

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([
    { id: 'u1', username: 'patron', password: '123', name: 'M. Benkirane', role: 'patron' }
  ]);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    localStorage.setItem('marrakech_eggs_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auth Functions
  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Identifiants incorrects' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Stock Functions (Now Store Specific)
  const refillStock = (magasinId, productId, amount) => {
    setMagasins(prev => prev.map(m => 
      m.id === magasinId 
        ? { ...m, stock: { ...m.stock, [productId]: (m.stock[productId] || 0) + parseInt(amount) } } 
        : m
    ));
    const mag = magasins.find(m => m.id === magasinId);
    const prod = products.find(p => p.id === productId);
    addNotification(`Stock mis à jour : +${amount} ${prod?.name} à ${mag?.name}`);
  };

  // Order Functions
  const placeOrder = (items, clientId, magasinId, vendeurId = null, deliveryDate = null) => {
    const client = users.find(u => u.id === clientId);
    const magasin = magasins.find(m => m.id === magasinId);
    
    const newOrder = {
      id: 'ORD' + Date.now().toString().slice(-6),
      clientId,
      clientName: client?.name || 'Client Inconnu',
      magasinId,
      magasinName: magasin?.name || 'Inconnu',
      vendeurId,
      deliveryDate,
      items, // Array of { productId, quantity }
      total: items.reduce((acc, item) => {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) return acc;
        const priceToUse = (magasin && magasin.customPrices && magasin.customPrices[item.productId]) 
          ? magasin.customPrices[item.productId] 
          : prod.price;
        return acc + (priceToUse * item.quantity);
      }, 0),
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    addNotification(`Nouvelle commande de ${newOrder.clientName}: ${newOrder.total} DH`, 'order');
    return newOrder;
  };

  const confirmOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Deduct Stock from Magasin
    const magasin = magasins.find(m => m.id === order.magasinId);
    if (!magasin) return;

    let stockError = false;
    const updatedStock = { ...magasin.stock };
    
    order.items.forEach(item => {
      if ((updatedStock[item.productId] || 0) < item.quantity) {
        stockError = true;
      } else {
        updatedStock[item.productId] -= item.quantity;
      }
    });

    if (stockError) {
      alert("Stock insuffisant dans ce magasin !");
      return false;
    }

    setMagasins(prev => prev.map(m => m.id === order.magasinId ? { ...m, stock: updatedStock } : m));
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    return true;
  };

  const deliverOrder = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
    addNotification(`Commande livrée avec succès !`, 'success');
  };

  const cancelOrder = (orderId, role) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // 12h rule for clients
    if (role === 'client') {
      const now = new Date();
      if (order.deliveryDate) {
        const deliveryTime = new Date(order.deliveryDate);
        const hoursUntilDelivery = (deliveryTime - now) / (1000 * 60 * 60);
        
        if (hoursUntilDelivery < 12) {
          alert("Action impossible : il reste moins de 12h avant la livraison souhaitée.");
          return;
        }
      } else {
        // Fallback for orders without delivery date (shouldn't happen for clients now)
        const orderDate = new Date(order.timestamp);
        const placedHoursAgo = (now - orderDate) / (1000 * 60 * 60);
        if (placedHoursAgo > 12) {
          alert("Action impossible : le délai de 12h après commande est dépassé.");
          return;
        }
      }
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    addNotification(`Commande modifiée : annulée`, 'error');
  };

  // Notifications
  const addNotification = (message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    
    // Simulate web push if Patron
    if (currentUser?.role === 'patron' && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Domaine Marrakech", { body: message });
      }
    }
  };

  // Stats
  const getStats = (filter = 'day') => {
    const now = new Date();
    let filtered = orders.filter(o => o.status !== 'cancelled');

    if (filter === 'day') {
      filtered = filtered.filter(o => new Date(o.timestamp).toDateString() === now.toDateString());
    } else if (filter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.timestamp) >= oneWeekAgo);
    }

    const totalRevenue = filtered.reduce((sum, o) => sum + o.total, 0);
    const orderCount = filtered.length;
    const trayCount = filtered.reduce((sum, o) => 
      sum + o.items.reduce((s, item) => s + item.quantity, 0), 0
    );

    return { totalRevenue, orderCount, trayCount };
  };

  // User & Inventory management
  const addUser = (userData) => {
    const newUser = { ...userData, id: 'u' + Date.now().toString().slice(-4) };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (userId, data) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    if (currentUser?.id === userId) setCurrentUser({ ...currentUser, ...data });
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addProduct = (prodData) => {
    const newProd = { ...prodData, id: 'c' + Date.now().toString().slice(-4) };
    setProducts(prev => [...prev, newProd]);
  };

  const updateProduct = (prodId, data) => {
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, ...data } : p));
  };

  const deleteProduct = (prodId) => {
    setProducts(prev => prev.filter(p => p.id !== prodId));
  };

  const addMagasin = (magData) => {
    const newMag = { ...magData, id: 'm' + Date.now().toString().slice(-4), stock: {}, customPrices: {}, alertThreshold: 30, activeProducts: magData.activeProducts || [] };
    setMagasins(prev => [...prev, newMag]);
  };

  const updateMagasin = (magId, data) => {
    setMagasins(prev => prev.map(m => m.id === magId ? { ...m, ...data } : m));
  };

  const deleteMagasin = (magId) => {
    setMagasins(prev => prev.filter(m => m.id !== magId));
  };

  return (
    <AppContext.Provider value={{ 
      products, orders, users, currentUser, notifications, magasins,
      login, logout, refillStock, placeOrder, confirmOrder, deliverOrder, cancelOrder,
      getStats, setNotifications, setOrders, loading, error, 
      addUser, updateUser, deleteUser, addProduct, updateProduct, deleteProduct, addMagasin, updateMagasin, deleteMagasin
    }}>
      {children}
    </AppContext.Provider>
  );
};
