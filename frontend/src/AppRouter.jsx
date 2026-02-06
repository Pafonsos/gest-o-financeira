import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UiProvider } from './contexts/UiContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import App from './App';
import AdminPage from './pages/AdminPage';
import PipefyPage from './pages/PipefyPage';
import ChatPage from './pages/ChatPage';
import LandingPage from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { SetPasswordPage } from './pages/SetPasswordPage';

// ============================================
// CONFIGURAÇÃO DE ROTAS
// ============================================

const AppRouter = () => {
  console.log(' AppRouter renderizando');
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UiProvider>
        <AuthProvider>
          <Routes>
          {/* Rota de login/registro */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/home" element={<LandingPage />} />

          {/* Rota protegida - Dashboard principal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida - Painel de admin (apenas para admins) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* Rota protegida - Pipefy (apenas para admins) */}
          <Route
            path="/pipefy"
            element={
              <AdminRoute>
                <PipefyPage />
              </AdminRoute>
            }
          />

          {/* Rota protegida - Chat */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Rota raiz - redireciona para dashboard ou login */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" />}
          />

          {/* Rota 404 */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" />}
          />
          </Routes>
        </AuthProvider>
      </UiProvider>
    </Router>
  );
};

export default AppRouter;










