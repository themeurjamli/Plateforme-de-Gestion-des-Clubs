import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import logo from '../assets/LOGO1.png'; 

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    const success = login(email, password);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Email introuvable ou compte banni.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        
        <div className="auth-logo">
          <img src={logo} alt="Logo" />
        </div>
        <h1 className="auth-title">Bon retour !</h1>
        <p className="auth-subtitle">Connecte-toi à ton compte</p>

        
        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

        </form>

        
        <p className="auth-footer">
          Pas encore de compte ?{' '}
          <Link to="/register">S'inscrire</Link>
        </p>

        
        <div className="auth-hint">
          <p className="auth-hint-title">Emails de test :</p>
          <p>admin@test.com → Super Admin</p>
          <p>president@test.com → Président</p>
          <p>member@test.com → Membre</p>
        </div>

      </div>
    </div>
  );
}