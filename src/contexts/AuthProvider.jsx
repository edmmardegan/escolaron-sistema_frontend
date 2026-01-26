import React, { useState } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('@EscolarApp:user');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
  try {
    // 1. Chama a API
    const userData = await api.login(username, password);
    
    // LOG DE TESTE: veja se isso aparece no F12 ao clicar em entrar
    console.log("Dados recebidos do login:", userData);

    // 2. SALVA NO ESTADO (Isso é o que faz o App.jsx mudar a tela)
    setUser(userData);

    // 3. SALVA NO NAVEGADOR (Para não deslogar no F5)
    localStorage.setItem('@EscolarApp:user', JSON.stringify(userData));
    
  } catch (error) {
    console.error("Erro ao tentar logar:", error);
    throw error;
  }
}

  function logout() {
    localStorage.removeItem('@EscolarApp:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};