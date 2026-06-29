import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import StatCard from '../../components/ui/Statcard';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {
  mockClubs,
  mockMemberships,
  mockEvents,
  mockPolls,
} from '../../data/mockData';
import './Dashboard.css';

export default function DashboardHome() {
  const { user } = useAuth();

  
  const club = mockClubs.find((c) => c.presidentId === user?.id);

  if (!club) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <p className="dash-no-club">
            Vous n'avez pas encore de club. Créez-en un !
          </p>
        </div>
      </div>
    );
  }

  const members     = mockMemberships.filter((m) => m.clubId === club.id && m.status === 'member');
  const pending     = mockMemberships.filter((m) => m.clubId === club.id && m.status === 'pending');
  const events      = mockEvents.filter((e) => e.clubId === club.id);
  const upcoming    = events.filter((e) => e.status === 'upcoming');
  const polls       = mockPolls.filter((p) => p.clubId === club.id);
  const activePolls = polls.filter((p) => p.status === 'active');

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">

        <PageHeader
          title={`Bonjour, ${user?.firstName} 👋`}
          subtitle={`Tableau de bord — ${club.name}`}
        />

        <div className="dash-stats-grid">
          <StatCard label="Membres"       value={members.length}     icon="👥" color="blue"    />
          <StatCard label="En attente"    value={pending.length}     icon="⏳" color="warning" />
          <StatCard label="Événements"    value={upcoming.length}    icon="📅" color="green"   />
          <StatCard label="Sondages actifs" value={activePolls.length} icon="📊" color="blue"  />
        </div>

        {pending.length > 0 && (
          <div className="dash-alert">
            <span>🔔</span>
            <span>
              <strong>{pending.length} demande{pending.length > 1 ? 's' : ''}</strong> d'adhésion en attente de validation
            </span>
            <Link to="/dashboard/membres">
              <Button variant="primary" size="sm">Voir →</Button>
            </Link>
          </div>
        )}

        <div className="dash-two-cols">
          <div className="dash-section card">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Prochains événements</h2>
              <Link to="/dashboard/evenements">
                <Button variant="secondary" size="sm">Gérer</Button>
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <p className="dash-empty">Aucun événement à venir.</p>
            ) : (
              <div className="dash-events-list">
                {upcoming.slice(0, 3).map((event) => (
                  <div key={event.id} className="dash-event-row">
                    <div className="dash-event-date">
                      <span className="dash-event-day">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="dash-event-month">
                        {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="dash-event-info">
                      <span className="dash-event-name">{event.title}</span>
                      <span className="dash-event-meta">
                        {event.registeredCount}
                        {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} inscrits · {event.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="dash-section-footer">
              <Link to="/dashboard/evenements">
                <Button variant="primary" size="sm" fullWidth>
                  + Créer un événement
                </Button>
              </Link>
            </div>
          </div>

          
          <div className="dash-section card">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Demandes d'adhésion</h2>
              <Link to="/dashboard/membres">
                <Button variant="secondary" size="sm">Tout voir</Button>
              </Link>
            </div>

            {pending.length === 0 ? (
              <p className="dash-empty">Aucune demande en attente. 🎉</p>
            ) : (
              <div className="dash-pending-list">
                {pending.slice(0, 3).map((m) => {
                  const u = mockMemberships.find((mb) => mb.id === m.id);
                  return (
                    <div key={m.id} className="dash-pending-row">
                      <div className="dash-pending-avatar">
                        {m.userId[0].toUpperCase()}
                      </div>
                      <div className="dash-pending-info">
                        <span className="dash-pending-name">
                          Utilisateur {m.userId}
                        </span>
                        <span className="dash-pending-date">
                          Demande du {m.joinedAt}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="dash-section-footer">
              <Link to="/dashboard/membres">
                <Button variant="secondary" size="sm" fullWidth>
                  Gérer les adhésions
                </Button>
              </Link>
            </div>
          </div>

        </div>

      
        <div className="card dash-club-info">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Mon club</h2>
            <Link to="/dashboard/settings">
              <Button variant="secondary" size="sm">⚙ Modifier</Button>
            </Link>
          </div>
          <div className="dash-club-details">
            <div className="dash-club-logo">{club.name[0]}</div>
            <div>
              <p className="dash-club-name">{club.name}</p>
              <p className="dash-club-desc">{club.description}</p>
              <p className="dash-club-cat">Catégorie : {club.category}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}