import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaFilter,
  FaPen,
  FaSave,
  FaTimes,
  FaCheck,
  FaUndo,
} from "react-icons/fa";
import api from "../../services/api";
import "./styles.css";

export default function Matriculas() {
  const [lista, setLista] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroSituacao, setFiltroSituacao] = useState("Em Andamento");
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null);
  const [financeiroSelecionado, setFinanceiroSelecionado] = useState(null);
  const [listaParcelas, setListaParcelas] = useState([]);
  const [anoGeracao, setAnoGeracao] = useState(new Date().getFullYear());
  const [editandoId, setEditandoId] = useState(null);

  const getDataHoje = () => new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    aluno: "",
    curso: "",
    valorMensalidade: "",
    valorMatricula: "",
    valorCombustivel: "",
    tipo: "Presencial",
    diaVencimento: "10",
    situacao: "Em Andamento",
    dataInicio: getDataHoje(),
    dataTermino: "",
    diaSemana: "Segunda",
    horario: "08:00",
    frequencia: "Semanal",
    termo_atual: 1,
    professor: "Cristiane",
  });

  const carregarTudo = async () => {
    try {
      setCarregando(true);
      const [resMat, resAlu, resCur] = await Promise.all([
        api.getMatriculas(),
        api.getAlunos(),
        api.getCursos(),
      ]);
      setLista(Array.isArray(resMat) ? resMat : []);
      setAlunos(Array.isArray(resAlu) ? resAlu : []);
      setCursos(Array.isArray(resCur) ? resCur : []);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novo = { ...form, [name]: value };

    // REGRA DE DATA AUTOMÁTICA
    if (name === "situacao") {
      if (value === "Trancado" || value === "Finalizado") {
        novo.dataTermino = getDataHoje();
      } else {
        novo.dataTermino = "";
      }
    }

    if (name === "curso") {
      const cursoEncontrado = cursos.find((c) => c.id == value);
      if (cursoEncontrado)
        novo.valorMensalidade = cursoEncontrado.valorMensalidade;
    }
    setForm(novo);
  };

  const salvar = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      aluno: { id: Number(form.aluno) },
      curso: { id: Number(form.curso) },
      valorMensalidade: Number(form.valorMensalidade),
      valorMatricula: Number(form.valorMatricula),
      valorCombustivel: form.valorCombustivel
        ? Number(form.valorCombustivel)
        : null,
      diaVencimento: Number(form.diaVencimento),
      termo_atual: Number(form.termo_atual),
      dataTermino: form.dataTermino || null,
    };
    try {
      await api.saveMatricula(payload, editandoId);
      alert("Matrícula salva com sucesso!");
      limparForm();
      carregarTudo();
    } catch (erro) {
      alert("Erro ao salvar.");
    }
  };

  const limparForm = () => {
    setForm({
      aluno: "",
      curso: "",
      valorMensalidade: "",
      valorMatricula: "",
      valorCombustivel: "",
      tipo: "Presencial",
      diaVencimento: "10",
      situacao: "Em Andamento",
      dataInicio: getDataHoje(),
      dataTermino: "",
      diaSemana: "Segunda",
      horario: "08:00",
      frequencia: "Semanal",
      termo_atual: 1,
      professor: "Cristiane",
    });
    setEditandoId(null);
  };

  const prepararEdicao = (mat) => {
    setEditandoId(mat.id);
    setForm({
      aluno: mat.aluno?.id || "",
      curso: mat.curso?.id || "",
      valorMensalidade: mat.valorMensalidade,
      valorMatricula: mat.valorMatricula,
      tipo: mat.tipo,
      valorCombustivel: mat.valorCombustivel || "",
      diaVencimento: String(mat.diaVencimento),
      situacao: mat.situacao,
      dataInicio: mat.dataInicio ? mat.dataInicio.split("T")[0] : "",
      dataTermino: mat.dataTermino ? mat.dataTermino.split("T")[0] : "",
      diaSemana: mat.diaSemana || "Segunda",
      horario: mat.horario || "08:00",
      frequencia: mat.frequencia || "Semanal",
      termo_atual: mat.termo_atual || 1,
      professor: mat.professor || "Cristiane",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const abrirFinanceiro = async (mat) => {
    setFinanceiroSelecionado(mat);
    try {
      const parcelas = await api.getPorMatricula(mat.id);
      setListaParcelas(Array.isArray(parcelas) ? parcelas : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGerarIndividual = async (idMatricula) => {
    try {
      await api.gerarParcelaIndividual({
        matriculaId: Number(idMatricula),
        ano: Number(anoGeracao),
      });
      alert("Parcelas geradas!");
      abrirFinanceiro(financeiroSelecionado);
    } catch (err) {
      alert("Erro ao gerar.");
    }
  };

  const acaoFinanceira = async (id, tipo) => {
    try {
      if (tipo === "pagar") await api.pagar(id);
      else await api.estornar(id);
      const parcelas = await api.getPorMatricula(financeiroSelecionado.id);
      setListaParcelas(parcelas);
    } catch (e) {
      console.error(e);
    }
  };

  const formatarMoeda = (v) =>
    v
      ? Number(v).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "-";
  const listaExibida = lista
    .filter((m) =>
      filtroSituacao === "Todos" ? true : m.situacao === filtroSituacao,
    )
    .sort((a, b) => (a.aluno?.nome || "").localeCompare(b.aluno?.nome || ""));

  return (
    <div className="container-matriculas">
      <div className="card">
        <h2>{editandoId ? "Editar Matrícula" : "Nova Matrícula"}</h2>
        <form onSubmit={salvar} className="form-grid">
          <div className="input-group full-width">
            <label>Aluno:</label>
            <select
              required
              name="aluno"
              value={form.aluno}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Selecione...</option>
              {alunos
                .filter((a) => a.ativo)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
            </select>
          </div>
          <div className="input-group">
            <label>Curso:</label>
            <select
              required
              name="curso"
              value={form.curso}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Selecione...</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Modalidade:</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Presencial">Presencial</option>
              <option value="Residencial">Residencial</option>
            </select>
          </div>
          <div className="input-group">
            <label>Dia da Aula:</label>
            <select
              name="diaSemana"
              value={form.diaSemana}
              onChange={handleChange}
              className="input-field"
            >
              {["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="input-group">
            <label>Horário:</label>
            <input
              type="time"
              name="horario"
              value={form.horario}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Frequência:</label>
            <select
              name="frequencia"
              value={form.frequencia}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Semanal">Semanal</option>
              <option value="Quinzenal">Quinzenal</option>
            </select>
          </div>
          <div className="input-group">
            <label>Valor Combustível:</label>
            <input
              type="number"
              step="0.01"
              name="valorCombustivel"
              value={form.valorCombustivel}
              onChange={handleChange}
              className="input-field"
              disabled={form.tipo !== "Residencial"}
            />
          </div>
          <div className="input-group">
            <label>Valor Matrícula:</label>
            <input
              type="number"
              step="0.01"
              name="valorMatricula"
              value={form.valorMatricula}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Valor Mensalidade:</label>
            <input
              type="number"
              step="0.01"
              name="valorMensalidade"
              value={form.valorMensalidade}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Dia Venc.:</label>
            <select
              name="diaVencimento"
              value={form.diaVencimento}
              onChange={handleChange}
              className="input-field"
            >
              {[5, 10, 15, 20, 25, 30].map((dia) => (
                <option key={dia} value={dia}>
                  Dia {dia}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Situação:</label>
            <select
              name="situacao"
              value={form.situacao}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Em Andamento">Em Andamento</option>
              <option value="Trancado">Trancado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
          <div className="input-group">
            <label>Data Início:</label>
            <input
              type="date"
              name="dataInicio"
              value={form.dataInicio}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Data Término:</label>
            <input
              type="date"
              name="dataTermino"
              value={form.dataTermino}
              disabled // Bloqueia a edição manual
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Termo Inicial:</label>
            <input
              type="number"
              name="termo_atual"
              value={form.termo_atual}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Professora:</label>
            <select
              name="professor"
              value={form.professor}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Cristiane">Cristiane</option>
              <option value="Daiane">Daiane</option>
            </select>
          </div>
          <div className="full-width">
            <button type="submit" className="btn btn-primary">
              <FaSave /> {editandoId ? "Salvar Alterações" : "Matricular"}
            </button>
          </div>
        </form>
      </div>
      {/* CONTINUA NA PARTE 2... */}
      {/* LISTAGEM DE MATRÍCULAS */}
      <div className="tabela-container">
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <span>
            <FaFilter /> Filtro:
          </span>
          {["Em Andamento", "Trancado", "Finalizado", "Todos"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroSituacao(f)}
              className={`btn-filtro ${filtroSituacao === f ? "ativo" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>

        <table className="tabela">
          <thead>
            <tr>
              <th>Aluno / Curso</th>
              <th>Mensalidade</th>
              <th>Aula</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaExibida.map((m) => (
              <tr key={m.id}>
                <td>
                  <strong>{m.aluno?.nome}</strong>
                  <br />
                  <span className="txt-secundario">{m.curso?.nome}</span>
                </td>
                <td>{formatarMoeda(m.valorMensalidade)}</td>
                <td>
                  {m.diaSemana}, {m.horario} ({m.frequencia})
                </td>
                <td>
                  <span
                    className={`badge bg-${m.situacao.replace(" ", "").toLowerCase()}`}
                  >
                    {m.situacao}
                  </span>
                </td>
                <td className="acoes">
                  <button
                    onClick={() => prepararEdicao(m)}
                    className="btn-icon icon-edit"
                    title="Editar"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => setMatriculaSelecionada(m)}
                    className="btn-icon"
                    title="Boletim"
                  >
                    <FaFileInvoiceDollar />
                  </button>
                  <button
                    onClick={() => abrirFinanceiro(m)}
                    className="btn-icon icon-financeiro"
                    title="Financeiro"
                  >
                    <FaMoneyBillWave />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Excluir?"))
                        api.deleteMatricula(m.id).then(carregarTudo);
                    }}
                    className="btn-icon icon-trash"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL BOLETIM (COM MÉDIA AUTOMÁTICA) */}
      {matriculaSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "750px" }}>
            <div className="modal-header">
              <h3>Boletim: {matriculaSelecionada.aluno?.nome}</h3>
              <button
                onClick={() => setMatriculaSelecionada(null)}
                className="btn-fechar"
              >
                <FaTimes />
              </button>
            </div>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Teórica</th>
                  <th>Prática</th>
                  <th>Média</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {matriculaSelecionada.termos
                  ?.sort((a, b) => a.numeroTermo - b.numeroTermo)
                  .map((t) => (
                    <tr key={t.id}>
                      <td>{t.numeroTermo}º Módulo</td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          defaultValue={t.notaTeorica}
                          id={`teorica-${t.id}`}
                          className="input-pequeno"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          defaultValue={t.notaPratica}
                          id={`pratica-${t.id}`}
                          className="input-pequeno"
                        />
                      </td>
                      <td style={{ fontWeight: "bold", color: "#007bff" }}>
                        {(
                          (Number(t.notaTeorica || 0) +
                            Number(t.notaPratica || 0)) /
                          2
                        ).toFixed(1)}
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          style={{ color: "green" }}
                          onClick={async () => {
                            try {
                              const n1 = document.getElementById(
                                `teorica-${t.id}`,
                              ).value;
                              const n2 = document.getElementById(
                                `pratica-${t.id}`,
                              ).value;
                              await api.updateNota(t.id, n1, n2);
                              const novaLista = await api.getMatriculas();
                              setLista(novaLista);
                              const matAtu = novaLista.find(
                                (m) => m.id === matriculaSelecionada.id,
                              );
                              setMatriculaSelecionada(matAtu);
                              alert("Nota salva!");
                            } catch (e) {
                              alert("Erro ao salvar.");
                            }
                          }}
                        >
                          💾
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FINANCEIRO INDIVIDUAL */}
      {financeiroSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h3>Financeiro: {financeiroSelecionado.aluno?.nome}</h3>
              <button
                onClick={() => setFinanceiroSelecionado(null)}
                className="btn-fechar"
              >
                <FaTimes />
              </button>
            </div>
            <div
              className="geracao-box"
              style={{
                padding: "10px",
                background: "#f8f9fa",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              <label>Ano de Geração: </label>
              <input
                type="number"
                value={anoGeracao}
                onChange={(e) => setAnoGeracao(e.target.value)}
                className="input-pequeno"
                style={{ width: "80px", marginRight: "10px" }}
              />
              <button
                onClick={() => handleGerarIndividual(financeiroSelecionado.id)}
                className="btn btn-primary"
                style={{ width: "auto", padding: "5px 15px" }}
              >
                Gerar Parcelas
              </button>
            </div>
            <div
              className="tabela-container"
              style={{ maxHeight: "350px", overflowY: "auto" }}
            >
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaParcelas.length > 0 ? (
                    listaParcelas.map((p) => (
                      <tr
                        key={p.id}
                        className={p.status === "Paga" ? "linha-paga" : ""}
                      >
                        <td>
                          {new Date(p.dataVencimento).toLocaleDateString(
                            "pt-BR",
                            { timeZone: "UTC" },
                          )}
                        </td>
                        <td>{formatarMoeda(p.valorTotal || p.valor)}</td>
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
                            onClick={async () => {
                              if (window.confirm("Excluir?")) {
                                await api.deleteParcela(p.id);
                                abrirFinanceiro(financeiroSelecionado);
                              }
                            }}
                            className="btn-icon"
                          >
                            <FaTrash color="red" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Nenhuma parcela encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
