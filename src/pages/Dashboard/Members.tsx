import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {useToast} from '../../context/ToastContex';
import {
  getClubMembersAPI,
  getClubPendingAPI,
} from '../../services/club.service';
import {
  updateMembershipAPI,
  removeMemberAPI,
} from '../../services/member.service';
import './Dashboard.css';

export default function MembersPage() {
  const { user } = useAuth();

  const [members,    setMembers]    = useState<any[]>([]);
  const [pending,    setPending]    = useState<any[]>([]);
  const [activeTab,  setActiveTab]  = useState<'pending' | 'members'>('pending');
  const [loading,    setLoading]    = useState(true);
  const { showToast } = useToast();

  const clubId = user?.clubId as string;

  useEffect(() => {
    if (!clubId) return;
    const fetchData = async () => {
      try {
        const [m, p] = await Promise.all([
          getClubMembersAPI(clubId),
          getClubPendingAPI(clubId),
        ]);
        setMembers(m);
        setPending(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clubId]);

  const handleAccept = async (membershipId: string) => {
    try {
      await updateMembershipAPI(membershipId, 'member');
      const accepted = pending.find((m) => m._id === membershipId);
      setPending((prev) => prev.filter((m) => m._id !== membershipId));
      if (accepted) setMembers((prev) => [...prev, { ...accepted, status: 'member' }]);
      showToast('Membre accepté avec succès.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de l\'acceptation du membre.', 'error');
    }
  };

  const handleRemove = async (membershipId: string, name: string) => {
    if (!window.confirm(`Retirer ${name} du club ?`)) return;
    try {
      await removeMemberAPI(membershipId);
      setMembers((prev) => prev.filter((m) => m._id !== membershipId));
      setPending((prev) => prev.filter((m) => m._id !== membershipId));
      showToast('Membre retiré avec succès.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors du retrait du membre.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content"><p className="dash-empty">Chargement...</p></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Membres & Adhésions"
          subtitle="Gérez les demandes et les membres de votre club"
        />

        <div className="members-tabs">
          <button
            className={`members-tab ${activeTab === 'pending' ? 'members-tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Demandes en attente
            {pending.length > 0 && (
              <span className="members-tab-badge">{pending.length}</span>
            )}
          </button>
          <button
            className={`members-tab ${activeTab === 'members' ? 'members-tab-active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Membres ({members.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {pending.length === 0 ? (
              <p className="dash-empty" style={{ padding: '40px 0' }}>
                Aucune demande en attente 🎉
              </p>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((m: any) => (
                    <tr key={m._id}>
                      <td>
                        <div className="dash-actions">
                          <div className="dash-pending-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                            {m.userId?.firstName?.[0]}{m.userId?.lastName?.[0]}
                          </div>
                          <span className="dash-table-name">
                            {m.userId?.firstName} {m.userId?.lastName}
                          </span>
                        </div>
                      </td>
                      <td>{m.userId?.email}</td>
                      <td>{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div className="dash-actions">
                          <Button variant="success" size="sm" onClick={() => handleAccept(m._id)}>
                            ✓ Accepter
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemove(m._id, `${m.userId?.firstName} ${m.userId?.lastName}`)}
                          >
                            ✕ Refuser
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {members.length === 0 ? (
              <p className="dash-empty" style={{ padding: '40px 0' }}>
                Aucun membre pour le moment.
              </p>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Email</th>
                    <th>Depuis</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m: any) => (
                    <tr key={m._id}>
                      <td>
                        <div className="dash-actions">
                          <div className="dash-pending-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                            {m.userId?.firstName?.[0]}{m.userId?.lastName?.[0]}
                          </div>
                          <span className="dash-table-name">
                            {m.userId?.firstName} {m.userId?.lastName}
                          </span>
                        </div>
                      </td>
                      <td>{m.userId?.email}</td>
                      <td>{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemove(m._id, `${m.userId?.firstName} ${m.userId?.lastName}`)}
                        >
                          Retirer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}