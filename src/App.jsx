import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthProvider";
import "./App.css";

// Componentes e Páginas
import Menu from "./components/Menu";
import Login from "./pages/Login";
import Alunos from "./pages/Alunos";
import Cursos from "./pages/Cursos";
import Matriculas from "./pages/Matriculas";
import Agenda from "./pages/Agenda";
import FinanceiroGeral from "./pages/Financeiro";

// --- COMPONENTE DE PROTEÇÃO DE ROTA ---
const PrivateLayout = ({ children, roleRequired }) => {
  const { signed, user, loading } = useContext(AuthContext);

  // Se o contexto ainda estiver carregando os dados do localStorage
  if (loading) {
    return <div style={{ padding: "20px" }}>Carregando acesso...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  // Adicionamos o 'user?' para evitar erro se o objeto vier vazio por um milissegundo
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/alunos" />;
  }

  return (
    <div style={{ display: "flex" }}>
      <Menu />

      <main
        style={{
          flex: 1,
          padding: "20px",
          marginLeft: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // Isso força o conteúdo para a esquerda
          justifyContent: "flex-start", // Isso força o conteúdo para o topo
        }}
      >
        {children}
      </main>
    </div>
  );
};

function AppContent() {
  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas (Lógica de Layout + Segurança) */}
      <Route path="/" element={<Navigate to="/alunos" />} />

      <Route
        path="/alunos"
        element={
          <PrivateLayout>
            <Alunos />
          </PrivateLayout>
        }
      />
      <Route
        path="/cursos"
        element={
          <PrivateLayout>
            <Cursos />
          </PrivateLayout>
        }
      />
      <Route
        path="/matriculas"
        element={
          <PrivateLayout>
            <Matriculas />
          </PrivateLayout>
        }
      />
      <Route
        path="/agenda"
        element={
          <PrivateLayout>
            <Agenda />
          </PrivateLayout>
        }
      />

      {/* Apenas ADM acessa o Financeiro */}
      <Route
        path="/financeiro"
        element={
          <PrivateLayout roleRequired="adm">
            <FinanceiroGeral />
          </PrivateLayout>
        }
      />

      {/* Rota de fuga: se digitar qualquer coisa errada, volta pro login ou alunos */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
