import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";

// Verifique se estas linhas existem e se os nomes batem com as pastas
import Cursos from "./pages/Cursos";
import Matriculas from "./pages/Matriculas";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import Usuarios from "./pages/Usuarios";
// Restante dos componentes...
import Menu from "./components/Menu.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/Usuarios/ResetPassword.jsx";
import Alunos from "./pages/Alunos/index.jsx";

// --- COMPONENTE DE PROTEÇÃO ---
const PrivateRoute = ({ children, roleRequired }) => {
  const { user, authenticated, loading } = useAuth();

  // 1. Enquanto carrega o LocalStorage, mostra um aviso
  if (loading) {
    return <div className="loading-screen">Verificando permissões...</div>;
  }

  // 2. Se não estiver logado, vai para o Login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se for Primeiro Acesso, bloqueia as páginas e força o Reset
  // IMPORTANTE: Só redireciona se o usuário NÃO estiver na página de reset
  if (user?.primeiroAcesso) {
    return <Navigate to="/reset-password" replace />;
  }

  // 4. Se a rota exigir Admin e o usuário não for
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/alunos" replace />;
  }

  // Se passou em tudo, renderiza o Menu e o Conteúdo
  return (
    <div className="app-layout">
      <Menu />
      <main className="content-container">{children}</main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rota de Reset - Ela é semi-protegida: precisa de login, mas ignora a trava de primeiroAcesso */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rotas Protegidas */}
          <Route
            path="/alunos"
            element={
              <PrivateRoute>
                <Alunos />
              </PrivateRoute>
            }
          />
          <Route
            path="/cursos"
            element={
              <PrivateRoute>
                <Cursos />
              </PrivateRoute>
            }
          />
          <Route
            path="/matriculas"
            element={
              <PrivateRoute>
                <Matriculas />
              </PrivateRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <PrivateRoute>
                <Agenda />
              </PrivateRoute>
            }
          />
          <Route
            path="/financeiro"
            element={
              <PrivateRoute>
                <Financeiro />
              </PrivateRoute>
            }
          />

          {/* Rota restrita a ADMIN */}
          <Route
            path="/usuarios"
            element={
              <PrivateRoute roleRequired="admin">
                <Usuarios />
              </PrivateRoute>
            }
          />

          {/* Redirecionamentos de Segurança */}
          <Route path="/" element={<Navigate to="/alunos" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
