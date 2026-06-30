import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import StatCard from '../../components/ui/Statcard';
import { mockClubs, mockUsers, mockMemberships, mockEvents } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  hint: '#64748B',
  border: '#1E293B',
  textSecondary: '#94A3B8',
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'];

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #2D3F55',
  borderRadius: 8,
  fontSize: 12,
  color: '#F1F5F9',
};

export default function AdminStats() {
  const membersByClub = mockClubs
    .filter((c) => c.status === 'active')
    .map((c) => ({ name: c.name, membres: c.membersCount }));

  const monthLabels: Record<string, string> = {
    '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
    '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
  };

  const usersByMonthMap: Record<string, number> = {};
  mockUsers.forEach((u) => {
    const month = u.createdAt.slice(0, 7); // 'YYYY-MM'
    usersByMonthMap[month] = (usersByMonthMap[month] || 0) + 1;
  });

  const usersByMonth = Object.keys(usersByMonthMap)
    .sort()
    .map((month) => ({
      mois: monthLabels[month.slice(5, 7)] || month,
      nouveaux: usersByMonthMap[month],
    }));

  const membershipCounts = {
    member: mockMemberships.filter((m) => m.status === 'member').length,
    pending: mockMemberships.filter((m) => m.status === 'pending').length,
    banned: mockMemberships.filter((m) => m.status === 'banned').length,
  };

  const membershipData = [
    { name: 'Membres actifs', value: membershipCounts.member },
    { name: 'En attente', value: membershipCounts.pending },
    { name: 'Bannis', value: membershipCounts.banned },
  ].filter((d) => d.value > 0);

  const tauxAdhesion =
    mockMemberships.length > 0
      ? Math.round((membershipCounts.member / mockMemberships.length) * 100)
      : 0;

  const categoryMap: Record<string, number> = {};
  mockClubs.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  const clubsActifs = mockClubs.filter((c) => c.status === 'active').length;
  const totalMembresActifs = membershipCounts.member;
  const evenementsUpcoming = mockEvents.filter((e) => e.status === 'upcoming').length;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <PageHeader
          title="Statistiques détaillées"
          subtitle="Activité, adhésions et croissance de la plateforme"
        />

        <div className="dash-stats-grid">
          <StatCard label="Taux d'adhésion" value={`${tauxAdhesion}%`} icon="📈" color="green" />
          <StatCard label="Membres actifs" value={totalMembresActifs} icon="👥" color="blue" />
          <StatCard label="Clubs actifs" value={clubsActifs} icon="🏛" color="blue" />
          <StatCard label="Événements à venir" value={evenementsUpcoming} icon="📅" color="warning" />
        </div>

        <div className="card dash-section" style={{ marginBottom: 16 }}>
          <div className="dash-section-header">
            <span className="dash-section-title">Membres par club (clubs actifs)</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={membersByClub} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis dataKey="name" stroke={COLORS.textSecondary} fontSize={12} />
              <YAxis stroke={COLORS.textSecondary} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.08)' }} />
              <Bar dataKey="membres" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-two-cols">
          <div className="card dash-section">
            <div className="dash-section-header">
              <span className="dash-section-title">Nouveaux utilisateurs par mois</span>
            </div>
            {usersByMonth.length === 0 ? (
              <p className="dash-empty">Pas assez de données pour afficher ce graphique.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={usersByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                  <XAxis dataKey="mois" stroke={COLORS.textSecondary} fontSize={12} />
                  <YAxis stroke={COLORS.textSecondary} fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="nouveaux"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COLORS.success }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card dash-section">
            <div className="dash-section-header">
              <span className="dash-section-title">Répartition des demandes d'adhésion</span>
            </div>
            {membershipData.length === 0 ? (
              <p className="dash-empty">Aucune adhésion enregistrée.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {membershipData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: COLORS.textSecondary }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card dash-section">
          <div className="dash-section-header">
            <span className="dash-section-title">Répartition des clubs par catégorie</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}