import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import api from '../../services/api';
import { UserRole } from '../../types/index';
import { useToast } from '../../context/ToastContex';
import '../Dashboard/Dashboard.css';



const roleOptions = [
  { value: 'member',    label: 'Membre'    },
  { value: 'president', label: 'Président' },
  { value: 'admin',     label: 'Admin'     },
];

export default function AdminUsers() {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await api.patch(`/users/${userId}`, { role });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleBannir = async (userId: string) => {
    if (!window.confirm('Bannir cet utilisateur ?')) return;
    try {
      const res = await api.patch(`/users/${userId}`, { status: 'banned' });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleReactiver = async (userId: string) => {
    try {
      const res = await api.patch(`/users/${userId}`, { status: 'active' });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Utilisateurs"
          subtitle={`${users.length} utilisateur(s) sur la plateforme`}
        />

        <div className="card dash-section">
          {loading ? (
            <p className="dash-empty">Chargement...</p>
          ) : users.length === 0 ? (
            <p className="dash-empty">Aucun utilisateur.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id}>
                    <td className="dash-table-name">{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>
                      <Select
                        value={u.role}
                        onChange={(value) => handleRoleChange(u._id, value)}
                        options={roleOptions}
                      />
                    </td>
                    <td>
                      <Badge
                        label={u.status === 'active' ? 'Actif' : 'Banni'}
                        variant={u.status === 'active' ? 'success' : 'danger'}
                      />
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="dash-actions">
                        {u.status === 'active' ? (
                          <Button size="sm" variant="danger" onClick={() => handleBannir(u._id)}>
                            Bannir
                          </Button>
                        ) : (
                          <Button size="sm" variant="success" onClick={() => handleReactiver(u._id)}>
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