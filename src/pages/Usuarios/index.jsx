import React, { useState } from "react";
import api from "../../services/api";

export default function Usuarios() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("123456"); // Senha padrão
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // O seu backend NestJS deve ter a rota POST /usuarios
      await api.saveUsuario({
        nome,
        email,
        senha,
        role,
        primeiroAcesso: true, // Força a troca de senha depois
      });
      alert("Usuário cadastrado com sucesso!");
      setNome("");
      setEmail("");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Gestão de Usuários</h1>
      <form
        onSubmit={handleCadastro}
        style={{
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <input
          placeholder="Nome Completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">Usuário Comum</option>
          <option value="admin">Administrador</option>
        </select>
        <p>
          <small>Senha padrão inicial: 123456</small>
        </p>
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar Usuário"}
        </button>
      </form>
    </div>
  );
}
