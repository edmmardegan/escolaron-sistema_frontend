import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
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
  const [aulas, setAulas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("dia");
  const [dataAgenda, setDataAgenda] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [carregando, setCarregando] = useState(false);

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
    const dateObj = new Date(data + "T12:00:00");
    return dias[dateObj.getDay()];
  };

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      let response;
      if (abaAtiva === "dia") response = await api.getAgenda(dataAgenda);
      else if (abaAtiva === "pendentes")
        response = await api.getAulasNaoLancadas();
      else if (abaAtiva === "faltas") response = await api.getFaltasPendentes();
      else if (abaAtiva === "historico")
        response = await api.getHistoricoAulas();

      const dados = response.data || response;
      setAulas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setAulas([]);
    } finally {
      setCarregando(false);
    }
  }, [abaAtiva, dataAgenda]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handlePresenca = async (id) => {
    await api.registrarPresenca(id);
    carregarDados();
  };
  const handleFalta = async (id) => {
    const motivo = prompt("Motivo da falta:");
    if (motivo !== null) {
      await api.registrarFalta(id, motivo);
      carregarDados();
    }
  };

  return (
    <div className="container-agenda">
      <header className="header-card">
        <h2>Controle de Frequência</h2>
        <button
          className="btn btn-primary"
          onClick={async () => {
            await api.gerarMensal();
            carregarDados();
          }}
        >
          <FaCalendarAlt /> Gerar aulas do mês
        </button>
      </header>

      <div className="filtro-container">
        <div className="grupo-abas">
          <button
            className={`aba-item ${abaAtiva === "dia" ? "ativa" : ""}`}
            onClick={() => setAbaAtiva("dia")}
          >
            <FaCalendarAlt /> Agenda
          </button>
          <button
            className={`aba-item ${abaAtiva === "pendentes" ? "ativa" : ""}`}
            onClick={() => setAbaAtiva("pendentes")}
          >
            <FaExclamationTriangle /> Esquecidas
          </button>
          <button
            className={`aba-item ${abaAtiva === "faltas" ? "ativa" : ""}`}
            onClick={() => setAbaAtiva("faltas")}
          >
            <FaUndoAlt /> Reposições
          </button>
          <button
            className={`aba-item ${abaAtiva === "historico" ? "ativa" : ""}`}
            onClick={() => setAbaAtiva("historico")}
          >
            <FaHistory /> Histórico
          </button>
        </div>

        {abaAtiva === "dia" && (
          <div className="agenda-data-seletor">
            <input
              type="date"
              value={dataAgenda}
              onChange={(e) => setDataAgenda(e.target.value)}
              className="input-field"
            />
            <span className="dia-semana-label">
              {getDiaSemanaExtenso(dataAgenda)}
            </span>
          </div>
        )}
      </div>

      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Data / Dia</th>
              <th>Horário</th>
              <th>Aluno</th>
              <th>Curso</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="6" className="texto-centralizado">
                  Carregando...
                </td>
              </tr>
            ) : aulas.length > 0 ? (
              aulas.map((aula) => (
                <tr key={aula.id}>
                  <td>
                    {new Date(aula.data).toLocaleDateString("pt-BR")}
                    <div className="sub-texto">
                      {getDiaSemanaExtenso(aula.data.split("T")[0])}
                    </div>
                  </td>
                  <td className="texto-negrito">
                    <FaClock className="icon-pequeno" />
                    {new Date(aula.data).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <strong>{aula.termo?.matricula?.aluno?.nome}</strong>
                  </td>
                  <td className="sub-texto">
                    {aula.termo?.matricula?.curso?.nome}
                  </td>
                  <td>
                    <span
                      className={`badge status-${aula.status.toLowerCase()}`}
                    >
                      {aula.status}
                    </span>
                  </td>
                  <td className="acoes">
                    {aula.status === "Pendente" && (
                      <>
                        <button
                          onClick={() => handlePresenca(aula.id)}
                          className="btn-icon icon-edit"
                          title="Presença"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleFalta(aula.id)}
                          className="btn-icon icon-trash"
                          title="Falta"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="texto-centralizado">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
