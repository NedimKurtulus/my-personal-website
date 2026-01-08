import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Mevcut sayfalar
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Yeni Admin sayfaları
import Users from './pages/Admin/Users';
import AllProjects from './pages/Admin/AllProjects';
import AllTasks from './pages/Admin/AllTasks';

// Yeni User sayfaları
import MyProjects from './pages/User/MyProjects';
import MyTasks from './pages/User/MyTasks';
import Profile from './pages/User/Profile';

// Yeni Shared sayfaları
import Tags from './pages/Shared/Tags';
import Projects from './pages/Shared/Projects';

const PrivateRoute: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-8">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===== PUBLIC ROUTES (Herkes erişebilir) ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ===== PROTECTED ROUTES (Giriş yapmış herkes) ===== */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* ===== ADMIN ONLY ROUTES (Sadece Admin) ===== */}
          <Route path="/admin/users" element={
            <PrivateRoute adminOnly>
              <Users />
            </PrivateRoute>
          } />

          <Route path="/admin/all-projects" element={
            <PrivateRoute adminOnly>
              <AllProjects />
            </PrivateRoute>
          } />

          <Route path="/admin/all-tasks" element={
            <PrivateRoute adminOnly>
              <AllTasks />
            </PrivateRoute>
          } />

          {/* ===== USER ROUTES (Her giriş yapmış kullanıcı) ===== */}
          <Route path="/user/my-projects" element={
            <PrivateRoute>
              <MyProjects />
            </PrivateRoute>
          } />

          <Route path="/user/my-tasks" element={
            <PrivateRoute>
              <MyTasks />
            </PrivateRoute>
          } />

          <Route path="/user/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/user/profile/:id" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          {/* ===== SHARED ROUTES (Her giriş yapmış kullanıcı) ===== */}
          <Route path="/shared/tags" element={
            <PrivateRoute>
              <Tags />
            </PrivateRoute>
          } />

          <Route path="/shared/projects" element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          } />

          {/* ===== DEFAULT ROUTE ===== */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* ===== 404 ROUTE ===== */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Sayfa bulunamadı</p>
                <a href="/dashboard" className="text-blue-500 hover:underline">
                  Dashboard'a dön
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;