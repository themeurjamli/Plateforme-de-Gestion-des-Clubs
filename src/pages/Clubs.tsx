import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge, ClubStatusBadge } from '../components/ui/Badge';
import { mockClubs, mockMemberships } from '../data/mockData';
import { Club, ClubCategory } from '../types/index';
import { useAuth } from '../context/AuthContext';
import './Clubs.css';

const CATEGORIES: ClubCategory[] = [
  'Tech', 'Sport', 'Culture', 'Musique', 'Science', 'Art', 'Autre',
];

export default function ClubsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ClubCategory | 'Tous'>('Tous');
  const [sort, setSort] = useState<'members' | 'events' | 'name'>('members');
  const activeClubs = mockClubs.filter((c) => c.status === 'active');
  const filtered = activeClubs
    .filter((c) =>
      category === 'Tous' ? true : c.category === category
    )
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'members') return b.membersCount - a.membersCount;
      if (sort === 'events') return b.eventsCount - a.eventsCount;
      return a.name.localeCompare(b.name);
    });
  const canCreateClub = user &&
    user.role === 'member' &&
    !user.clubId &&
    user.status !== 'banned';

  const handleCreateClub = () => {
    navigate('/create-club');
  };

  return (
    <div className="clubs-page">
      <Navbar />

      <div className="clubs-container">
        <div className="clubs-header">
          <div>
            <h1 className="clubs-title">Découvrir les clubs</h1>
            <p className="clubs-subtitle">
              {activeClubs.length} clubs actifs sur la plateforme
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
          {filtered.length} club{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          {category !== 'Tous' && ` dans "${category}"`}
          {search && ` pour "${search}"`}
        </div>

        {filtered.length === 0 ? (
          <div className="clubs-empty">
            <p className="clubs-empty-icon">🔍</p>
            <p className="clubs-empty-text">Aucun club trouvé</p>
            <p className="clubs-empty-sub">Essaie avec d'autres mots-clés ou une autre catégorie</p>
          </div>
        ) : (
          <div className="clubs-list">
            {filtered.map((club) => (
              <ClubRow key={club.id} club={club} userId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



function ClubRow({ club, userId }: { club: Club; userId?: string }) {
  const membership = userId
    ? mockMemberships.find(
      (m) => m.userId === userId && m.clubId === club.id
    )
    : null;

  return (
    <div className="club-row">

      {/* Logo */}
      <div className="club-row-logo">
        {club.name[0]}
      </div>


      <div className="club-row-body">
        <div className="club-row-top">
          <div className="club-row-name-wrap">
            <h3 className="club-row-name">{club.name}</h3>
            <CategoryBadge category={club.category} />
          </div>
          <div className="club-row-meta">
            <span>👥 {club.membersCount} membres</span>
            <span>📅 {club.eventsCount} événements</span>
          </div>
        </div>
        <p className="club-row-desc">{club.description}</p>
      </div>


      <div className="club-row-actions">
        <Link to={`/clubs/${club.id}`}>
          <Button variant="secondary" size="sm">Voir</Button>
        </Link>

        {!userId && (
          <Link to="/register">
            <Button variant="primary" size="sm">Rejoindre</Button>
          </Link>
        )}

        {userId && !membership && (
          <Link to={`/clubs/${club.id}`}>
            <Button variant="primary" size="sm">Rejoindre</Button>
          </Link>
        )}

        {membership?.status === 'pending' && (
          <Button variant="secondary" size="sm" disabled>
            En attente
          </Button>
        )}

        {membership?.status === 'member' && (
          <Button variant="success" size="sm" disabled>
            ✓ Membre
          </Button>
        )}
      </div>

    </div>
  );
}