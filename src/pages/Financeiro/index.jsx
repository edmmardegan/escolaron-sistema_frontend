import React, { useState, useEffect, useCallback } from "react";
import {
  FaMoneyBillWave,
  FaFilter,
  FaMagic,
  FaTrash,
  FaCheck,
  FaUndo,
} from "react-icons/fa";
import { api } from "../../services/api";
import "./styles.css";
import ModalCarne from "../../components/ModalCarne"; // Certifique-se que o import está correto

export default function Financeiro() {
  // --- ESTADOS ---
  const [listaCompleta, setListaCompleta] = useState([]);
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [modalCarneAberto, setModalCarneAberto] = useState(false); // Estado do Modal

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

  // --- LÓGICA DE FILTRAGEM ---
  const filtrarDados = useCallback((dados, mes, ano, status, prof) => {
    if (!dados) return;

    const filtrados = dados.filter((item) => {
      const dataVenc = new Date(item.dataVencimento);
      if (isNaN(dataVenc.getTime())) return false;

      const vencMes = dataVenc.getUTCMonth() + 1;
      const vencAno = dataVenc.getUTCFullYear();
      const itemProf = item.matricula?.professor || "";

      // Critérios
      const matchMes = Number(mes) === 0 ? true : vencMes === Number(mes);
      const matchAno = vencAno === Number(ano);
      const matchStatus = status === "Todos" ? true : item.status === status;
      const matchProf = prof === "Todas" ? true : itemProf === prof;

      return matchMes && matchAno && matchStatus && matchProf;
    });
    setListaFiltrada(filtrados);
  }, []);

  // --- CARREGAMENTO ---
  const carregarFinanceiro = async () => {
    try {
      const dados = await api.getAllFinanceiro();
      setListaCompleta(dados);
      // Aplica os filtros atuais nos dados novos
      filtrarDados(dados, mesFiltro, anoFiltro, statusFiltro, professorFiltro);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar financeiro.");
    }
  };

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  // Re-aplica filtro quando qualquer opção mudar
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

  // --- AÇÕES ---
  const acaoFinanceira = async (id, tipo) => {
    const novaLista = listaFiltrada.map((item) => {
      if (item.id === id) {
        return { ...item, status: tipo === "pagar" ? "Paga" : "Aberta" };
      }
      return item;
    });
    setListaFiltrada(novaLista);

    try {
      if (tipo === "pagar") await api.pagar(id);
      else await api.estornar(id);

      setTimeout(() => carregarFinanceiro(), 500);
    } catch (e) {
      console.error(e);
      carregarFinanceiro(); // Reverte se der erro
    }
  };

  const deletarParcela = async (id) => {
    if (!window.confirm("Tem certeza que deseja EXCLUIR este lançamento?"))
      return;
    try {
      await api.deleteParcela(id);
      carregarFinanceiro();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir.");
    }
  };

  // --- FUNÇÕES DO CARNÊ ---
  const abrirModalCarne = () => {
    setModalCarneAberto(true);
  };

  const handleGerarCarne = async (dadosConfig) => {
    try {
      if (!window.confirm("Deseja gerar os carnês agora?")) return;

      console.log("Solicitando PDF via Fetch direto...");
      
      // Usamos o fetch nativo para garantir que nada interfira na requisição
      const response = await fetch("http://localhost:3000/financeiro/gerar-massivo", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosConfig)
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.status}`);
      }

      // Transformamos a resposta em um arquivo (Blob)
      const blob = await response.blob();
      console.log("Tamanho do PDF recebido:", blob.size);

      if (blob.size < 500) {
        alert("O PDF gerado parece estar vazio.");
        return;
      }

      // Criamos a URL do arquivo
      const url = window.URL.createObjectURL(blob);
      
      // Tentamos abrir em uma nova aba
      const win = window.open(url, '_blank');
      
      // Se o navegador bloqueou a aba, forçamos o download clássico
      if (!win) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Carnes_${dadosConfig.ano}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setModalCarneAberto(false);
    } catch (e) {
      console.error("ERRO CRÍTICO:", e);
      alert("Não foi possível conectar ao servidor. Verifique se o Backend está rodando na porta 3000.");
    }
  };

  // --- HELPERS VISUAIS ---
  const formatarMoeda = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  const formatarData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";

  // --- CÁLCULOS TOTAIS ---
  const totalRecebidoFiltrado = listaFiltrada
    .filter((i) => i.status === "Paga")
    .reduce((acc, cur) => acc + Number(cur.valor || cur.valorTotal || 0), 0);

  const totalPendenteFiltrado = listaFiltrada
    .filter((i) => i.status === "Aberta")
    .reduce((acc, cur) => acc + Number(cur.valor || cur.valorTotal || 0), 0);

  return (
    <div>
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>
            <FaMoneyBillWave /> Dashboard Financeiro
          </h2>
          <button
            onClick={abrirModalCarne}
            className="btn"
            style={{ backgroundColor: "#6f42c1", color: "#fff" }}
          >
            <FaMagic /> Gerar Carnês
          </button>
        </div>

        {/* --- BARRA DE FILTROS --- */}
        <div
          className="form-grid"
          style={{ alignItems: "flex-end", margin: "20px 0" }}
        >
          {/* Mês */}
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

          {/* Ano */}
          <div className="input-group">
            <label>Ano:</label>
            <input
              type="number"
              className="input-field"
              value={anoFiltro}
              onChange={(e) => setAnoFiltro(e.target.value)}
            />
          </div>

          {/* Professora */}
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

          {/* Status */}
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

          <div className="input-group">
            <button className="btn btn-primary" onClick={carregarFinanceiro}>
              <FaFilter /> Atualizar
            </button>
          </div>
        </div>

        {/* --- TOTAIS --- */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div
            className="card-resumo"
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "15px",
              flex: 1,
            }}
          >
            <h4>
              Recebido (
              {professorFiltro === "Todas" ? "Geral" : professorFiltro})
            </h4>
            <h2>{formatarMoeda(totalRecebidoFiltrado)}</h2>
          </div>
          <div
            className="card-resumo"
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: "15px",
              flex: 1,
            }}
          >
            <h4>
              Pendente (
              {professorFiltro === "Todas" ? "Geral" : professorFiltro})
            </h4>
            <h2>{formatarMoeda(totalPendenteFiltrado)}</h2>
          </div>
        </div>

        {/* --- TABELA --- */}
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Aluno</th>
                <th>Profª</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center"
                    style={{ padding: "20px" }}
                  >
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((p) => (
                  <tr
                    key={p.id}
                    style={{ opacity: p.status === "Paga" ? 0.6 : 1 }}
                  >
                    <td>{formatarData(p.dataVencimento)}</td>
                    <td>
                      <strong>
                        {p.aluno?.nome || p.matricula?.aluno?.nome}
                      </strong>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#555" }}>
                      {p.matricula?.professor || "-"}
                    </td>
                    <td>{p.descricao}</td>
                    <td>{formatarMoeda(p.valor || p.valorTotal)}</td>
                    <td>
                      <span
                        className={`badge ${p.status === "Paga" ? "bg-success" : "bg-warning"}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="acoes">
                      {p.status === "Aberta" ? (
                        <button
                          onClick={() => acaoFinanceira(p.id, "pagar")}
                          className="btn-icon"
                          style={{ color: "green" }}
                          title="Pagar"
                        >
                          <FaCheck />
                        </button>
                      ) : (
                        <button
                          onClick={() => acaoFinanceira(p.id, "estornar")}
                          className="btn-icon"
                          style={{ color: "orange" }}
                          title="Estornar"
                        >
                          <FaUndo />
                        </button>
                      )}
                      <button
                        onClick={() => deletarParcela(p.id)}
                        className="btn-icon"
                        style={{ color: "red", marginLeft: "10px" }}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE CARNÊS --- */}
      <ModalCarne
        key={modalCarneAberto ? "aberto" : "fechado"}
        isOpen={modalCarneAberto}
        onClose={() => setModalCarneAberto(false)}
        onConfirm={handleGerarCarne}
        anoPadrao={anoFiltro}
      />
    </div>
  );
}
