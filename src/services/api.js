import axios from "axios";

const api_url = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: api_url,
});

// Interceptor para enviar o Token JWT automaticamente
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = {
  // === AUTENTICAÇÃO ===
  login: async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    return res.data;
  },

  resetPassword: async (novaSenha) => {
    const res = await axiosInstance.post("/usuarios/reset-password", { novaSenha });
    return res.data;
  },

  // === ALUNOS ===
  getAlunos: async () => (await axiosInstance.get("/alunos")).data,
  
  saveAluno: async (aluno, id = null) => {
    if (id) return (await axiosInstance.put(`/alunos/${id}`, aluno)).data;
    return (await axiosInstance.post("/alunos", aluno)).data;
  },

  deleteAluno: async (id) => (await axiosInstance.delete(`/alunos/${id}`)).data,

  // === CURSOS ===
  getCursos: async () => (await axiosInstance.get("/cursos")).data,

  saveCurso: async (curso, id = null) => {
    if (id) return (await axiosInstance.put(`/cursos/${id}`, curso)).data;
    return (await axiosInstance.post("/cursos", curso)).data;
  },

  deleteCurso: async (id) => (await axiosInstance.delete(`/cursos/${id}`)).data,

  // === MATRÍCULAS ===
  getMatriculas: async () => (await axiosInstance.get("/matriculas")).data,

  saveMatricula: async (matricula, id = null) => {
    if (id) return (await axiosInstance.put(`/matriculas/${id}`, matricula)).data;
    return (await axiosInstance.post("/matriculas", matricula)).data;
  },

  deleteMatricula: async (id) => (await axiosInstance.delete(`/matriculas/${id}`)).data,

  // === NOTAS / BOLETIM ===
  updateNota: async (termoId, notaTeorica, notaPratica) => {
    const res = await axiosInstance.patch(`/matriculas/termo/${termoId}`, {
      notaTeorica,
      notaPratica,
    });
    return res.data;
  },

  // === FINANCEIRO ===
  getAllFinanceiro: async () => (await axiosInstance.get("/financeiro")).data,

  getPorMatricula: async (matriculaId) => (await axiosInstance.get(`/financeiro/matricula/${matriculaId}`)).data,

  pagar: async (id) => (await axiosInstance.post(`/financeiro/${id}/pagar`)).data,

  estornar: async (id) => (await axiosInstance.post(`/financeiro/${id}/estornar`)).data,

  deleteParcela: async (id) => (await axiosInstance.delete(`/financeiro/${id}`)).data,

  gerarParcelaIndividual: async (dados) => (await axiosInstance.post("/financeiro/gerar-individual", dados)).data,

  gerarParcelaGlobal: async (dados) => (await axiosInstance.post("/financeiro/gerar-lote-anual", dados)).data,

  // === USUÁRIOS ===
  saveUsuario: async (usuario) => (await axiosInstance.post("/usuarios", usuario)).data,

  // === 📅 AGENDA AULA (Ajustado para o seu index.jsx) ===
  getAgenda: async (data) => (await axiosInstance.get(`/aulas/agenda?data=${data}`)).data,

  getAulasNaoLancadas: async () => (await axiosInstance.get("/aulas/nao-lancadas")).data,

  getFaltasPendentes: async () => (await axiosInstance.get("/aulas/pendentes")).data,

  getHistoricoAulas: async () => (await axiosInstance.get("/aulas/historico")).data,

  registrarPresenca: async (id) => (await axiosInstance.patch(`/aulas/${id}/presenca`)).data,

  registrarReposicao: async (id, novaData) => {
    const res = await axiosInstance.patch(`/aulas/${id}/reposicao`, { novaData });
    return res.data;
  },

  registrarFalta: async (id, motivo) => (await axiosInstance.patch(`/aulas/${id}/falta`, { motivo })).data,

  gerarAgendaMensal: async () => (await axiosInstance.post("/aulas/gerar-mensal")).data,
};

export default api;