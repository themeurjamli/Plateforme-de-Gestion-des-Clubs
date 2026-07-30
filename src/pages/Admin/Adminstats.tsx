import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import StatCard from '../../components/ui/Statcard';
import api from '../../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import '../Dashboard/Dashboard.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminStats() {
  const [clubs,   setClubs]   = useState<any[]>([]);
  const [users,   setUsers]   = useState<any[]>([]);
  const [events,  setEvents]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchAll = async () => {
    try {
      const [clubsRes, usersRes, eventsRes] = await Promise.all([
        api.get('/clubs/all').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] })),
      ]);

      setClubs(Array.isArray(clubsRes.data) ? clubsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
    } catch (err) {
      console.error(err);
      setClubs([]);
      setUsers([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  fetchAll();
}, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content"><p className="dash-empty">Chargement...</p></div>
      </div>
    );
  }


  const categoryCount: Record<string, number> = {};
  clubs.forEach((c) => {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'Actifs',     value: clubs.filter((c) => c.status === 'active').length   },
    { name: 'En attente', value: clubs.filter((c) => c.status === 'pending').length  },
    { name: 'Inactifs',   value: clubs.filter((c) => c.status === 'inactive').length },
    { name: 'Rejetés',    value: clubs.filter((c) => c.status === 'rejected').length },
  ];

  const monthCount: Record<string, number> = {};
  users.forEach((u) => {
    const month = new Date(u.createdAt).toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
    monthCount[month] = (monthCount[month] || 0) + 1;
  });
  const monthData = Object.entries(monthCount)
    .slice(-6)
    .map(([name, value]) => ({ name, value }));

  const eventStatusData = [
    { name: 'À venir',  value: events.filter((e) => e.status === 'upcoming').length  },
    { name: 'Passés',   value: events.filter((e) => e.status === 'past').length      },
    { name: 'Annulés',  value: events.filter((e) => e.status === 'cancelled').length },
  ];

  
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Statistiques"
          subtitle="Vue analytique complète de la plateforme"
        />

        <div className="dash-stats-grid">
          <StatCard label="Total clubs"       value={clubs.length}                                   icon="🏛" color="blue"    />
          <StatCard label="Clubs actifs"      value={clubs.filter((c) => c.status === 'active').length} icon="✅" color="green"   />
          <StatCard label="Utilisateurs"      value={users.length}                                   icon="👥" color="blue"    />
          <StatCard label="Événements"        value={events.length}                                  icon="📅" color="warning" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Clubs par statut
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Clubs" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Clubs par catégorie
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Nouveaux membres par mois
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} name="Inscriptions" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              Événements par statut
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={eventStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Événements">
                  {eventStatusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
}