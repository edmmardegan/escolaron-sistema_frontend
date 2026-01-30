import axios from "axios";

const api_url = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: api_url,
});

// Envia o Token automaticamente em todas as chamadas
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = {
  // Autenticação
  login: async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    return res.data;
  },

  resetPassword: async (novaSenha) => {
    const res = await axiosInstance.post("/usuarios/reset-password", { novaSenha });
    return res.data;
  },

  // Alunos
  getAlunos: async () => {
    const res = await axiosInstance.get("/alunos");
    return res.data;
  },

  saveAluno: async (aluno, id = null) => {
    if (id) return (await axiosInstance.put(`/alunos/${id}`, aluno)).data;
    return (await axiosInstance.post("/alunos", aluno)).data;
  },

  deleteAluno: async (id) => {
    const res = await axiosInstance.delete(`/alunos/${id}`);
    return res.data;
  },

  // Usuários
  saveUsuario: async (usuario) => {
    const res = await axiosInstance.post("/usuarios", usuario);
    return res.data;
  },
};

export default api;