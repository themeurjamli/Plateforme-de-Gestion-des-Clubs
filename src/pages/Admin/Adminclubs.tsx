import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import { ClubStatusBadge, CategoryBadge } from '../../components/ui/Badge';
import { mockClubs, mockUsers } from '../../data/mockData';
import { Club, ClubStatus } from '../../types/index';
import '../Dashboard/Dashboard.css';

type TabFilter = 'all' | ClubStatus;

export default function AdminClubs() {
  const [clubs, setClubs] = useState<Club[]>([...mockClubs]);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const getPresidentName = (presidentId: string) => {
    const president = mockUsers.find((u) => u.id === presidentId);
    return president ? `${president.firstName} ${president.lastName}` : '—';
  };

  const counts = {
    all: clubs.length,
    active: clubs.filter((c) => c.status === 'active').length,
    pending: clubs.filter((c) => c.status === 'pending').length,
    inactive: clubs.filter((c) => c.status === 'inactive').length,
    rejected: clubs.filter((c) => c.status === 'rejected').length,
  };

  const filteredClubs =
    activeTab === 'all' ? clubs : clubs.filter((c) => c.status === activeTab);

  const updateStatus = (clubId: string, status: ClubStatus) => {
    setClubs((prev) => prev.map((c) => (c.id === clubId ? { ...c, status } : c)));
  };

  const handleValider = (clubId: string) => updateStatus(clubId, 'active');

  const handleRejeter = (clubId: string) => {
    if (!window.confirm('Rejeter ce club ? Le président en sera informé.')) return;
    updateStatus(clubId, 'rejected');
  };

  const handleDesactiver = (clubId: string) => {
    if (!window.confirm('Désactiver ce club ? Il ne sera plus visible publiquement.')) return;
    updateStatus(clubId, 'inactive');
  };

  const handleReactiver = (clubId: string) => updateStatus(clubId, 'active');

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: counts.all },
    { key: 'active', label: 'Actifs', count: counts.active },
    { key: 'pending', label: 'En attente', count: counts.pending },
    { key: 'inactive', label: 'Inactifs', count: counts.inactive },
    { key: 'rejected', label: 'Rejetés', count: counts.rejected },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <PageHeader
          title="Clubs"
          subtitle="Gérer et valider l'ensemble des clubs de la plateforme"
        />

        <div className="members-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`members-tab ${activeTab === tab.key ? 'members-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
              {tab.key === 'pending' && tab.count > 0 && (
                <span className="members-tab-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="card dash-section">
          {filteredClubs.length === 0 ? (
            <p className="dash-empty">Aucun club dans cette catégorie.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Club</th>
                  <th>Catégorie</th>
                  <th>Président</th>
                  <th>Membres</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubs.map((club) => (
                  <tr key={club.id}>
                    <td className="dash-table-name">{club.name}</td>
                    <td>
                      <CategoryBadge category={club.category} />
                    </td>
                    <td>{getPresidentName(club.presidentId)}</td>
                    <td>{club.membersCount}</td>
                    <td>
                      <ClubStatusBadge status={club.status} />
                    </td>
                    <td>
                      <div className="dash-actions">
                        {club.status === 'pending' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => handleValider(club.id)}>
                              Valider
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleRejeter(club.id)}>
                              Rejeter
                            </Button>
                          </>
                        )}

                        {club.status === 'active' && (
                          <Button size="sm" variant="danger" onClick={() => handleDesactiver(club.id)}>
                            Désactiver
                          </Button>
                        )}

                        {club.status === 'inactive' && (
                          <Button size="sm" variant="success" onClick={() => handleReactiver(club.id)}>
                            Réactiver
                          </Button>
                        )}
                        {club.status === 'rejected' && (
                          <Button size="sm" variant="success" onClick={() => handleReactiver(club.id)}>
                           Réexaminer
                          </Button>
                       )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}