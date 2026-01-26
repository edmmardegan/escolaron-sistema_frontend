import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import {
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaHistory,
  FaExclamationTriangle,
  FaUndoAlt,
  FaClock,
} from "react-icons/fa";
import "./styles.css";

export default function Agenda() {
  // --- ESTADOS ---
  const [aulas, setAulas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("dia"); // dia, pendentes, faltas, historico
  const [dataAgenda, setDataAgenda] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [carregando, setCarregando] = useState(false);

  // --- FUNÇÃO AUXILIAR: DIA DA SEMANA ---
  const getDiaSemanaExtenso = (data) => {
    if (!data) return "";
    const dias = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    // Força meio-dia para evitar erros de fuso horário local
    const dateObj = new Date(data + "T12:00:00");
    return dias[dateObj.getDay()];
  };

  // --- CARREGAMENTO DE DADOS ---
  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      let response;

      if (abaAtiva === "dia") {
        response = await api.getAgenda(dataAgenda);
      } else if (abaAtiva === "pendentes") {
        response = await api.getAulasNaoLancadas();
      } else if (abaAtiva === "faltas") {
        response = await api.getFaltasPendentes();
      } else if (abaAtiva === "historico") {
        response = await api.getHistoricoAulas();
      }

      const dados = response.data || response;
      setAulas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setAulas([]);
    } finally {
      setCarregando(false);
    }
  }, [abaAtiva, dataAgenda]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // --- AÇÕES ---
  const handlePresenca = async (id) => {
    try {
      await api.registrarPresenca(id);
      carregarDados();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFalta = async (id) => {
    const motivo = prompt("Motivo da falta:");
    if (motivo !== null) {
      try {
        await api.registrarFalta(id, motivo);
        carregarDados();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleReposicao = async (id) => {
    const novaData = prompt(
      "Data da reposição (AAAA-MM-DD):",
      new Date().toISOString().split("T")[0],
    );
    if (novaData) {
      try {
        await api.registrarReposicao(id, novaData);
        alert("Reposição registrada com sucesso!");
        carregarDados();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleGerarAulasMes = async () => {
    try {
      await api.gerarMensal();
      alert("Aulas geradas com sucesso!");
      carregarDados();
    } catch (error) {
      alert("ERRO NA API: " + error.message);
    }
  };

  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <h2>Controle de Frequência</h2>
      </header>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="tabs">
        <button
          className={abaAtiva === "dia" ? "active" : ""}
          onClick={() => setAbaAtiva("dia")}
        >
          <FaCalendarAlt /> Agenda do Dia
        </button>
        <button
          className={abaAtiva === "pendentes" ? "active" : ""}
          onClick={() => setAbaAtiva("pendentes")}
        >
          <FaExclamationTriangle /> Esquecidas
        </button>
        <button
          className={abaAtiva === "faltas" ? "active" : ""}
          onClick={() => setAbaAtiva("faltas")}
        >
          <FaUndoAlt /> Reposições Pendentes
        </button>
        <button
          className={abaAtiva === "historico" ? "active" : ""}
          onClick={() => setAbaAtiva("historico")}
        >
          <FaHistory /> Histórico Geral
        </button>

        <div className="acoes-agenda">
          <button className="btn-gerar-mensal" onClick={handleGerarAulasMes}>
            <FaCalendarAlt /> Gerar aulas deste mês
          </button>
        </div>
      </div>

      {/* FILTRO DE DATA (Melhorado com dia da semana) */}
      {abaAtiva === "dia" && (
        <div className="agenda-filtros">
          <label>Data:</label>
          <input
            type="date"
            value={dataAgenda}
            onChange={(e) => setDataAgenda(e.target.value)}
          />
          <span className="dia-semana-label" style={{ marginLeft: '10px', fontWeight: 'bold', color: '#007bff' }}>
            {getDiaSemanaExtenso(dataAgenda)}
          </span>
        </div>
      )}

      {carregando ? (
        <div className="loading">Carregando informações...</div>
      ) : (
        <div className="tabela-container">
          <table className="agenda-table">
            <thead>
              <tr>
                <th>Data / Dia</th>
                <th>Horário</th>
                <th>Aluno</th>
                <th>Curso</th>
                <th>Termo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {aulas.length > 0 ? (
                aulas.map((aula) => (
                  <tr key={aula.id}>
                    <td>
                      {new Date(aula.data).toLocaleDateString("pt-BR")}
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {getDiaSemanaExtenso(aula.data.split('T')[0])}
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      <FaClock style={{ fontSize: '0.8rem', marginRight: '4px', color: '#888' }} />
                      {new Date(aula.data).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td><strong>{aula.termo?.matricula?.aluno?.nome}</strong></td>
                    <td>
                      {aula.termo?.matricula?.curso?.nome || "Não informado"}
                    </td>
                    <td>{aula.termo?.numeroTermo}º Termo</td>
                    <td>
                      <span
                        className={`badge status-${aula.status.toLowerCase()}`}
                      >
                        {aula.status}
                      </span>
                    </td>
                    <td>
                      <div className="acoes">
                        {aula.status === "Pendente" && (
                          <>
                            <button
                              onClick={() => handlePresenca(aula.id)}
                              className="btn-presenca"
                              title="Presença"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleFalta(aula.id)}
                              className="btn-falta"
                              title="Falta"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}

                        {aula.status === "Falta" && (
                          <button
                            onClick={() => handleReposicao(aula.id)}
                            className="btn-reposicao-ok"
                          >
                            <FaCheck /> Reposição OK
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-row">
                    Nenhum registro encontrado para esta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}