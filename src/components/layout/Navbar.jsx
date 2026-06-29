import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import logo from '../../assets/LOGO1.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">

        
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Clubs" />
        </Link>

        
        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            Découvrir
          </Link>

          {user && (
            <Link to="/mes-clubs" className="navbar-link">
              Mes clubs
            </Link>
          )}

          {user?.role === 'president' && (
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-link">
              Admin
            </Link>
          )}
        </div>

        
        <div className="navbar-user">
          {user ? (
            <>
              <Link to="/profile" className="navbar-avatar" title={`${user.firstName} ${user.lastName}`}>
                {initials}
              </Link>
              <button className="navbar-logout" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Connexion
              </Link>
              <Link to="/register" className="navbar-btn-register">
                S'inscrire
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}