import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importando o hook da raiz conforme sua estrutura atual
import { useAuth } from "../hooks/useAuth.js";
import api from "../services/api.js"; 

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
      const data = await api.login(email, password);

      if (data && data.access_token) {
        login(data.user, data.access_token);
        
        if (data.user?.primeiroAcesso) {
          navigate('/reset-password');
        } else {
          navigate('/alunos');
        }
      } else {
        alert('Erro na resposta do servidor.');
      }
    } catch (error) {
      console.error("Erro ao logar:", error);
      const msg = error.response?.data?.message || 'Usuário ou senha incorretos!';
      alert(msg);
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
            type="email" required value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Senha:</label>
          <input 
            type="password" required value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <button 
          type="submit" disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}