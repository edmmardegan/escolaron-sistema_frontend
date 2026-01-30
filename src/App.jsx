import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// src/App.jsx
import { AuthProvider, useAuth } from "./AuthContext.jsx"; // Está na mesma pasta
import Menu from "./components/Menu.jsx";        // Pasta components
import Login from "./pages/Login.jsx";           // Arquivo direto em pages

// Páginas dentro de subpastas (O React busca o index.jsx automaticamente)
import Alunos from "./pages/Alunos"; 
import Cursos from "./pages/Cursos";
import Matriculas from "./pages/Matriculas";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";

import "./App.css";

// COMPONENTE DE PROTEÇÃO DE ROTA
const PrivateRoute = ({ children, roleRequired }) => {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "20px" }}>Carregando acesso...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  // Exemplo de proteção por nível de acesso (opcional)
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/alunos" />;
  }

  return (
    <div style={{ display: "flex" }}>
      <Menu />
      <main style={{ flex: 1, padding: "20px", marginLeft: "20px" }}>
        {children}
      </main>
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
          
          {/* Redirecionamento Inicial */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rotas Protegidas (Usando o padrão de subpastas) */}
          <Route path="/alunos" element={<PrivateRoute><Alunos /></PrivateRoute>} />
          <Route path="/cursos" element={<PrivateRoute><Cursos /></PrivateRoute>} />
          <Route path="/matriculas" element={<PrivateRoute><Matriculas /></PrivateRoute>} />
          <Route path="/agenda" element={<PrivateRoute><Agenda /></PrivateRoute>} />
          <Route path="/financeiro" element={<PrivateRoute><Financeiro /></PrivateRoute>} />

          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}