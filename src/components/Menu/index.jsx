import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import {
  FaUser,
  FaBook,
  FaClipboardList,
  FaCalendarAlt,
  FaChartBar,
  FaSignOutAlt, // Ícone para sair
} from "react-icons/fa";
import "./styles.css";

export default function Menu() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  // Função para verificar se o link está ativo
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Sistema Escolar</h3>
        {user && (
          <small>
            Logado como: {user.username} ({user.role})
          </small>
        )}
      </div>

      <ul className="nav-list">
        <li>
          <Link to="/alunos" className={isActive("/alunos")}>
            <FaUser /> Alunos
          </Link>
        </li>
        <li>
          <Link to="/cursos" className={isActive("/cursos")}>
            <FaBook /> Cursos
          </Link>
        </li>
        <li>
          <Link to="/matriculas" className={isActive("/matriculas")}>
            <FaClipboardList /> Matrículas
          </Link>
        </li>
        <li>
          <Link to="/agenda" className={isActive("/agenda")}>
            <FaCalendarAlt /> Agenda
          </Link>
        </li>

        {/* --- ABA RESTRITA APENAS PARA ADM --- */}
        {user?.role === "adm" && (
          <>
            <li>
              <Link to="/financeiro" className={isActive("/financeiro")}>
                <FaChartBar /> Financeiro Geral
              </Link>
            </li>
            <li>
              <Link to="/relatorios" className={isActive("/relatorios")}>
                <FaChartBar /> Relatórios
              </Link>
            </li>
          </>
        )}

        {/* --- BOTÃO DE SAIR --- */}
        <li className="logout-item" style={{ marginTop: "20px" }}>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "#ff4d4d",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px",
              width: "100%",
            }}
          >
            <FaSignOutAlt /> Sair do Sistema
          </button>
        </li>
      </ul>
    </nav>
  );
}
