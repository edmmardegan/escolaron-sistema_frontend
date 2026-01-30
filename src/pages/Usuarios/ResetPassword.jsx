import React, { useState } from "react";
import api from "../../services/api"; // Removidas as chaves { } para usar o export default
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const ResetPassword = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      // USANDO A FUNÇÃO QUE CRIAMOS NO API.JS:
      const response = await api.resetPassword(novaSenha);

      console.log("Sucesso:", response);
      alert("Senha atualizada com sucesso! Por favor, faça login novamente.");

      logout(); // Limpa o localStorage e o estado do usuário
      navigate("/login");
    } catch (error) {
      console.error("Erro detalhado:", error.response?.data || error.message);
      const mensagemErro =
        error.response?.data?.message || "Falha na conexão com o servidor";
      alert(`Erro: ${mensagemErro}`);
    }
  };

  return (
    <div
      className="reset-container"
      style={{ padding: "20px", textAlign: "center" }}
    >
      <h2>Primeiro Acesso</h2>
      <p>
        Por segurança, você precisa cadastrar uma nova senha para o seu usuário.
      </p>
      <form
        onSubmit={handleReset}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "300px",
          margin: "0 auto",
        }}
      >
        <input
          type="password"
          placeholder="Digite sua nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Atualizar Senha
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
