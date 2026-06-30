import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import StatCard from '../../components/ui/Statcard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { mockClubs, mockUsers, mockEvents } from '../../data/mockData';
import { Club } from '../../types/index';
import '../Dashboard/Dashboard.css';

export default function AdminHome() {
  // Copie locale des clubs pour simuler les actions Valider / Rejeter
  const [clubs, setClubs] = useState<Club[]>([...mockClubs]);

  const clubsActifs = clubs.filter((c) => c.status === 'active').length;
  const clubsPending = clubs.filter((c) => c.status === 'pending');
  const totalUsers = mockUsers.length;
  const totalEvents = mockEvents.length;

  const getPresidentName = (presidentId: string) => {
    const president = mockUsers.find((u) => u.id === presidentId);
    return president ? `${president.firstName} ${president.lastName}` : '—';
  };

  const handleValider = (clubId: string) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, status: 'active' } : c))
    );
  };

  const handleRejeter = (clubId: string) => {
    if (!window.confirm('Rejeter ce club ? Le président en sera informé.')) return;
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, status: 'rejected' } : c))
    );
  };

  // Derniers utilisateurs inscrits (les 5 plus récents)
  const derniersUtilisateurs = [...mockUsers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <PageHeader
          title="Vue globale"
          subtitle="Statistiques et activité de la plateforme"
        />

        <div className="dash-stats-grid">
          <StatCard label="Clubs actifs" value={clubsActifs} icon="🏛" color="blue" />
          <StatCard label="En attente" value={clubsPending.length} icon="⏳" color="warning" />
          <StatCard label="Utilisateurs" value={totalUsers} icon="👥" color="green" />
          <StatCard label="Événements" value={totalEvents} icon="📅" color="blue" />
        </div>

        {clubsPending.length > 0 && (
          <div className="dash-alert">
            <span>
              <strong>{clubsPending.length} club(s)</strong> en attente de validation.
            </span>
            <Link to="/admin/clubs">Voir tout →</Link>
          </div>
        )}

        <div className="dash-two-cols">
          {/* Clubs en attente de validation */}
          <div className="card dash-section">
            <div className="dash-section-header">
              <span className="dash-section-title">Clubs en attente de validation</span>
            </div>

            {clubsPending.length === 0 ? (
              <p className="dash-empty">Aucun club en attente pour le moment.</p>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Président</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clubsPending.map((club) => (
                    <tr key={club.id}>
                      <td className="dash-table-name">{club.name}</td>
                      <td>{getPresidentName(club.presidentId)}</td>
                      <td>
                        <div className="dash-actions">
                          <Button size="sm" variant="success" onClick={() => handleValider(club.id)}>
                            Valider
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleRejeter(club.id)}>
                            Rejeter
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="dash-section-footer">
              <Link to="/admin/clubs">Gérer tous les clubs →</Link>
            </div>
          </div>

          {/* Derniers utilisateurs inscrits */}
          <div className="card dash-section">
            <div className="dash-section-header">
              <span className="dash-section-title">Derniers inscrits</span>
            </div>

            {derniersUtilisateurs.length === 0 ? (
              <p className="dash-empty">Aucun utilisateur pour le moment.</p>
            ) : (
              <div className="dash-pending-list">
                {derniersUtilisateurs.map((u) => (
                  <div className="dash-pending-row" key={u.id}>
                    <div className="dash-pending-avatar">
                      {u.firstName[0]}
                      {u.lastName[0]}
                    </div>
                    <div className="dash-pending-info">
                      <span className="dash-pending-name">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="dash-pending-date">
                        {u.email} · {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <Badge
                      label={u.status === 'active' ? 'Actif' : 'Banni'}
                      variant={u.status === 'active' ? 'success' : 'danger'}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="dash-section-footer">
              <Link to="/admin/utilisateurs">Gérer les utilisateurs →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}