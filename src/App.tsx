import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage    from './pages/Login';
import RegisterPage from './pages/Register';
import Home         from './pages/Home';
import ClubsPage    from './pages/Clubs';
import ClubDetail   from './pages/ClubDetail';
import Classement   from './pages/Classement';

import ProfilePage  from './pages/Profile';
import MyClubsPage  from './pages/Myclubs';
import CreateClub   from './pages/CreateClub';

import DashboardHome from './pages/Dashboard/DashboardHome';
import MembersPage   from './pages/Dashboard/Members';
import EventsPage    from './pages/Dashboard/Events';
import PollsPage     from './pages/Dashboard/Polls';
import GalleryPage   from './pages/Dashboard/Gallery';
import ClubSettings  from './pages/Dashboard/Clubsettings';

import AdminHome    from './pages/Admin/Adminhome';
import AdminClubs   from './pages/Admin/Adminclubs';
import AdminUsers   from './pages/Admin/Adminusers';
import AdminEvents  from './pages/Admin/Adminevents';
import AdminStats   from './pages/Admin/Adminstats';
import AccessDenied  from './pages/AccessDenied';



function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles:    string[];
}) {
  const { user, loading } = useAuth();
  if (loading)                       return <LoadingScreen />;
  if (!user)                         return <Navigate to="/login" replace />;
  if (!roles.includes(user.role))    return <AccessDenied message="Accès réservé aux administrateurs." />;
  return <>{children}</>;
}



function LoadingScreen() {
  return (
    <div style={{
      minHeight:       '100vh',
      background:      'var(--bg-page)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      flexDirection:   'column',
      gap:             '16px',
    }}>
      <div style={{
        width:           '40px',
        height:          '40px',
        border:          '3px solid var(--border-light)',
        borderTop:       '3px solid var(--primary)',
        borderRadius:    '50%',
        animation:       'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
        Chargement...
      </p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


function AppRoutes() {
  return (
    <Routes>

      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />
      <Route path="/"           element={<Home />} />
      <Route path="/clubs"      element={<ClubsPage />} />
      <Route path="/clubs/:id"  element={<ClubDetail />} />
      <Route path="/classement" element={<Classement />} />

      <Route path="/profile"    element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/mes-clubs"  element={<PrivateRoute><MyClubsPage /></PrivateRoute>} />
      <Route path="/creer-club" element={<PrivateRoute><CreateClub /></PrivateRoute>} />

      <Route path="/dashboard"              element={<PrivateRoute><DashboardHome /></PrivateRoute>} />
      <Route path="/dashboard/membres"      element={<PrivateRoute><MembersPage /></PrivateRoute>} />
      <Route path="/dashboard/evenements"   element={<PrivateRoute><EventsPage /></PrivateRoute>} />
      <Route path="/dashboard/sondages"     element={<PrivateRoute><PollsPage /></PrivateRoute>} />
      <Route path="/dashboard/galerie"      element={<PrivateRoute><GalleryPage /></PrivateRoute>} />
      <Route path="/dashboard/settings"     element={<PrivateRoute><ClubSettings /></PrivateRoute>} />

      <Route path="/admin"                  element={<RoleRoute roles={['admin']}><AdminHome /></RoleRoute>} />
      <Route path="/admin/clubs"            element={<RoleRoute roles={['admin']}><AdminClubs /></RoleRoute>} />
      <Route path="/admin/utilisateurs"     element={<RoleRoute roles={['admin']}><AdminUsers /></RoleRoute>} />
      <Route path="/admin/evenements"       element={<RoleRoute roles={['admin']}><AdminEvents /></RoleRoute>} />
      <Route path="/admin/stats"            element={<RoleRoute roles={['admin']}><AdminStats /></RoleRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}