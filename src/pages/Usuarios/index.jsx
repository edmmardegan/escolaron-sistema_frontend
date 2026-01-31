import React, { useState } from "react";
import { FaUserPlus, FaSave } from "react-icons/fa";
import api from "../../services/api";
import "./styles.css"; // Usando o mesmo CSS das outras telas

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
      await api.saveUsuario({
        nome,
        email,
        senha,
        role,
        primeiroAcesso: true, // Força o usuário a trocar a senha no primeiro login
      });
      alert("Usuário cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("123456");
      setRole("user");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao cadastrar usuário.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-alunos">
      <div className="card">
        <div className="header-card">
          <h2>
            <FaUserPlus /> Gestão de Usuários
          </h2>
        </div>

        <form onSubmit={handleCadastro} className="form-grid">
          <div className="input-group campo-medio">
            <label>Nome Completo:</label>
            <input
              className="input-field"
              placeholder="Ex: João Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="input-group campo-medio">
            <label>Email (Login):</label>
            <input
              className="input-field"
              placeholder="email@escola.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Nível de Acesso:</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Usuário Comum (Secretaria)</option>
              <option value="admin">Administrador (Total)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Senha Inicial:</label>
            <input
              className="input-field"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <small
              style={{ color: "#666", marginTop: "5px", display: "block" }}
            >
              O usuário deverá trocar esta senha no primeiro acesso.
            </small>
          </div>

          <div className="full-width" style={{ marginTop: "10px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave /> {loading ? "Processando..." : "Cadastrar Usuário"}
            </button>
          </div>
        </form>
      </div>

      <div
        className="card"
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#e9ecef",
        }}
      >
        <h3>Informações Importantes</h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>
            Novos usuários são criados com o status de{" "}
            <strong>Primeiro Acesso</strong>.
          </li>
          <li>
            Ao logar, o sistema detectará esse status e redirecionará para a
            troca de senha.
          </li>
          <li>Certifique-se de que o e-mail é único no sistema.</li>
        </ul>
      </div>
    </div>
  );
}
