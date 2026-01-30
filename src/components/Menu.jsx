import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../AuthContext.jsx"; // ".." sai de components e acha o AuthContext na src

export default function Menu() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuStyle = {
    width: '150px',
    height: '100vh',
    background: '#2c3e50',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  return (
    <nav style={menuStyle}>
      <h2>Sistema</h2>
      <p>Olá, {user?.name}</p>
      <hr />
      {user?.role === 'admin' && (
        <>
          <Link to="/usuarios" style={{color: 'white', textDecoration: 'none'}}>Usuários</Link>
          <Link to="/financeiro" style={{color: 'white', textDecoration: 'none'}}>Financeiro</Link>
        </>
      )}

      <Link to="/alunos" style={{color: 'white', textDecoration: 'none'}}>Alunos</Link>
      <Link to="/cursos" style={{color: 'white', textDecoration: 'none'}}>Cursos</Link>
      <Link to="/matriculas" style={{color: 'white', textDecoration: 'none'}}>Matrículas</Link>
      <Link to="/agenda" style={{color: 'white', textDecoration: 'none'}}>Agenda</Link>
      
      <button onClick={handleLogout} style={{marginTop: '20', background: '#e74c3c', color: 'white', border: 'none', padding: '10px', cursor: 'pointer'}}>
        Sair
      </button>
    </nav>
  );
}