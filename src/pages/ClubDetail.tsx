import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge, ClubStatusBadge } from '../components/ui/Badge';
import {
  mockClubs,
  mockUsers,
  mockEvents,
  mockMemberships,
  mockPolls,
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import './ClubDetail.css';

type Tab = 'evenements' | 'membres' | 'sondages' | 'galerie';

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('evenements');

  // Trouver le club
  const club = mockClubs.find((c) => c.id === id);

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

  // Données liées au club
  const president   = mockUsers.find((u) => u.id === club.presidentId);
  const events      = mockEvents.filter((e) => e.clubId === club.id);
  const members     = mockMemberships.filter((m) => m.clubId === club.id && m.status === 'member');
  const polls       = mockPolls.filter((p) => p.clubId === club.id);

  // Statut d'adhésion de l'utilisateur connecté
  const myMembership = user
    ? mockMemberships.find((m) => m.userId === user.id && m.clubId === club.id)
    : null;

  const handleJoin = () => {
    if (!user) {
      navigate('/register');
      return;
    }
    alert('Demande d\'adhésion envoyée ! (simulation)');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'evenements', label: `Événements (${events.length})` },
    { key: 'membres',    label: `Membres (${members.length})`   },
    { key: 'sondages',   label: `Sondages (${polls.length})`    },
    { key: 'galerie',    label: 'Galerie'                        },
  ];

  return (
    <div className="detail-page">
      <Navbar />

      <div className="detail-container">

        {/* ── FIL D'ARIANE ─────────────────────────────── */}
        <div className="detail-breadcrumb">
          <Link to="/clubs">Clubs</Link>
          <span>›</span>
          <span>{club.name}</span>
        </div>

        {/* ── EN-TÊTE DU CLUB ───────────────────────────── */}
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
                <span>👥 {club.membersCount} membres</span>
                <span>📅 {club.eventsCount} événements</span>
                <span>📆 Créé le {club.createdAt}</span>
                {president && <span>👤 Président : {president.firstName} {president.lastName}</span>}
              </div>
            </div>
          </div>

          {/* Bouton d'action selon le statut */}
          <div className="detail-action">
            {!myMembership && club.status === 'active' && (
              <Button variant="primary" size="lg" onClick={handleJoin}>
                Rejoindre le club
              </Button>
            )}
            {myMembership?.status === 'pending' && (
              <Button variant="secondary" disabled>
                ⏳ Demande en attente
              </Button>
            )}
            {myMembership?.status === 'member' && (
              <Button variant="success" disabled>
                ✓ Vous êtes membre
              </Button>
            )}
          </div>
        </div>

        {/* ── ONGLETS ───────────────────────────────────── */}
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

        {/* ── CONTENU ONGLET ────────────────────────────── */}
        <div className="detail-content">

          {/* ÉVÉNEMENTS */}
          {activeTab === 'evenements' && (
            <div className="tab-section">
              {events.length === 0 ? (
                <EmptyState text="Aucun événement pour ce club." />
              ) : (
                <div className="events-list">
                  {events.map((event) => (
                    <div key={event.id} className="event-card card">
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
                            {event.status === 'upcoming' ? 'À venir' : event.status === 'past' ? 'Passé' : 'Annulé'}
                          </span>
                        </div>
                        <p className="event-desc">{event.description}</p>
                        <div className="event-meta">
                          <span>📍 {event.location}</span>
                          <span>🕐 {event.time}</span>
                          <span>
                            👥 {event.registeredCount}
                            {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} inscrits
                          </span>
                        </div>
                      </div>
                      {event.status === 'upcoming' && myMembership?.status === 'member' && (
                        <div className="event-action">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => alert(`Inscrit à "${event.title}" ! (simulation)`)}
                          >
                            S'inscrire
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MEMBRES */}
          {activeTab === 'membres' && (
            <div className="tab-section">
              {members.length === 0 ? (
                <EmptyState text="Aucun membre pour ce club." />
              ) : (
                <div className="members-grid">
                  {members.map((m) => {
                    const memberUser = mockUsers.find((u) => u.id === m.userId);
                    if (!memberUser) return null;
                    return (
                      <div key={m.id} className="member-card card">
                        <div className="member-avatar">
                          {memberUser.firstName[0]}{memberUser.lastName[0]}
                        </div>
                        <div className="member-info">
                          <span className="member-name">
                            {memberUser.firstName} {memberUser.lastName}
                          </span>
                          <span className="member-since">
                            Membre depuis {m.joinedAt}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SONDAGES */}
          {activeTab === 'sondages' && (
            <div className="tab-section">
              {myMembership?.status !== 'member' ? (
                <EmptyState text="Rejoins le club pour accéder aux sondages." />
              ) : polls.length === 0 ? (
                <EmptyState text="Aucun sondage pour ce club." />
              ) : (
                <div className="polls-list">
                  {polls.map((poll) => (
                    <div key={poll.id} className="poll-card card">
                      <div className="poll-header">
                        <h3 className="poll-question">{poll.question}</h3>
                        <span className={`poll-status ${poll.status === 'active' ? 'poll-active' : 'poll-closed'}`}>
                          {poll.status === 'active' ? 'Actif' : 'Clôturé'}
                        </span>
                      </div>
                      <div className="poll-options">
                        {poll.options.map((opt) => {
                          const pct = poll.totalVotes > 0
                            ? Math.round((opt.votesCount / poll.totalVotes) * 100)
                            : 0;
                          return (
                            <div key={opt.id} className="poll-option">
                              <div className="poll-option-top">
                                <span className="poll-option-label">{opt.label}</span>
                                <span className="poll-option-pct">{pct}%</span>
                              </div>
                              <div className="poll-bar-track">
                                <div className="poll-bar-fill" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="poll-total">{poll.totalVotes} votes au total</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GALERIE */}
          {activeTab === 'galerie' && (
            <div className="tab-section">
              <EmptyState text="La galerie photo sera disponible prochainement." />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT VIDE ──────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">📭</span>
      <p>{text}</p>
    </div>
  );
}