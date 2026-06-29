import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge } from '../components/ui/Badge';
import { mockClubs } from '../data/mockData';
import { Club } from '../types/index';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const activeClubs = mockClubs.filter((c) => c.status === 'active');


  const filtered = activeClubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  
  const topClubs = [...activeClubs]
    .sort((a, b) => b.membersCount - a.membersCount)
    .slice(0, 3);

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
              <Button variant="primary" size="lg">
                Explorer les clubs
              </Button>
            </Link>
            {!user && (
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Créer un compte
                </Button>
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
                <ClubCard key={club.id} club={club} />
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
          <div className="clubs-grid">
            {topClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>

          <div className="home-see-all">
            <Link to="/clubs">
              <Button variant="secondary">
                Voir tous les clubs →
              </Button>
            </Link>
          </div>
        </section>
      )}


      {!search && (
        <section className="home-stats">
          <div className="home-container home-stats-grid">
            <div className="stat-item">
              <span className="stat-number">
                {mockClubs.filter((c) => c.status === 'active').length}
              </span>
              <span className="stat-label">Clubs actifs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {mockClubs.reduce((sum, c) => sum + c.membersCount, 0)}
              </span>
              <span className="stat-label">Membres inscrits</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {mockClubs.reduce((sum, c) => sum + c.eventsCount, 0)}
              </span>
              <span className="stat-label">Événements organisés</span>
            </div>
          </div>
        </section>
      )}

      
      <footer className="home-footer">
        <p>© 2026 CLUBIFY — Tous droits réservés</p>
      </footer>
    </div>
  );
}



function ClubCard({ club }: { club: Club }) {
  return (
    <div className="club-card">
    
      <div className="club-card-logo">
        {club.name[0]}
      </div>

    
      <div className="club-card-body">
        <div className="club-card-header">
          <h3 className="club-card-name">{club.name}</h3>
          <CategoryBadge category={club.category} />
        </div>

        <p className="club-card-desc">{club.description}</p>

        <div className="club-card-meta">
          <span>👥 {club.membersCount} membres</span>
          <span>📅 {club.eventsCount} événements</span>
        </div>
      </div>

      
      <div className="club-card-footer">
        <Link to={`/clubs/${club.id}`}>
          <Button variant="primary" size="sm" fullWidth>
            Voir le club
          </Button>
        </Link>
      </div>
    </div>
  );
}