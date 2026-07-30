import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge, ClubStatusBadge } from '../components/ui/Badge';
import { getClubByIdAPI, getClubMembersAPI } from '../services/club.service';
import { getClubEventsAPI, registerToEventAPI, unregisterFromEventAPI } from '../services/event.service';
import { getClubPollsAPI, voteAPI } from '../services/poll.service';
import { joinClubAPI, getMyMembershipsAPI } from '../services/member.service';
import { useAuth } from '../context/AuthContext';
import './Dashboard/Dashboard.css';
import './ClubDetail.css';

type Tab = 'evenements' | 'membres' | 'sondages' | 'galerie';

export default function ClubDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [club,         setClub]         = useState<any>(null);
  const [members,      setMembers]      = useState<any[]>([]);
  const [events,       setEvents]       = useState<any[]>([]);
  const [polls,        setPolls]        = useState<any[]>([]);
  const [membership,   setMembership]   = useState<any>(null);
  const [myVotes,      setMyVotes]      = useState<Record<string, string>>({});
  const [registrations,setRegistrations]= useState<string[]>([]); 
  const [activeTab,    setActiveTab]    = useState<Tab>('evenements');
  const [loading,      setLoading]      = useState(true);
  const [joining,      setJoining]      = useState(false);
  const [galleryPreview, setGalleryPreview] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [clubData, membersData, eventsData, pollsData] = await Promise.all([
          getClubByIdAPI(id),
          getClubMembersAPI(id).catch(() => []),
          getClubEventsAPI(id).catch(() => []),
          getClubPollsAPI(id).catch(() => []),
        ]);
        setClub(clubData);
        setMembers(membersData);
        setEvents(eventsData);
        setPolls(pollsData);

        if (user) {
          const myMemberships = await getMyMembershipsAPI();
          const found = myMemberships.find((m: any) => {
            const mClubId = m.clubId?._id || m.clubId;
            return mClubId === id;
          });
          setMembership(found || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, user]);

  const handleJoin = async () => {
    if (!user) { navigate('/register'); return; }
    setJoining(true);
    try {
      const newM = await joinClubAPI(id!);
      setMembership(newM);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la demande.');
    } finally {
      setJoining(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (registrations.includes(eventId)) {
      await unregisterFromEventAPI(eventId);
      setRegistrations((prev) => prev.filter((id) => id !== eventId));
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? { ...e, registeredCount: (e.registeredCount ?? 1) - 1 }
            : e
        )
      );
    } else {
      await registerToEventAPI(eventId);
      setRegistrations((prev) => [...prev, eventId]);
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? { ...e, registeredCount: (e.registeredCount ?? 0) + 1 }
            : e
        )
      );
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const updated = await voteAPI(pollId, optionId);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? updated : p)));
      setMyVotes((prev) => ({ ...prev, [pollId]: optionId }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du vote.');
    }
  };
 

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div className="detail-container">
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px 0' }}>
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="detail-page">
        <Navbar />
        <div className="detail-not-found">
          <p>Club introuvable.</p>
          <Link to="/clubs"><Button variant="primary">Retour aux clubs</Button></Link>
        </div>
      </div>
    );
  }

  const clubId        = club._id || club.id;
  const isMember      = membership?.status === 'member';
  const isPending     = membership?.status === 'pending';
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const activePolls    = polls.filter((p) => p.status === 'active');
  const closedPolls    = polls.filter((p) => p.status === 'closed');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'evenements', label: `Événements (${events.length})` },
    { key: 'membres',    label: `Membres (${members.length})`    },
    { key: 'sondages',   label: `Sondages (${polls.length})`     },
    { key: 'galerie',    label: 'Galerie'                        },
  ];

  return (
    <div className="detail-page">
      <Navbar />
      <div className="detail-container">

        <div className="detail-breadcrumb">
          <Link to="/clubs">Clubs</Link>
          <span>›</span>
          <span>{club.name}</span>
        </div>

        <div className="detail-header card">
          <div className="detail-header-left">
            <div className="detail-logo">{club.name[0]}</div>
            <div className="detail-info">
              <div className="detail-name-row">
                <h1 className="detail-name">{club.name}</h1>
                <ClubStatusBadge status={club.status} />
                <CategoryBadge category={club.category} />
              </div>
              <p className="detail-desc">{club.description}</p>
              <div className="detail-meta">
                <span>👥 {club.membersCount ?? 0} membres</span>
                <span>📅 {club.eventsCount ?? 0} événements</span>
                <span>📆 Créé le {new Date(club.createdAt).toLocaleDateString('fr-FR')}</span>
                {club.presidentId && (
                  <span>
                    👤 Président : {club.presidentId.firstName} {club.presidentId.lastName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="detail-action">
            {!membership && club.status === 'active' && (
              <Button variant="primary" size="lg" onClick={handleJoin} disabled={joining}>
                {joining ? 'Envoi...' : 'Rejoindre le club'}
              </Button>
            )}
            {isPending && (
              <Button variant="secondary" disabled>⏳ Demande en attente</Button>
            )}
            {isMember && (
              <Button variant="success" disabled>✓ Vous êtes membre</Button>
            )}
          </div>
        </div>

        <div className="detail-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`detail-tab ${activeTab === tab.key ? 'detail-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="detail-content">
          {activeTab === 'evenements' && (
            <div className="tab-section">
              {events.length === 0 ? (
                <EmptyState text="Aucun événement pour ce club." />
              ) : (
                <div className="events-list">
                  {events.map((event) => (
                    <div key={event._id} className="event-card card">
                      <div className="event-date-box">
                        <span className="event-day">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="event-month">
                          {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                        </span>
                      </div>
                      <div className="event-body">
                        <div className="event-top">
                          <h3 className="event-title">{event.title}</h3>
                          <span className={`event-status-tag event-${event.status}`}>
                            {event.status === 'upcoming' ? 'À venir'
                              : event.status === 'past' ? 'Passé' : 'Annulé'}
                          </span>
                        </div>
                        <p className="event-desc">{event.description}</p>
                        <div className="event-meta">
                          <span>📍 {event.location}</span>
                          <span>🕐 {event.time}</span>
                          <span>
                            👥 {event.registeredCount ?? 0}
                            {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} inscrits
                          </span>
                        </div>
                      </div>
                      {event.status === 'upcoming' && isMember && (
                        <div className="event-action">
                          <Button
                            variant={registrations.includes(event._id) ? 'danger' : 'primary'}
                            size="sm"
                            onClick={() => handleRegister(event._id)}
                          >
                            {registrations.includes(event._id) ? 'Se désinscrire' : "S'inscrire"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'membres' && (
            <div className="tab-section">
              {members.length === 0 ? (
                <EmptyState text="Liste des membres non disponible." />
              ) : (
                <div className="members-grid">
                  {members.map((m: any) => (
                    <div key={m._id} className="member-card card">
                      <div className="member-avatar">
                        {m.userId?.firstName?.[0]}{m.userId?.lastName?.[0]}
                      </div>
                      <div className="member-info">
                        <span className="member-name">
                          {m.userId?.firstName} {m.userId?.lastName}
                        </span>
                        <span className="member-since">
                          Depuis {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sondages' && (
            <div className="tab-section">
              {!isMember ? (
                <EmptyState text="Rejoins le club pour accéder aux sondages." />
              ) : polls.length === 0 ? (
                <EmptyState text="Aucun sondage pour ce club." />
              ) : (
                <div className="polls-list">
                  {[...activePolls, ...closedPolls].map((poll) => {
                    const total = poll.options?.reduce(
                      (s: number, o: any) => s + o.votesCount, 0
                    ) ?? 0;
                    const voted = !!myVotes[poll._id];
                    const selected= myVotes[poll._id] || null;

                    return (
                      <div key={poll._id} className="poll-card card">
                        <div className="poll-header">
                          <h3 className="poll-question">{poll.question}</h3>
                          <span className={`poll-status ${poll.status === 'active' ? 'poll-active' : 'poll-closed'}`}>
                            {poll.status === 'active' ? 'Actif' : 'Clôturé'}
                          </span>
                        </div>
                        <div className="poll-options">
                          {poll.options?.map((opt: any) => {
                            const pct = total > 0
                              ? Math.round((opt.votesCount / total) * 100) : 0;
                            return (
                              <div key={opt._id} className="poll-option">
                                {poll.status === 'active' && !voted && (
                                  <input
                                    type="radio"
                                    name={`poll-${poll._id}`}
                                    value={opt._id}
                                    checked={selected === opt._id}
                                    onChange={() => {setMyVotes((prev) => ({ ...prev, [poll._id]: opt._id }));}}
                                    style={{ accentColor: 'var(--primary)', marginRight: 8 }}
                                  />
                                )}
                                <div style={{ flex: 1 }}>
                                  <div className="poll-option-top">
                                    <span className="poll-option-label">{opt.label}</span>
                                    <span className="poll-option-pct">{pct}%</span>
                                  </div>
                                  <div className="poll-bar-track">
                                    <div className="poll-bar-fill" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                          <p className="poll-total">{total} votes</p>
                          {poll.status === 'active' && !voted && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => selected && handleVote(poll._id, selected)}
                            >
                              Voter
                            </Button>
                          )}
                          {voted && (
                            <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ Voté</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'galerie' && (
            <div className="tab-section">
              {club.gallery && club.gallery.length > 0 ? (
                <div className="gallery-grid">
                  {club.gallery.map((photo: any) => (
                    <div key={photo._id || photo.id} className="gallery-item">
                      <div className="gallery-img-wrap" onClick={() => setGalleryPreview(photo)}>
                        <img
                          src={photo.url}
                          alt={photo.caption || club.name}
                          className="gallery-img"
                          loading="lazy"
                        />
                        <div className="gallery-overlay">
                          <span className="gallery-zoom">🔍 Voir</span>
                        </div>
                      </div>
                      {photo.caption && (
                        <div style={{ padding: '8px 10px', color: 'var(--text-secondary)', minHeight: 34 }}>
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Aucune photo dans la galerie du club." />
              )}

              {galleryPreview && (
                <div className="gallery-modal-overlay" onClick={() => setGalleryPreview(null)}>
                  <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="gallery-modal-close" onClick={() => setGalleryPreview(null)}>✕</button>
                    <img
                      src={galleryPreview.url}
                      alt={galleryPreview.caption || club.name}
                      className="gallery-modal-img"
                    />
                    {galleryPreview.caption && (
                      <p className="gallery-modal-caption">{galleryPreview.caption}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">📭</span>
      <p>{text}</p>
    </div>
  );
}