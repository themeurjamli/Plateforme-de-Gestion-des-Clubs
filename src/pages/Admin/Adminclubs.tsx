import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import { ClubStatusBadge, CategoryBadge } from '../../components/ui/Badge';
import { getAllClubsAPI, updateClubStatusAPI } from '../../services/club.service';
import { ClubStatus } from '../../types/index';
import '../Dashboard/Dashboard.css';

type TabFilter = 'all' | ClubStatus;

export default function AdminClubs() {
  const [clubs,     setClubs]     = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getAllClubsAPI();
        setClubs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const updateStatus = async (clubId: string, status: ClubStatus) => {
    try {
      const updated = await updateClubStatusAPI(clubId, status);
      setClubs((prev) => prev.map((c) => (c._id === clubId ? updated : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const counts = {
    all:      clubs.length,
    active:   clubs.filter((c) => c.status === 'active').length,
    pending:  clubs.filter((c) => c.status === 'pending').length,
    inactive: clubs.filter((c) => c.status === 'inactive').length,
    rejected: clubs.filter((c) => c.status === 'rejected').length,
  };

  const filtered =
    activeTab === 'all' ? clubs : clubs.filter((c) => c.status === activeTab);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all',      label: 'Tous',       count: counts.all      },
    { key: 'active',   label: 'Actifs',     count: counts.active   },
    { key: 'pending',  label: 'En attente', count: counts.pending  },
    { key: 'rejected', label: 'Rejetés',    count: counts.rejected },
    { key: 'inactive', label: 'Inactifs',   count: counts.inactive },
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
          {loading ? (
            <p className="dash-empty">Chargement...</p>
          ) : filtered.length === 0 ? (
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
                {filtered.map((club: any) => (
                  <tr key={club._id}>
                    <td className="dash-table-name">{club.name}</td>
                    <td><CategoryBadge category={club.category} /></td>
                    <td>
                      {club.presidentId?.firstName} {club.presidentId?.lastName}
                    </td>
                    <td>{club.membersCount ?? 0}</td>
                    <td><ClubStatusBadge status={club.status} /></td>
                    <td>
                      <div className="dash-actions">
                        {club.status === 'pending' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => updateStatus(club._id, 'active')}>
                              Valider
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => updateStatus(club._id, 'rejected')}>
                              Rejeter
                            </Button>
                          </>
                        )}
                        {club.status === 'active' && (
                          <Button size="sm" variant="danger" onClick={() => updateStatus(club._id, 'inactive')}>
                            Désactiver
                          </Button>
                        )}
                        {(club.status === 'inactive' || club.status === 'rejected') && (
                          <Button size="sm" variant="success" onClick={() => updateStatus(club._id, 'active')}>
                            Réactiver
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