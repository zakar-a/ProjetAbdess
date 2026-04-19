import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, User, Egg } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      padding: '2rem',
      background: 'radial-gradient(circle at top right, #E2725B22, transparent), radial-gradient(circle at bottom left, #D4AF3711, transparent)'
    }}>
      <div className="animate-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <img 
          src="/logo.png" 
          alt="Le Petit Domaine" 
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '24px', 
            marginBottom: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            objectFit: 'cover'
          }} 
        />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bienvenue</h1>
        <p style={{ color: 'var(--text-secondary)' }}>LE PETIT DOMAINE</p>
      </div>

      <form className="animate-in" onSubmit={handleSubmit} style={{ animationDelay: '0.1s' }}>
        <div className="glass-card">
          <div className="form-group">
            <label className="form-label">Identifiant</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Votre nom d'utilisateur"
                style={{ paddingLeft: '45px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                style={{ paddingLeft: '45px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Se Connecter
          </button>
        </div>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
        Système de Gestion Agricole v1.0<br/>
        &copy; 2026 Le Petit Domaine
      </p>
    </div>
  );
};

export default LoginPage;
