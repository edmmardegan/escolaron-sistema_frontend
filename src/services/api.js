import axios from "axios";

// Verifique se o seu NestJS está na 3000 (padrão Ubuntu) ou 8080
const api_url = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: api_url,
});

// --- INTERCEPTADOR DE TOKEN ---
// Esta parte garante que o Token seja enviado em todas as requisições automaticamente
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // SÓ ADICIONA O HEADER SE O TOKEN EXISTIR
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export const api = {
  // --- AUTENTICAÇÃO ---
login: async (email, password) => { // Mudei de username para email para ficar claro
  const response = await axiosInstance.post("/auth/login", {
    email,     // O NestJS vai receber 'email'
    password,  // O NestJS vai receber 'password'
  });
  return response.data;
},
  // --- ALUNOS ---
  getAlunos: async () => {
    const res = await axiosInstance.get("/alunos");
    return res.data;
  },
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
    if (id) return (await axiosInstance.put(`/matriculas/${id}`, matricula)).data;
    return (await axiosInstance.post("/matriculas", matricula)).data;
  },
  deleteMatricula: async (id) => (await axiosInstance.delete(`/matriculas/${id}`)).data,

  updateNota: async (termoId, teorica, pratica) => {
    return (
      await axiosInstance.patch(`/matriculas/termo/${termoId}`, {
        notaTeorica: teorica,
        notaPratica: pratica,
      })
    ).data;
  },

  // --- FINANCEIRO ---
  gerarParcelaGlobal: (dadosConfig) => {
    return axiosInstance.post("/financeiro/gerar-lote-anual", dadosConfig);
  },

  gerarParcelaIndividual: (dados) => {
    return axiosInstance.post("/financeiro/gerar-individual", dados);
  },

  getAllFinanceiro: async () => {
    const res = await axiosInstance.get("/financeiro");
    return res.data;
  },
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