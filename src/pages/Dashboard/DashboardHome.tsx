import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import StatCard from '../../components/ui/Statcard';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getClubByIdAPI } from '../../services/club.service';
import { getClubMembersAPI, getClubPendingAPI } from '../../services/club.service';
import { getClubEventsAPI } from '../../services/event.service';
import { getClubPollsAPI } from '../../services/poll.service';
import './Dashboard.css';

export default function DashboardHome() {
  const { user } = useAuth();

  const [club,     setClub]     = useState<any>(null);
  const [members,  setMembers]  = useState<any[]>([]);
  const [pending,  setPending]  = useState<any[]>([]);
  const [events,   setEvents]   = useState<any[]>([]);
  const [polls,    setPolls]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?.clubId) { setLoading(false); return; }

    const fetchAll = async () => {
      try {
        const clubId = user.clubId as string;
        const [clubData, membersData, pendingData, eventsData, pollsData] =
          await Promise.all([
            getClubByIdAPI(clubId),
            getClubMembersAPI(clubId),
            getClubPendingAPI(clubId),
            getClubEventsAPI(clubId),
            getClubPollsAPI(clubId),
          ]);
        setClub(clubData);
        setMembers(membersData);
        setPending(pendingData);
        setEvents(eventsData);
        setPolls(pollsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <p className="dash-empty">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user?.clubId || !club) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <p className="dash-no-club">
            Vous n'avez pas encore de club.{' '}
            <Link to="/creer-club" style={{ color: 'var(--primary)' }}>
              Créer un club →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const upcoming    = events.filter((e: any) => e.status === 'upcoming');
  const activePolls = polls.filter((p: any)  => p.status === 'active');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title={`Bonjour, ${user?.firstName} 👋`}
          subtitle={`Tableau de bord — ${club.name}`}
        />

        <div className="dash-stats-grid">
          <StatCard label="Membres"        value={members.length}     icon="👥" color="blue"    />
          <StatCard label="En attente"     value={pending.length}     icon="⏳" color="warning" />
          <StatCard label="Événements"     value={upcoming.length}    icon="📅" color="green"   />
          <StatCard label="Sondages actifs" value={activePolls.length} icon="📊" color="blue"   />
        </div>

        {pending.length > 0 && (
          <div className="dash-alert">
            <span>🔔</span>
            <span>
              <strong>{pending.length} demande{pending.length > 1 ? 's' : ''}</strong> d'adhésion en attente
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
                {upcoming.slice(0, 3).map((event: any) => (
                  <div key={event._id} className="dash-event-row">
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
                        {event.registeredCount ?? 0}
                        {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} inscrits · {event.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="dash-section-footer">
              <Link to="/dashboard/evenements">
                <Button variant="primary" size="sm" fullWidth>+ Créer un événement</Button>
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
                {pending.slice(0, 3).map((m: any) => (
                  <div key={m._id} className="dash-pending-row">
                    <div className="dash-pending-avatar">
                      {m.userId?.firstName?.[0]}{m.userId?.lastName?.[0]}
                    </div>
                    <div className="dash-pending-info">
                      <span className="dash-pending-name">
                        {m.userId?.firstName} {m.userId?.lastName}
                      </span>
                      <span className="dash-pending-date">
                        {m.userId?.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="dash-section-footer">
              <Link to="/dashboard/membres">
                <Button variant="secondary" size="sm" fullWidth>Gérer les adhésions</Button>
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