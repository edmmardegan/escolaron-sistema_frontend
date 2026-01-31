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
      // Note que aqui chamamos as funções da sua API
      if (abaAtiva === "dia") response = await api.getAgenda(dataAgenda);
      else if (abaAtiva === "pendentes")
        response = await api.getAulasNaoLancadas();
      else if (abaAtiva === "faltas") response = await api.getFaltasPendentes();
      else if (abaAtiva === "historico")
        response = await api.getHistoricoAulas();

      // EXPLICAÇÃO: Se sua API já retorna 'res.data', o 'response' já É o array.
      // Se 'response.data' existir (caso o axios mude), ele usa. Caso contrário, usa o próprio 'response'.
      const dados = response?.data || response;

      console.log("ABA ATIVA:", abaAtiva); // Verifique se está na aba certa
      console.log("CONTEÚDO DE DADOS:", dados); // Veja se é um array com objetos

      setAulas(Array.isArray(dados) ? dados : []);
      console.log("Dados que chegaram no React:", dados); // O log salvador
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

  const handleGerarAgenda = async () => {
    try {
      const resultado = await api.gerarAgendaMensal();
      alert(resultado.message);
    } catch (err) {
      // ESTA LINHA VAI MOSTRAR O ERRO REAL NO CONSOLE AGORA:
      console.error("DETALHES DO ERRO:", err.response?.data || err.message);
      alert(
        "Erro ao gerar agenda: " +
          (err.response?.data?.message || "Erro de conexão"),
      );
    }
  };
  return (
    <div className="container-agenda">
      <header className="header-card">
        <h2>Controle de Frequência</h2>
        <h1>O CODIGO NOVO ESTA AQUI</h1>
        <button onClick={handleGerarAgenda} className="btn btn-primary">
          <FaCalendarAlt /> Gerar Aulas do Mês
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
              aulas.map((aula) => {
                console.log("CONTEÚDO DA AULA:", aula); // <--- ADICIONE ISSO
                // Criamos uma variável para a data ignorando o fuso horário (meio-dia)
                // Isso garante que o dia 29 não apareça como 28
                const dataLocal = new Date(aula.data);

                return (
                  <tr key={aula.id}>
                    <td>
                      {/* Exibe a data formatada: 29/01/2026 */}
                      {dataLocal.toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })}
                      <div className="sub-texto">
                        {/* Se o seu banco enviar a data como string, o split funciona. 
                        Se enviar como objeto Date, usamos o toISOString antes */}
                        {getDiaSemanaExtenso(
                          new Date(aula.data).toISOString().split("T")[0],
                        )}
                      </div>
                    </td>
                    <td className="texto-negrito">
                      <FaClock className="icon-pequeno" />
                      {/* Exibe o horário: 12:00 */}
                      {dataLocal.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC", // Mantém o horário que salvamos (12:00)
                      })}
                    </td>
                    <td>
                      <strong>{aula.termo?.matricula?.aluno?.nome}</strong>
                      {/* Se for o Histórico e houver uma observação, mostramos ela aqui */}
                      {abaAtiva === "historico" && aula.obs && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#666",
                            marginTop: "4px",
                          }}
                        >
                          <FaExclamationTriangle
                            style={{ color: "#e67e22", marginRight: "4px" }}
                          />
                          {aula.obs}
                        </div>
                      )}
                    </td>
                    <td className="sub-texto">
                      {aula.termo?.matricula?.curso?.nome ||
                        "Curso não definido"}
                    </td>
                    <td>
                      <span
                        className={`badge status-${aula.status?.toLowerCase()}`}
                      >
                        {aula.status}
                      </span>
                    </td>

                    {/* -------------- BOTOES AÇÕES ------------------------*/}
                    <td className="acoes">
                      {/* ABA REPOSIÇÕES: Botão Único para Concluir Reposição */}
                      {abaAtiva === "faltas" ? (
                        <button
                          onClick={async () => {
                            const dataHojeISO = new Date()
                              .toISOString()
                              .split("T")[0];
                            try {
                              await api.registrarReposicao(
                                aula.id,
                                dataHojeISO,
                              );
                              alert("Reposição registrada com sucesso!");
                              carregarDados();
                            } catch (err) {
                              alert("Erro ao registrar reposição.");
                            }
                          }}
                          className="btn-icon icon-edit"
                          title="Registrar Reposição"
                        >
                          <FaCheck />{" "}
                          <small style={{ marginLeft: "4px" }}>Reposição</small>
                        </button>
                      ) : (
                        /* OUTRAS ABAS (Agenda, Esquecidas, Histórico): Botões Normais */
                        aula.status === "Pendente" && (
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
                        )
                      )}
                    </td>
                  </tr>
                );
              })
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
