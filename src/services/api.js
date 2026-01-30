import axios from "axios";

// 1. Definição da URL
const api_url = "http://localhost:3000";

// 2. Criamos a instância do Axios
const axiosInstance = axios.create({
  baseURL: api_url,
});

// 3. INTERCEPTADOR DE TOKEN (Mantido seu código original)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4. OBJETO COM TODAS AS ROTAS (Incluindo a de Reset Password)
export const api = {
  // --- AUTENTICAÇÃO E CONTA ---
  login: async (email, password) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  // ADICIONEI ESTA FUNÇÃO AQUI PARA O RESET FUNCIONAR:
  resetPassword: async (novaSenha) => {
    return (await axiosInstance.post("/usuarios/reset-password", { novaSenha }))
      .data;
  },

  // --- USUÁRIOS ---
  saveUsuario: async (usuario) => {
    return (await axiosInstance.post("/usuarios", usuario)).data;
  },

  // --- ALUNOS ---
  getAlunos: async () => (await axiosInstance.get("/alunos")).data,
  saveAluno: async (aluno, id = null) => {
    if (id) return (await axiosInstance.put(`/alunos/${id}`, aluno)).data;
    return (await axiosInstance.post("/alunos", aluno)).data;
  },
  deleteAluno: async (id) => (await axiosInstance.delete(`/alunos/${id}`)).data,

  // --- CURSOS ---
  getCursos: async () => (await axiosInstance.get("/cursos")).data,
  saveCurso: async (curso, id = null) => {
    if (id) return (await axiosInstance.put(`/cursos/${id}`, curso)).data;
    return (await axiosInstance.post("/cursos", curso)).data;
  },
  deleteCurso: async (id) => (await axiosInstance.delete(`/cursos/${id}`)).data,

  // --- MATRÍCULAS ---
  getMatriculas: async () => (await axiosInstance.get("/matriculas")).data,
  saveMatricula: async (matricula, id = null) => {
    if (id)
      return (await axiosInstance.put(`/matriculas/${id}`, matricula)).data;
    return (await axiosInstance.post("/matriculas", matricula)).data;
  },
  deleteMatricula: async (id) =>
    (await axiosInstance.delete(`/matriculas/${id}`)).data,
  updateNota: async (termoId, teorica, pratica) => {
    return (
      await axiosInstance.patch(`/matriculas/termo/${termoId}`, {
        notaTeorica: teorica,
        notaPratica: pratica,
      })
    ).data;
  },

  // --- FINANCEIRO ---
  gerarParcelaGlobal: (dadosConfig) =>
    axiosInstance.post("/financeiro/gerar-lote-anual", dadosConfig),
  gerarParcelaIndividual: (dados) =>
    axiosInstance.post("/financeiro/gerar-individual", dados),
  getAllFinanceiro: async () => (await axiosInstance.get("/financeiro")).data,
  getPorMatricula: async (matriculaId) =>
    (await axiosInstance.get(`/financeiro/matricula/${matriculaId}`)).data,
  pagar: async (id) =>
    (await axiosInstance.post(`/financeiro/${id}/pagar`)).data,
  estornar: async (id) =>
    (await axiosInstance.post(`/financeiro/${id}/estornar`)).data,
  deleteParcela: async (id) =>
    (await axiosInstance.delete(`/financeiro/${id}`)).data,

  // --- AGENDA E FREQUÊNCIA ---
  getAgenda: (data) => axiosInstance.get(`/aulas/agenda?data=${data}`),
  registrarPresenca: (id) => axiosInstance.patch(`/aulas/${id}/presenca`),
  getAulasNaoLancadas: () => axiosInstance.get("/aulas/nao-lancadas"),
  getHistoricoAulas: () => axiosInstance.get("/aulas/historico"),
};

// EXPORTAÇÃO PADRÃO (Importante para o seu projeto)
export default api;
