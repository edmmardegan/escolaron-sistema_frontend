import axios from "axios";

const api_url = "http://localhost:3000"; // Backend NestJS no seu Ubuntu

const axiosInstance = axios.create({
  baseURL: api_url,
});

export const api = {
  // --- AUTENTICAÇÃO ---
  login: async (username, password) => {
    // Retorna os dados do usuário (id, username, role)
    const response = await axiosInstance.post("/auth/login", {
      username,
      password,
    });
    return response.data;
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
  getResumoFinanceiroProfessores: () =>
    axiosInstance.get("/financeiro/resumo-professores"),

  getResumoProfessores: () =>
    axiosInstance.get("/financeiro/resumo-professores"),

  gerarCarnet: async (matriculaId, ano) => {
    return (
      await axiosInstance.post("/financeiro/gerar", {
        matriculaId: Number(matriculaId),
        ano: Number(ano),
      })
    ).data;
  },

  getPorMatricula: async (matriculaId) =>
    (await axiosInstance.get(`/financeiro/matricula/${matriculaId}`)).data,

  getAllFinanceiro: async () => (await axiosInstance.get("/financeiro")).data,

  pagar: async (id) =>
    (await axiosInstance.post(`/financeiro/${id}/pagar`)).data,

  estornar: async (id) =>
    (await axiosInstance.post(`/financeiro/${id}/estornar`)).data,

  deleteParcela: async (id) =>
    (await axiosInstance.delete(`/financeiro/${id}`)).data,

  gerarCarnetMassivo: (dadosConfig) => {
    return axiosInstance.post("/financeiro/gerar-massivo", dadosConfig, {
      responseType: "blob",
    });
  },

  // --- AGENDA E FREQUÊNCIA ---
  getAgenda: (data) => axiosInstance.get(`/aulas/agenda?data=${data}`),
  getAulasNaoLancadas: () => axiosInstance.get("/aulas/nao-lancadas"),
  getFaltasPendentes: () => axiosInstance.get("/aulas/pendentes"),
  getHistoricoAulas: () => axiosInstance.get("/aulas/historico"),
  gerarMensal: () => axiosInstance.post("/aulas/gerar-mensal"),
  registrarPresenca: (id) => axiosInstance.patch(`/aulas/${id}/presenca`),
  registrarFalta: (id, motivo) =>
    axiosInstance.patch(`/aulas/${id}/falta`, { motivo }),
  registrarReposicao: (id, novaData) =>
    axiosInstance.patch(`/aulas/${id}/reposicao`, { novaData }),
};

/*import axios from "axios";

const api_url = "http://localhost:3000"; // Backend NestJS

const axiosInstance = axios.create({
  baseURL: api_url,
});

export const api = {
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
        notaTeorica: teorica, // <--- O Backend espera esse nome exato
        notaPratica: pratica, // <--- O Backend espera esse nome exato
      })
    ).data;
  },

  getResumoFinanceiroProfessores: () => axiosInstance.get('/financeiro/resumo-professores'),

  getResumoProfessores: () => axiosInstance.get('/financeiro/resumo-professores'),
  
  gerarCarnet: async (matriculaId, ano) => {
    return (
      await axiosInstance.post("/financeiro/gerar", {
        matriculaId: Number(matriculaId),
        ano: Number(ano),
      })
    ).data;
  },

  getPorMatricula: async (matriculaId) =>
    (await axiosInstance.get(`/financeiro/matricula/${matriculaId}`)).data,
  
  getAllFinanceiro: async () => (await axiosInstance.get("/financeiro")).data, // Para o Financeiro Geral

  pagar: async (id) =>
    (await axiosInstance.post(`/financeiro/${id}/pagar`)).data,
  
  estornar: async (id) =>
    (await axiosInstance.post(`/financeiro/${id}/estornar`)).data,
  
  deleteParcela: async (id) =>
    (await axiosInstance.delete(`/financeiro/${id}`)).data,
  
  gerarCarnetMassivo: (dadosConfig) => {
    return axiosInstance.post("/financeiro/gerar-massivo", dadosConfig, { 
      responseType: 'blob' 
    });
  },

// AGENDA E FREQUÊNCIA
  getAgenda: (data) => axiosInstance.get(`/aulas/agenda?data=${data}`),
  getAulasNaoLancadas: () => axiosInstance.get('/aulas/nao-lancadas'),
  getFaltasPendentes: () => axiosInstance.get('/aulas/pendentes'),
  getHistoricoAulas: () => axiosInstance.get('/aulas/historico'),
  gerarMensal: () => axiosInstance.post('/aulas/gerar-mensal'),
  registrarPresenca: (id) => axiosInstance.patch(`/aulas/${id}/presenca`),
  registrarFalta: (id, motivo) => axiosInstance.patch(`/aulas/${id}/falta`, { motivo }),
  registrarReposicao: (id, novaData) => axiosInstance.patch(`/aulas/${id}/reposicao`, { novaData }),
  
};
*/
