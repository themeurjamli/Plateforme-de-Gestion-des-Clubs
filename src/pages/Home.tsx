import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge } from '../components/ui/Badge';
import { getClubsAPI } from '../services/club.service';
import { Club } from '../types/index';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [clubs,   setClubs]   = useState<Club[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getClubsAPI();
        setClubs(data);
      } catch {
        setError('Impossible de charger les clubs.');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const filtered = clubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const topClubs = [...clubs]
    .sort((a, b) => (b.membersCount ?? 0) - (a.membersCount ?? 0))
    .slice(0, 3);

  const totalMembers = clubs.reduce((s, c) => s + (c.membersCount ?? 0), 0);
  const totalEvents  = clubs.reduce((s, c) => s + (c.eventsCount  ?? 0), 0);

  return (
    <div className="home-page">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Rejoins un club qui te ressemble
          </h1>
          <p className="hero-subtitle">
            Découvre les associations actives, participe aux événements
            et vote dans les sondages de ta communauté.
          </p>
          <div className="hero-actions">
            <Link to="/clubs">
              <Button variant="primary" size="lg">Explorer les clubs</Button>
            </Link>
            {!user && (
              <Link to="/register">
                <Button variant="secondary" size="lg">Créer un compte</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="home-search-section">
        <div className="home-container">
          <input
            type="text"
            className="home-search-input"
            placeholder="🔍  Rechercher un club..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {search && (
        <section className="home-container home-results">
          <h2 className="section-title">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour "{search}"
          </h2>
          {filtered.length === 0 ? (
            <p className="home-empty">Aucun club trouvé.</p>
          ) : (
            <div className="clubs-grid">
              {filtered.map((club) => (
                <ClubCard key={club.id || (club as any)._id} club={club} />
              ))}
            </div>
          )}
        </section>
      )}

      {!search && (
        <section className="home-container">
          <h2 className="section-title">🏆 Clubs les plus actifs</h2>
          <p className="section-subtitle">
            Les clubs avec le plus de membres et d'événements
          </p>

          {loading ? (
            <p className="home-empty">Chargement des clubs...</p>
          ) : error ? (
            <p className="home-empty" style={{ color: 'var(--danger)' }}>{error}</p>
          ) : (
            <div className="clubs-grid">
              {topClubs.map((club) => (
                <ClubCard key={club.id || (club as any)._id} club={club} />
              ))}
            </div>
          )}

          <div className="home-see-all">
            <Link to="/clubs">
              <Button variant="secondary">Voir tous les clubs →</Button>
            </Link>
          </div>
        </section>
      )}

      {!search && !loading && (
        <section className="home-stats">
          <div className="home-container home-stats-grid">
            <div className="stat-item">
              <span className="stat-number">{clubs.length}</span>
              <span className="stat-label">Clubs actifs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalMembers}</span>
              <span className="stat-label">Membres inscrits</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalEvents}</span>
              <span className="stat-label">Événements organisés</span>
            </div>
          </div>
        </section>
      )}

      <footer className="home-footer">
        <p>© 2026 Plateforme Clubs — Tous droits réservés</p>
      </footer>
    </div>
  );
}


function ClubCard({ club }: { club: Club }) {
  const id = club.id || (club as any)._id;
  return (
    <div className="club-card">
      <div className="club-card-logo">{club.name[0]}</div>
      <div className="club-card-body">
        <div className="club-card-header">
          <h3 className="club-card-name">{club.name}</h3>
          <CategoryBadge category={club.category} />
        </div>
        <p className="club-card-desc">{club.description}</p>
        <div className="club-card-meta">
          <span>👥 {club.membersCount ?? 0} membres</span>
          <span>📅 {club.eventsCount ?? 0} événements</span>
        </div>
      </div>
      <div className="club-card-footer">
        <Link to={`/clubs/${id}`}>
          <Button variant="primary" size="sm" fullWidth>
            Voir le club
          </Button>
        </Link>
      </div>
    </div>
  );
}