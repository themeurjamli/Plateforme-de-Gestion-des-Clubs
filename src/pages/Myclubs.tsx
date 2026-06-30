import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge, MembershipStatusBadge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { mockClubs, mockMemberships, mockEvents, mockRegistrations } from '../data/mockData';
import './Myclubs.css';

export default function MyClubsPage() {
  const { user } = useAuth();

  const [registrations, setRegistrations] = useState([...mockRegistrations]);

  if (!user) return null;

  // Mes adhésions
  const myMemberships = mockMemberships.filter((m) => m.userId === user.id);
  const myClubs   = myMemberships.filter((m) => m.status === 'member');
  const myPending = myMemberships.filter((m) => m.status === 'pending');

  // Événements à venir des clubs dont je suis membre
  const myClubIds    = myClubs.map((m) => m.clubId);
  const myEvents     = mockEvents.filter(
    (e) => myClubIds.includes(e.clubId) && e.status === 'upcoming'
  );

  const isRegistered = (eventId: string) =>
    registrations.some((r) => r.eventId === eventId && r.userId === user.id);

  const handleRegister = (eventId: string, title: string) => {
    if (isRegistered(eventId)) {
      // Désinscrire
      if (!window.confirm(`Se désinscrire de "${title}" ?`)) return;
      setRegistrations((prev) =>
        prev.filter((r) => !(r.eventId === eventId && r.userId === user.id))
      );
    } else {
      // S'inscrire
      setRegistrations((prev) => [
        ...prev,
        {
          id:           `r${Date.now()}`,
          eventId,
          userId:       user.id,
          registeredAt: new Date().toISOString().split('T')[0],
        },
      ]);
    }
  };

  const getClub = (clubId: string) => mockClubs.find((c) => c.id === clubId);

  return (
    <div className="myclubs-page">
      <Navbar />

      <div className="myclubs-container">
        <h1 className="myclubs-title">Mes clubs</h1>

        {/* ── MES CLUBS ─────────────────────────────────── */}
        <section className="myclubs-section">
          <h2 className="myclubs-section-title">
            Clubs rejoints ({myClubs.length})
          </h2>

          {myClubs.length === 0 ? (
            <div className="card myclubs-empty">
              <span>🏛</span>
              <p>Tu n'as rejoint aucun club pour le moment.</p>
              <Link to="/clubs">
                <Button variant="primary">Explorer les clubs</Button>
              </Link>
            </div>
          ) : (
            <div className="myclubs-grid">
              {myClubs.map((m) => {
                const club = getClub(m.clubId);
                if (!club) return null;
                return (
                  <div key={m.id} className="card myclubs-card">
                    <div className="myclubs-card-logo">{club.name[0]}</div>
                    <div className="myclubs-card-body">
                      <div className="myclubs-card-header">
                        <h3 className="myclubs-card-name">{club.name}</h3>
                        <CategoryBadge category={club.category} />
                      </div>
                      <p className="myclubs-card-desc">{club.description}</p>
                      <div className="myclubs-card-meta">
                        <span>👥 {club.membersCount} membres</span>
                        <span>📅 Membre depuis {m.joinedAt}</span>
                      </div>
                    </div>
                    <div className="myclubs-card-footer">
                      <MembershipStatusBadge status={m.status} />
                      <Link to={`/clubs/${club.id}`}>
                        <Button variant="secondary" size="sm">Voir le club</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── DEMANDES EN ATTENTE ───────────────────────── */}
        {myPending.length > 0 && (
          <section className="myclubs-section">
            <h2 className="myclubs-section-title">
              Demandes en attente ({myPending.length})
            </h2>
            <div className="myclubs-pending-list">
              {myPending.map((m) => {
                const club = getClub(m.clubId);
                if (!club) return null;
                return (
                  <div key={m.id} className="card myclubs-pending-row">
                    <div className="myclubs-card-logo" style={{ width: 40, height: 40, fontSize: 16 }}>
                      {club.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="myclubs-card-name">{club.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                        Demande envoyée le {m.joinedAt}
                      </p>
                    </div>
                    <MembershipStatusBadge status={m.status} />
                    <Link to={`/clubs/${club.id}`}>
                      <Button variant="secondary" size="sm">Voir</Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── ÉVÉNEMENTS À VENIR ────────────────────────── */}
        <section className="myclubs-section">
          <h2 className="myclubs-section-title">
            Événements à venir ({myEvents.length})
          </h2>

          {myEvents.length === 0 ? (
            <div className="card myclubs-empty">
              <span>📅</span>
              <p>Aucun événement à venir dans tes clubs.</p>
            </div>
          ) : (
            <div className="myclubs-events-list">
              {myEvents.map((event) => {
                const club      = getClub(event.clubId);
                const registered = isRegistered(event.id);
                const full      = event.maxCapacity
                  ? event.registeredCount >= event.maxCapacity
                  : false;

                return (
                  <div key={event.id} className="card myclubs-event-row">
                    {/* Date */}
                    <div className="myclubs-event-date">
                      <span className="myclubs-event-day">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="myclubs-event-month">
                        {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                      </span>
                    </div>

                    {/* Infos */}
                    <div className="myclubs-event-body">
                      <div className="myclubs-event-header">
                        <h3 className="myclubs-event-title">{event.title}</h3>
                        {club && (
                          <span className="myclubs-event-club">{club.name}</span>
                        )}
                      </div>
                      <div className="myclubs-event-meta">
                        <span>📍 {event.location}</span>
                        <span>🕐 {event.time}</span>
                        <span>
                          👥 {event.registeredCount}
                          {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} inscrits
                        </span>
                        {full && !registered && (
                          <span className="myclubs-event-full">Complet</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div>
                      {registered ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRegister(event.id, event.title)}
                        >
                          Se désinscrire
                        </Button>
                      ) : full ? (
                        <Button variant="secondary" size="sm" disabled>
                          Complet
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRegister(event.id, event.title)}
                        >
                          S'inscrire
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── DÉCOUVRIR PLUS DE CLUBS ───────────────────── */}
        <div className="myclubs-discover">
          <p>Tu veux rejoindre d'autres clubs ?</p>
          <Link to="/clubs">
            <Button variant="primary">Explorer tous les clubs →</Button>
          </Link>
        </div>

      </div>
    </div>
  );
}