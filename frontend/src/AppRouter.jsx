import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UiProvider } from './contexts/UiContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import LoadingState from './components/ui/LoadingState';

const App = React.lazy(() => import('./App.jsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const PipefyPage = React.lazy(() => import('./pages/PipefyPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const SetPasswordPage = React.lazy(() => import('./pages/SetPasswordPage').then((m) => ({ default: m.SetPasswordPage })));

// ============================================
// CONFIGURAÇÃO DE ROTAS
// ============================================

const AppRouter = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <UiProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingState message="Carregando página..." />}>
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
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </UiProvider>
  </Router>
);

export default AppRouter;
