import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import { MembershipStatusBadge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { mockClubs, mockMemberships, mockUsers } from '../../data/mockData';
import './Dashboard.css';

export default function MembersPage() {
  const { user } = useAuth();
  const club = mockClubs.find((c) => c.presidentId === user?.id);
  const [memberships, setMemberships] = useState([...mockMemberships]);
  const [activeTab, setActiveTab] = useState<'pending' | 'members'>('pending');

  if (!club) return null;

  const pending = memberships.filter(
    (m) => m.clubId === club.id && m.status === 'pending'
  );
  const members = memberships.filter(
    (m) => m.clubId === club.id && m.status === 'member'
  );

  const handleAccept = (membershipId: string) => {
    setMemberships((prev) =>
      prev.map((m) =>
        m.id === membershipId ? { ...m, status: 'member' } : m
      )
    );
  };

  const handleRemove = (membershipId: string, name: string) => {
    if (!window.confirm(`Retirer ${name} du club ?`)) return;
    setMemberships((prev) => prev.filter((m) => m.id !== membershipId));
  };

  const getUserName = (userId: string) => {
    const u = mockUsers.find((u) => u.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : userId;
  };

  const getUserEmail = (userId: string) => {
    const u = mockUsers.find((u) => u.id === userId);
    return u?.email ?? '';
  };

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
                    <th>Date de demande</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="dash-actions">
                          <div className="dash-pending-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                            {getUserName(m.userId)[0]}
                          </div>
                          <span className="dash-table-name">{getUserName(m.userId)}</span>
                        </div>
                      </td>
                      <td>{getUserEmail(m.userId)}</td>
                      <td>{m.joinedAt}</td>
                      <td><MembershipStatusBadge status={m.status} /></td>
                      <td>
                        <div className="dash-actions">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAccept(m.id)}
                          >
                            ✓ Accepter
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemove(m.id, getUserName(m.userId))}
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
                    <th>Membre depuis</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="dash-actions">
                          <div className="dash-pending-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                            {getUserName(m.userId)[0]}
                          </div>
                          <span className="dash-table-name">{getUserName(m.userId)}</span>
                        </div>
                      </td>
                      <td>{getUserEmail(m.userId)}</td>
                      <td>{m.joinedAt}</td>
                      <td><MembershipStatusBadge status={m.status} /></td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemove(m.id, getUserName(m.userId))}
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