import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import StatCard from '../../components/ui/Statcard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getAllClubsAPI, updateClubStatusAPI } from '../../services/club.service';
import api from '../../services/api';
import '../Dashboard/Dashboard.css';

export default function AdminHome() {
  const [clubs,   setClubs]   = useState<any[]>([]);
  const [users,   setUsers]   = useState<any[]>([]);
  const [events,  setEvents]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [clubsData, usersData, eventsData] = await Promise.all([
          getAllClubsAPI(),
          api.get('/users').then((r) => r.data).catch(() => []),
          api.get('/events').then((r) => r.data).catch(() => []),
        ]);
        setClubs(clubsData);
        setUsers(usersData);
        setEvents(eventsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const clubsActifs  = clubs.filter((c) => c.status === 'active');
  const clubsPending = clubs.filter((c) => c.status === 'pending');

  const handleValider = async (clubId: string) => {
    try {
      const updated = await updateClubStatusAPI(clubId, 'active');
      setClubs((prev) => prev.map((c) => (c._id === clubId ? updated : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleRejeter = async (clubId: string) => {
    if (!window.confirm('Rejeter ce club ?')) return;
    try {
      const updated = await updateClubStatusAPI(clubId, 'rejected');
      setClubs((prev) => prev.map((c) => (c._id === clubId ? updated : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const derniers = [...users]
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

        {loading ? (
          <p className="dash-empty">Chargement...</p>
        ) : (
          <>
            <div className="dash-stats-grid">
              <StatCard label="Clubs actifs"   value={clubsActifs.length}  icon="🏛" color="blue"    />
              <StatCard label="En attente"      value={clubsPending.length} icon="⏳" color="warning" />
              <StatCard label="Utilisateurs"    value={users.length}        icon="👥" color="green"   />
              <StatCard label="Événements"      value={events.length}       icon="📅" color="blue"    />
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

              <div className="card dash-section">
                <div className="dash-section-header">
                  <span className="dash-section-title">Clubs en attente</span>
                </div>
                {clubsPending.length === 0 ? (
                  <p className="dash-empty">Aucun club en attente.</p>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr><th>Club</th><th>Président</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {clubsPending.map((club: any) => (
                        <tr key={club._id}>
                          <td className="dash-table-name">{club.name}</td>
                          <td>
                            {club.presidentId?.firstName} {club.presidentId?.lastName}
                          </td>
                          <td>
                            <div className="dash-actions">
                              <Button size="sm" variant="success" onClick={() => handleValider(club._id)}>
                                Valider
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleRejeter(club._id)}>
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

              <div className="card dash-section">
                <div className="dash-section-header">
                  <span className="dash-section-title">Derniers inscrits</span>
                </div>
                {derniers.length === 0 ? (
                  <p className="dash-empty">Aucun utilisateur.</p>
                ) : (
                  <div className="dash-pending-list">
                    {derniers.map((u: any) => (
                      <div className="dash-pending-row" key={u._id}>
                        <div className="dash-pending-avatar">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div className="dash-pending-info">
                          <span className="dash-pending-name">{u.firstName} {u.lastName}</span>
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
          </>
        )}
      </div>
    </div>
  );
}