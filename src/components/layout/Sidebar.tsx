import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';


const presidentItems = [
  { path: '/dashboard',          icon: '▦',  label: 'Vue générale'  },
  { path: '/dashboard/membres',  icon: '👥', label: 'Adhésions'     },
  { path: '/dashboard/evenements', icon: '📅', label: 'Événements'  },
  { path: '/dashboard/sondages', icon: '📊', label: 'Sondages'      },
  { path: '/dashboard/galerie',  icon: '🖼',  label: 'Galerie'       },
  { path: '/dashboard/settings', icon: '⚙',  label: 'Mon club'      },
];

const adminItems = [
  { path: '/admin',              icon: '▦',  label: 'Vue globale'   },
  { path: '/admin/clubs',        icon: '🏛',  label: 'Clubs'         },
  { path: '/admin/utilisateurs', icon: '👥', label: 'Utilisateurs'  },
  { path: '/admin/evenements',   icon: '📅', label: 'Événements'    },
  { path: '/admin/stats',        icon: '📈', label: 'Statistiques'  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const items = user?.role === 'admin' ? adminItems : presidentItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user ? `${user.firstName[0]}${user.lastName[0]}` : '?'}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">
            {user ? `${user.firstName} ${user.lastName}` : ''}
          </span>
          <span className="sidebar-user-role">
            {user?.role === 'admin' ? 'Super Admin' : 'Président'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-back">
          ← Retour au site
        </Link>
      </div>

    </aside>
  );
}