import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Contexto e Estilos
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import "./App.css";

// Componentes
import Menu from "./components/Menu.jsx";

// Páginas
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/Usuarios/ResetPassword.jsx"; // <<-- FALTA ESSA IMPORTAÇÃO!

// Páginas dentro de subpastas
import Alunos from "./pages/Alunos";
import Cursos from "./pages/Cursos";
import Matriculas from "./pages/Matriculas";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import Usuarios from "./pages/Usuarios";

// --- COMPONENTE DE PROTEÇÃO ---
const PrivateRoute = ({ children, roleRequired }) => {
  const { user, authenticated } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  // Se for primeiro acesso, bloqueia TUDO e manda pro Reset
  if (user?.primeiroAcesso) {
    return <Navigate to="/reset-password" />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/login" />; // Ou Dashboard se você tiver um
  }

  return (
    <>
      <Menu /> {/* O Menu só aparece aqui, se ele passou pelas travas */}
      {children}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rota de Reset: Ele precisa estar logado, mas não passa pela PrivateRoute 
              comum para evitar o loop de redirecionamento */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Redirecionamento Inicial */}
          <Route path="/" element={<Navigate to="/login" />} />

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
          <Route
            path="/usuarios"
            element={
              <PrivateRoute roleRequired="admin">
                <Usuarios />
              </PrivateRoute>
            }
          />

          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
