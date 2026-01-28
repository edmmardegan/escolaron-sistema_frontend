import { api } from "../../services/api";
import React, { useState, useEffect, useCallback } from "react";
import {
  FaMoneyBillWave,
  FaMagic,
  FaTrash,
  FaCheck,
  FaUndo,
} from "react-icons/fa";
import "./styles.css";

export default function Financeiro() {
  const [listaCompleta, setListaCompleta] = useState([]);
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Filtros
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [professorFiltro, setProfessorFiltro] = useState("Todas");

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const filtrarDados = useCallback((dados, mes, ano, status, prof) => {
    if (!dados) return;

    const filtrados = dados.filter((item) => {
      const dataVenc = new Date(item.dataVencimento);
      if (isNaN(dataVenc.getTime())) return false;

      const vencMes = dataVenc.getUTCMonth() + 1;
      const vencAno = dataVenc.getUTCFullYear();
      const itemProf = item.matricula?.professor || "";

      const matchMes = Number(mes) === 0 ? true : vencMes === Number(mes);
      const matchAno = vencAno === Number(ano);
      const matchStatus = status === "Todos" ? true : item.status === status;
      const matchProf = prof === "Todas" ? true : itemProf === prof;

      return matchMes && matchAno && matchStatus && matchProf;
    });
    setListaFiltrada(filtrados);
  }, []);

  const carregarFinanceiro = async () => {
    try {
      const dados = await api.getAllFinanceiro();
      setListaCompleta(dados);
      filtrarDados(dados, mesFiltro, anoFiltro, statusFiltro, professorFiltro);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar financeiro.");
    }
  };

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  useEffect(() => {
    filtrarDados(
      listaCompleta,
      mesFiltro,
      anoFiltro,
      statusFiltro,
      professorFiltro,
    );
  }, [
    mesFiltro,
    anoFiltro,
    statusFiltro,
    professorFiltro,
    listaCompleta,
    filtrarDados,
  ]);

  // --- FUNÇÃO DE GERAÇÃO GLOBAL ---
  // Financeiro/index.jsx

  const handleGerarGlobal = async () => {
    const anoDigitado = prompt(
      "Gerar parcelas de TODOS os alunos para qual ano?",
      2026,
    );

    if (!anoDigitado || isNaN(anoDigitado)) return;

    try {
      setCarregando(true);

      // ATENÇÃO: Aqui usamos o novo nome que está no seu api.js
      const response = await api.gerarParcelaGlobal({
        ano: Number(anoDigitado),
      });

      alert(`Sucesso! Foram processados ${response.data.gerados} alunos.`);
      carregarFinanceiro(); // Atualiza a tabela na tela
    } catch (e) {
      console.error("Erro na geração:", e);
      alert("Erro ao processar lote. Verifique o console.");
    } finally {
      setCarregando(false);
    }
  };

  const acaoFinanceira = async (id, tipo) => {
    try {
      if (tipo === "pagar") await api.pagar(id);
      else await api.estornar(id);
      setTimeout(() => carregarFinanceiro(), 500);
    } catch (e) {
      console.error(e);
    }
  };

  const deletarParcela = async (id) => {
    if (!window.confirm("Excluir este lançamento?")) return;
    try {
      await api.deleteParcela(id);
      carregarFinanceiro();
    } catch (e) {
      console.error(e);
    }
  };

  const formatarMoeda = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  const formatarData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";

  const totalRecebido = listaFiltrada
    .filter((i) => i.status === "Paga")
    .reduce((acc, cur) => acc + Number(cur.valor || cur.valorTotal || 0), 0);
  const totalPendente = listaFiltrada
    .filter((i) => i.status === "Aberta")
    .reduce((acc, cur) => acc + Number(cur.valor || cur.valorTotal || 0), 0);

  return (
    <div className="container-financeiro">
      <div className="card">
        <div className="header-financeiro">
          <h2>
            <FaMoneyBillWave /> Dashboard Financeiro
          </h2>
          <button
            onClick={handleGerarGlobal}
            className="btn-global"
            disabled={carregando}
          >
            <FaMagic /> {carregando ? "Gerando..." : "Gerar Parcelas do Ano"}
          </button>
        </div>

        <div className="painel-filtros form-grid">
          <div className="input-group">
            <label>Mês:</label>
            <select
              className="input-field"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
            >
              <option value="0">Todos os Meses</option>
              {meses.map((nome, index) => (
                <option key={index} value={index + 1}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Ano:</label>
            <input
              type="number"
              className="input-field"
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Professora:</label>
            <select
              className="input-field"
              value={professorFiltro}
              onChange={(e) => setProfessorFiltro(e.target.value)}
            >
              <option value="Todas">Todas</option>
              <option value="Cristiane">Cristiane</option>
              <option value="Daiane">Daiane</option>
            </select>
          </div>
          <div className="input-group">
            <label>Status:</label>
            <select
              className="input-field"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Aberta">Em Aberto</option>
              <option value="Paga">Pagos</option>
            </select>
          </div>
        </div>

        <div className="resumo-cards">
          <div className="card-resumo recebido">
            <span className="resumo-titulo">Recebido ({professorFiltro})</span>
            <span className="resumo-valor">{formatarMoeda(totalRecebido)}</span>
          </div>
          <div className="card-resumo pendente">
            <span className="resumo-titulo">Pendente ({professorFiltro})</span>
            <span className="resumo-valor">{formatarMoeda(totalPendente)}</span>
          </div>
        </div>

        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Aluno</th>
                <th>Profª</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((p) => (
                <tr
                  key={p.id}
                  className={p.status === "Paga" ? "linha-paga" : ""}
                >
                  <td>{formatarData(p.dataVencimento)}</td>
                  <td>
                    <strong>{p.aluno?.nome || p.matricula?.aluno?.nome}</strong>
                  </td>
                  <td className="txt-secundario">
                    {p.matricula?.professor || "-"}
                  </td>
                  <td className="txt-valor">
                    {formatarMoeda(p.valor || p.valorTotal)}
                  </td>
                  <td>
                    <span
                      className={`badge ${p.status === "Paga" ? "bg-paga" : "bg-aberta"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="acoes">
                    <button
                      onClick={() =>
                        acaoFinanceira(
                          p.id,
                          p.status === "Aberta" ? "pagar" : "estornar",
                        )
                      }
                      className="btn-icon"
                    >
                      {p.status === "Aberta" ? (
                        <FaCheck color="green" />
                      ) : (
                        <FaUndo color="orange" />
                      )}
                    </button>
                    <button
                      onClick={() => deletarParcela(p.id)}
                      className="btn-icon"
                    >
                      <FaTrash color="red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
