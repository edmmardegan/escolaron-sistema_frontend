import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from "../AuthContext.jsx"; // ".." sai de pages e acha o AuthContext na src
import { api } from "../services/api.js";     // ".." sai de pages e entra em services

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chamada para o seu backend NestJS
      // O seu service.api.js deve ter a função login configurada
      const data = await api.login(email, password);

      // O NestJS geralmente retorna um objeto com { user, access_token }
      // Ajuste conforme o retorno real do seu backend
      if (data.access_token) {
        login(data.user, data.access_token);
        navigate('/alunos');
      } else {
        alert('Erro na autenticação');
      }
    } catch (error) {
      console.error("Erro ao logar:", error);
      alert('Usuário ou senha incorretos!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <form onSubmit={handleSubmit} style={{ padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Acesso ao Sistema</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            required
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            placeholder="seu@email.com"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Senha:</label>
          <input 
            type="password" 
            required
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            placeholder="******"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}