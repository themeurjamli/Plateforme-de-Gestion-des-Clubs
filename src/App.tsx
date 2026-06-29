import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';


import LoginPage    from './pages/Login';
import RegisterPage from './pages/Register';
import Home         from './pages/Home';
import Clubs        from './pages/Clubs';
import ClubDetail   from './pages/ClubDetail';
// import Profile      from './pages/Profile';
// import MyClubs      from './pages/MyClubs';
import DashboardHome from './pages/Dashboard/DashboardHome';
import MembersPage   from './pages/Dashboard/Members';
import EventsPage       from './pages/Dashboard/Events';
// import Polls        from './pages/Dashboard/Polls';
// import Gallery      from './pages/Dashboard/Gallery';
// import ClubSettings from './pages/Dashboard/ClubSettings';
// import AdminHome    from './pages/Admin/AdminHome';
// import AdminClubs   from './pages/Admin/AdminClubs';
// import AdminUsers   from './pages/Admin/AdminUsers';


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}



function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {<Route path="/"          element={<Home />} /> }
      <Route path="/clubs"     element={<Clubs />} /> 
      <Route path="/clubs/:id" element={<ClubDetail />} /> 
      {/* ── Pages à débloquer phase par phase ─ */}
      {/* ── Membre connecté ─────────────────── */}
      {/* <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} /> */}
      {/* <Route path="/mes-clubs" element={<PrivateRoute><MyClubs /></PrivateRoute>} /> */}


      <Route path="/dashboard"           element={<PrivateRoute><DashboardHome /></PrivateRoute>} />
      <Route path="/dashboard/membres"   element={<PrivateRoute><MembersPage /></PrivateRoute>} />
      <Route path="/dashboard/evenements" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
      {/* ── Dashboard président ─────────────── */}
       {/*<Route path="/dashboard" element={
          <RoleRoute roles={['president']}>
            <DashboardHome />
          </RoleRoute>
        }
      /> */}

      {/* ── Super Admin ─────────────────────── */}
      {/* <Route path="/admin" element={
          <RoleRoute roles={['admin']}>
            <AdminHome />
          </RoleRoute>
        }
      /> */}

      {/* ── Fallback ────────────────────────── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ─── APP ─────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}