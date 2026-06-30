import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';


import LoginPage    from './pages/Login';
import RegisterPage from './pages/Register';
import Home         from './pages/Home';
import Clubs        from './pages/Clubs';
import ClubDetail   from './pages/ClubDetail';
import Profile      from './pages/Profile';
import MyClubs      from './pages/Myclubs';
import DashboardHome from './pages/Dashboard/DashboardHome';
import MembersPage   from './pages/Dashboard/Members';
import EventsPage       from './pages/Dashboard/Events';
import PollsPage      from './pages/Dashboard/Polls';
import GalleryPage     from './pages/Dashboard/Gallery';
import ClubSettings from './pages/Dashboard/Clubsettings';
import AdminHome    from './pages/Admin/Adminhome';
import AdminPage from './pages/Admin/Adminclubs';
import AdminUsers   from './pages/Admin/Adminusers';
import AdminEvents  from './pages/Admin/Adminevents';
import AdminStats   from './pages/Admin/Adminstats';


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
      <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} /> 
      <Route path="/mes-clubs" element={<PrivateRoute><MyClubs /></PrivateRoute>} /> 
      <Route path="/dashboard"           element={<PrivateRoute><DashboardHome /></PrivateRoute>} />
      <Route path="/dashboard/membres"   element={<PrivateRoute><MembersPage /></PrivateRoute>} />
      <Route path="/dashboard/evenements" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
      <Route path="/dashboard/sondages"   element={<PrivateRoute><PollsPage /></PrivateRoute>} />
      <Route path="/dashboard/galerie"    element={<PrivateRoute><GalleryPage /></PrivateRoute>} />
      <Route path="/dashboard/settings"   element={<PrivateRoute><ClubSettings /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminHome /></PrivateRoute>} />
      <Route path="/admin/clubs" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
      <Route path="/admin/utilisateurs" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/evenements"   element={<PrivateRoute><AdminEvents /></PrivateRoute>} />
      <Route path="/admin/statistiques" element={<PrivateRoute><AdminStats /></PrivateRoute>} />
      
      
      <Route path="/dashboard" element={
          <RoleRoute roles={['president']}>
            <DashboardHome />
          </RoleRoute>
        }
      /> 

      
       <Route path="/admin" element={
          <RoleRoute roles={['admin']}>
            <AdminHome />
          </RoleRoute>
        }
      /> 

      <Route path="*" element={<Navigate to="/login" replace />} />
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