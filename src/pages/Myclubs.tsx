import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge, MembershipStatusBadge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContex';
import { getMyMembershipsAPI } from '../services/member.service';
import { getPublicEventsAPI, registerToEventAPI, unregisterFromEventAPI } from '../services/event.service';
import './Myclubs.css';

export default function MyClubsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [memberships,   setMemberships]   = useState<any[]>([]);
  const [events,        setEvents]        = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [myMemberships, publicEvents] = await Promise.all([
          getMyMembershipsAPI(),
          getPublicEventsAPI(),
        ]);
        setMemberships(myMemberships);
        setEvents(publicEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const myClubs   = memberships.filter((m) => m.status === 'member');
  const myPending = memberships.filter((m) => m.status === 'pending');

  const myClubIds = myClubs.map((m) => {
    const club = m.clubId;
    return club?._id || club;
  });

  const myEvents = events.filter((e) => {
    const eClubId = e.clubId?._id || e.clubId;
    return myClubIds.includes(eClubId);
  });

  const isRegistered = (eventId: string) => registrations.includes(eventId);

  const handleRegister = async (eventId: string, title: string) => {
    try {
      if (isRegistered(eventId)) {
        if (!window.confirm(`Se désinscrire de "${title}" ?`)) return;
        await unregisterFromEventAPI(eventId);
        setRegistrations((prev) => prev.filter((id) => id !== eventId));
      } else {
        await registerToEventAPI(eventId);
        setRegistrations((prev) => [...prev, eventId]);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const getClub = (membership: any) => membership.clubId;

  return (
    <div className="myclubs-page">
      <Navbar />
      <div className="myclubs-container">
        <h1 className="myclubs-title">Mes clubs</h1>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Chargement...</p>
        ) : (
          <>
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
                    const club = getClub(m);
                    if (!club) return null;
                    const clubId = club._id || club;
                    return (
                      <div key={m._id} className="card myclubs-card">
                        <div className="myclubs-card-logo">
                          {club.name?.[0] ?? '?'}
                        </div>
                        <div className="myclubs-card-body">
                          <div className="myclubs-card-header">
                            <h3 className="myclubs-card-name">{club.name}</h3>
                            {club.category && <CategoryBadge category={club.category} />}
                          </div>
                          <p className="myclubs-card-desc">{club.description}</p>
                          <div className="myclubs-card-meta">
                            <span>👥 {club.membersCount ?? 0} membres</span>
                            <span>📅 Membre depuis {new Date(m.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="myclubs-card-footer">
                          <MembershipStatusBadge status={m.status} />
                          <Link to={`/clubs/${clubId}`}>
                            <Button variant="secondary" size="sm">Voir le club</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {myPending.length > 0 && (
              <section className="myclubs-section">
                <h2 className="myclubs-section-title">
                  Demandes en attente ({myPending.length})
                </h2>
                <div className="myclubs-pending-list">
                  {myPending.map((m) => {
                    const club = getClub(m);
                    if (!club) return null;
                    const clubId = club._id || club;
                    return (
                      <div key={m._id} className="card myclubs-pending-row">
                        <div className="myclubs-card-logo" style={{ width: 40, height: 40, fontSize: 16 }}>
                          {club.name?.[0] ?? '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p className="myclubs-card-name">{club.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                            Demande envoyée le {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <MembershipStatusBadge status={m.status} />
                        <Link to={`/clubs/${clubId}`}>
                          <Button variant="secondary" size="sm">Voir</Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

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
                    const registered = isRegistered(event._id);
                    const full = event.maxCapacity
                      ? (event.registeredCount ?? 0) >= event.maxCapacity
                      : false;
                    const clubName = event.clubId?.name || '';

                    return (
                      <div key={event._id} className="card myclubs-event-row">
                        <div className="myclubs-event-date">
                          <span className="myclubs-event-day">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="myclubs-event-month">
                            {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                          </span>
                        </div>
                        <div className="myclubs-event-body">
                          <div className="myclubs-event-header">
                            <h3 className="myclubs-event-title">{event.title}</h3>
                            {clubName && (
                              <span className="myclubs-event-club">{clubName}</span>
                            )}
                          </div>
                          <div className="myclubs-event-meta">
                            <span>📍 {event.location}</span>
                            <span>🕐 {event.time}</span>
                            <span>
                              👥 {event.registeredCount ?? 0}
                              {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} inscrits
                            </span>
                            {full && !registered && (
                              <span className="myclubs-event-full">Complet</span>
                            )}
                          </div>
                        </div>
                        <div>
                          {registered ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRegister(event._id, event.title)}
                            >
                              Se désinscrire
                            </Button>
                          ) : full ? (
                            <Button variant="secondary" size="sm" disabled>Complet</Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleRegister(event._id, event.title)}
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

            <div className="myclubs-bottom-row">
              <div className="myclubs-discover">
                <p>Tu veux rejoindre d'autres clubs ?</p>
                <Link to="/clubs">
                  <Button variant="secondary">Explorer tous les clubs →</Button>
                </Link>
              </div>
              {user?.role === 'member' && (
                <div className="myclubs-create-club">
                  <p>Tu veux créer ta propre association ?</p>
                  <Link to="/creer-club">
                    <Button variant="primary">+ Créer un club</Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}