import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { mockUsers } from '../../data/mockData';
import { User, UserRole } from '../../types/index';
import '../Dashboard/Dashboard.css';

const roleOptions = [
  { value: 'member', label: 'Membre' },
  { value: 'president', label: 'Président' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([...mockUsers]);

  const handleRoleChange = (userId: string, role: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: role as UserRole } : u)));
  };

  const handleBannir = (userId: string) => {
    if (!window.confirm('Bannir cet utilisateur ? Il ne pourra plus se connecter.')) return;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'banned' } : u)));
  };

  const handleReactiver = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u)));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <PageHeader title="Utilisateurs" subtitle={`${users.length} utilisateur(s) sur la plateforme`} />

        <div className="card dash-section">
          {users.length === 0 ? (
            <p className="dash-empty">Aucun utilisateur pour le moment.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Inscrit le</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="dash-table-name">{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>
                      <Select value={u.role} onChange={(value) => handleRoleChange(u.id, value)} options={roleOptions} />
                    </td>
                    <td>
                      <Badge label={u.status === 'active' ? 'Actif' : 'Banni'} variant={u.status === 'active' ? 'success' : 'danger'} />
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="dash-actions">
                        {u.status === 'active' ? (
                          <Button size="sm" variant="danger" onClick={() => handleBannir(u.id)}>Bannir</Button>
                        ) : (
                          <Button size="sm" variant="success" onClick={() => handleReactiver(u.id)}>Réactiver</Button>
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