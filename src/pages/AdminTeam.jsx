import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, UserPlus, Shield, ShoppingBag, Truck, Mail, Phone, Trash2, Edit3, Lock } from 'lucide-react';

const AdminTeam = () => {
  const { users, addUser, updateUser, deleteUser, magasins, currentUser } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '123',
    role: 'livreur',
    magasinId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, newUser);
      setEditingUser(null);
    } else {
      addUser(newUser);
    }
    setShowAddModal(false);
    setNewUser({ name: '', username: '', password: '123', role: 'livreur', magasinId: '' });
  };

  const handleEdit = (user) => {
    setNewUser({ 
      name: user.name, 
      username: user.username, 
      password: user.password, 
      role: user.role,
      magasinId: user.magasinId || '' 
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce compte définitivement ?")) {
      deleteUser(id);
    }
  };

  const employees = users.filter(u => u.role === 'employee' || u.role === 'livreur' || u.role === 'vendeur' || u.role === 'patron');
  const clients = users.filter(u => u.role === 'client');

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem' }}>Gestion de l'Équipe & Clients</h2>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Ajouter
        </button>
      </div>

      {/* Employees Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} /> Personnel & Administration
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {employees.map(user => (
            <div key={user.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '45px', height: '45px', borderRadius: '12px', 
                  background: user.role === 'patron' ? 'var(--secondary-color)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Users size={20} color={user.role === 'patron' ? 'white' : 'var(--text-secondary)'} />
                </div>
                <div>
                  <p style={{ fontWeight: 700 }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    @{user.username} • <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    {user.magasinId && ` • ${magasins.find(m => m.id === user.magasinId)?.name}`}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px' }} onClick={() => handleEdit(user)}>
                  <Edit3 size={16} />
                </button>
                {user.role !== 'patron' && (
                  <button 
                    className="btn-outline" 
                    style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px', color: 'var(--danger-color)' }}
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clients Section */}
      <section>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={16} /> Clients Professionnels
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {clients.map(user => (
            <div key={user.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '45px', height: '45px', borderRadius: '12px', 
                  background: 'rgba(226, 114, 91, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Truck size={20} color="var(--primary-color)" />
                </div>
                <div>
                  <p style={{ fontWeight: 700 }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Point de vente • ID: {user.id}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px' }} onClick={() => handleEdit(user)}>
                  <Edit3 size={16} />
                </button>
                <button 
                  className="btn-outline" 
                  style={{ width: '35px', height: '35px', padding: 0, borderRadius: '8px', color: 'var(--danger-color)' }}
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card animate-in" style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Modifier le Compte' : 'Nouveau Membre'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom Complet</label>
                <input 
                  type="text" className="form-input" required 
                  value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                  placeholder="ex: Ahmed Mansouri"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <input 
                  type="text" className="form-input" required 
                  value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})}
                  placeholder="ex: amansouri"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select 
                  className="form-input" 
                  style={{ background: 'var(--surface-color)' }}
                  value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="livreur">Livreur</option>
                  <option value="vendeur">Vendeur (Magasin)</option>
                  <option value="client">Client Professionnel</option>
                  {currentUser.role === 'patron' && <option value="patron">Administrateur</option>}
                </select>
              </div>
              {(newUser.role === 'vendeur' || newUser.role === 'client') && (
                <div className="form-group">
                  <label className="form-label">Magasin associé</label>
                  <select 
                    className="form-input" 
                    style={{ background: 'var(--surface-color)' }}
                    required
                    value={newUser.magasinId} onChange={e => setNewUser({...newUser, magasinId: e.target.value})}
                  >
                    <option value="">Sélectionner un magasin...</option>
                    {magasins.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
              {editingUser && (
                <div className="form-group">
                  <label className="form-label">Réinitialiser le mot de passe (Laisser vide pour garder l'actuel)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '10px', top: '16px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '35px' }}
                      placeholder="Nouveau mot de passe"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          setNewUser({ ...newUser, password: val });
                        } else {
                          setNewUser({ ...newUser, password: editingUser.password });
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="grid-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
