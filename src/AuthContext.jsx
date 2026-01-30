import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // Inicializa o estado lendo do localStorage para manter o usuário logado ao dar F5
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Função de login que recebe os dados do usuário e o token do NestJS
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated: !!user, // Mudei de 'signed' para 'authenticated'
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
