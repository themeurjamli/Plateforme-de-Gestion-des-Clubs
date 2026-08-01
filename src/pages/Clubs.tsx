import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge, ClubStatusBadge } from '../components/ui/Badge';
import { getClubsAPI } from '../services/club.service';
import { getMyMembershipsAPI, joinClubAPI } from '../services/member.service';
import { Club, ClubCategory, Membership } from '../types/index';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContex';
import './Clubs.css';

const CATEGORIES: ClubCategory[] = [
  'Tech', 'Sport', 'Culture', 'Musique', 'Science', 'Art', 'Autre',
];

export default function ClubsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clubs,       setClubs]       = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState<ClubCategory | 'Tous'>('Tous');
  const [sort,        setSort]        = useState<'members' | 'events' | 'name'>('members');
  const [loading,     setLoading]     = useState(true);
  const [joiningId,   setJoiningId]   = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubsData = await getClubsAPI();
        setClubs(clubsData);
        if (user) {
          const myMemberships = await getMyMembershipsAPI();
          setMemberships(myMemberships);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filtered = clubs
    .filter((c) => category === 'Tous' ? true : c.category === category)
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'members') return (b.membersCount ?? 0) - (a.membersCount ?? 0);
      if (sort === 'events')  return (b.eventsCount  ?? 0) - (a.eventsCount  ?? 0);
      return a.name.localeCompare(b.name);
    });

  const getMembership = (clubId: string) =>
    memberships.find((m) => {
      const mClubId = (m as any).clubId?._id || (m as any).clubId;
      return mClubId === clubId;
    });

  const handleJoin = async (clubId: string) => {
    if (!user) return;
    setJoiningId(clubId);
    try {
      const newM = await joinClubAPI(clubId);
      setMemberships((prev) => [...prev, newM]);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la demande.', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="clubs-page">
      <Navbar />
      <div className="clubs-container">

        <div className="clubs-header">
          <div>
            <h1 className="clubs-title">Découvrir les clubs</h1>
            <p className="clubs-subtitle">
              {clubs.length} clubs actifs sur la plateforme
            </p>
          </div>
        </div>

        <div className="clubs-toolbar">
          <input
            type="text"
            className="clubs-search"
            placeholder="🔍  Rechercher un club..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="clubs-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="members">Trier : membres</option>
            <option value="events">Trier : événements</option>
            <option value="name">Trier : nom</option>
          </select>
        </div>

        <div className="clubs-filters">
          <button
            className={`filter-btn ${category === 'Tous' ? 'filter-btn-active' : ''}`}
            onClick={() => setCategory('Tous')}
          >
            Tous
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'filter-btn-active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="clubs-results-info">
          {loading ? 'Chargement...' : `${filtered.length} club${filtered.length !== 1 ? 's' : ''} trouvé${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {loading ? (
          <p className="clubs-empty">Chargement des clubs...</p>
        ) : filtered.length === 0 ? (
          <div className="clubs-empty">
            <p className="clubs-empty-icon">🔍</p>
            <p className="clubs-empty-text">Aucun club trouvé</p>
            <p className="clubs-empty-sub">Essaie avec d'autres mots-clés</p>
          </div>
        ) : (
          <div className="clubs-list">
            {filtered.map((club) => {
              const id         = club.id || (club as any)._id;
              const membership = getMembership(id);
              return (
                <div key={id} className="club-row">
                  <div className="club-row-logo">{club.name[0]}</div>
                  <div className="club-row-body">
                    <div className="club-row-top">
                      <div className="club-row-name-wrap">
                        <h3 className="club-row-name">{club.name}</h3>
                        <CategoryBadge category={club.category} />
                      </div>
                      <div className="club-row-meta">
                        <span>👥 {club.membersCount ?? 0} membres</span>
                        <span>📅 {club.eventsCount ?? 0} événements</span>
                      </div>
                    </div>
                    <p className="club-row-desc">{club.description}</p>
                  </div>
                  <div className="club-row-actions">
                    <Link to={`/clubs/${id}`}>
                      <Button variant="secondary" size="sm">Voir</Button>
                    </Link>

                    {!user && (
                      <Link to="/register">
                        <Button variant="primary" size="sm">Rejoindre</Button>
                      </Link>
                    )}
                    {user && !membership && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={joiningId === id}
                        onClick={() => handleJoin(id)}
                      >
                        {joiningId === id ? '...' : 'Rejoindre'}
                      </Button>
                    )}
                    {membership && (membership as any).status === 'pending' && (
                      <Button variant="secondary" size="sm" disabled>En attente</Button>
                    )}
                    {membership && (membership as any).status === 'member' && (
                      <Button variant="success" size="sm" disabled>✓ Membre</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}