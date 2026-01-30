import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [name, setName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      login(name);
      navigate('/alunos');
    } else {
      alert('Digite um nome de usuário');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ padding: '40px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h1>Login</h1>
        <input 
          type="text" 
          placeholder="Usuário" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          style={{ padding: '10px' }}
        />
        <input type="password" placeholder="Senha" style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}