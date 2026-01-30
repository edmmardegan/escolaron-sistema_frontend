import { useState, useEffect } from "react";
import {
  FaTrash,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaFilter,
  FaPen,
} from "react-icons/fa";
import api from "../../services/api";
import "./styles.css";

export default function Matriculas() {
  const [lista, setLista] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);

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
    tipo: "Presencial",
    valorCombustivel: "",
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
      const [resMat, resAlu, resCur] = await Promise.all([
        api.getMatriculas(),
        api.getAlunos(),
        api.getCursos(),
      ]);
      setLista(resMat);
      setAlunos(resAlu);
      setCursos(resCur);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const listaExibida = lista
    .filter((item) =>
      filtroSituacao === "Todos" ? true : item.situacao === filtroSituacao,
    )
    .sort((a, b) => {
      const nomeA = a.aluno?.nome || "";
      const nomeB = b.aluno?.nome || "";
      return nomeA.localeCompare(nomeB);
    });

  const salvar = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      aluno: { id: Number(form.aluno) },
      curso: { id: Number(form.curso) },
      valorMensalidade: Number(form.valorMensalidade),
      valorMatricula: Number(form.valorMatricula),
      valorCombustivel: form.valorCombustivel ? Number(form.valorCombustivel) : null,
      diaVencimento: Number(form.diaVencimento),
      dataTermino: form.dataTermino ? form.dataTermino : null,
    };
    try {
      await api.saveMatricula(payload, editandoId);
      alert(editandoId ? "Matrícula atualizada!" : "Matrícula realizada!");
      limparForm();
      carregarTudo();
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar matrícula.");
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

  const deletar = async (id) => {
    if (!confirm("Excluir matrícula?")) return;
    try {
      await api.deleteMatricula(id);
      carregarTudo();
    } catch (erro) {
      console.error(erro);
      alert("Não é possível excluir.");
    }
  };

  const prepararEdicao = (mat) => {
    setEditandoId(mat.id);
    setForm({
      aluno: mat.aluno?.id || "",
      curso: mat.curso?.id || "",
      valorMensalidade: mat.valorMensalidade,
      valorMatricula: mat.valorMatricula,
      tipo: mat.tipo,
      valorCombustivel: mat.valorCombustivel,
      diaVencimento: mat.diaVencimento,
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
      setListaParcelas(await api.getPorMatricula(mat.id));
    } catch (e) {
      console.error(e);
    }
  };

  const acaoFinanceira = async (id, tipo) => {
    try {
      if (tipo === "pagar") await api.pagar(id);
      else await api.estornar(id);
      abrirFinanceiro(financeiroSelecionado);
    } catch (e) {
      console.error(e);
    }
  };

  const deletarParcela = async (id) => {
    if (!confirm("Excluir parcela?")) return;
    try {
      await api.deleteParcela(id);
      abrirFinanceiro(financeiroSelecionado);
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
      alert("Parcelas geradas com sucesso!");
      const atualizadas = await api.getPorMatricula(idMatricula);
      setListaParcelas(atualizadas);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao gerar parcelas.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novo = { ...form, [name]: value };

    if (name === "curso") {
      const cursoEncontrado = cursos.find((c) => c.id == value);
      if (cursoEncontrado) novo.valorMensalidade = cursoEncontrado.valorMensalidade;
    }
    setForm(novo);
  };

  const formatarMoeda = (v) =>
    v ? Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-";

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{editandoId ? "Editar Matrícula" : "Nova Matrícula"}</h2>
          {editandoId && (
            <button className="btn" onClick={limparForm} style={{ backgroundColor: "#6c757d", color: "#fff" }}>
              Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={salvar} className="form-grid">
          <div className="input-group full-width">
            <label>Aluno:</label>
            <select required name="aluno" value={form.aluno} onChange={handleChange} className="input-field">
              <option value="">Selecione...</option>
              {alunos.filter((a) => a.ativo).map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Curso:</label>
            <select required name="curso" value={form.curso} onChange={handleChange} className="input-field">
              <option value="">Selecione...</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Modalidade:</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="input-field">
              <option value="Presencial">Presencial</option>
              <option value="Residencial">Residencial</option>
            </select>
          </div>

          <div className="input-group">
            <label>Dia da Aula:</label>
            <select name="diaSemana" value={form.diaSemana} onChange={handleChange} className="input-field">
              <option value="Segunda">Segunda-feira</option>
              <option value="Terca">Terça-feira</option>
              <option value="Quarta">Quarta-feira</option>
              <option value="Quinta">Quinta-feira</option>
              <option value="Sexta">Sexta-feira</option>
              <option value="Sabado">Sábado</option>
            </select>
          </div>

          <div className="input-group">
            <label>Horário:</label>
            <input type="time" name="horario" value={form.horario} onChange={handleChange} className="input-field" />
          </div>

          <div className="input-group">
            <label>Frequência:</label>
            <select name="frequencia" value={form.frequencia} onChange={handleChange} className="input-field">
              <option value="Semanal">Semanal</option>
              <option value="Quinzenal">Quinzenal</option>
            </select>
          </div>

          <div className="input-group">
            <label>Valor Combustível:</label>
            <input type="number" step="0.01" name="valorCombustivel" value={form.valorCombustivel} onChange={handleChange} className="input-field" disabled={form.tipo !== "Residencial"} />
          </div>

          <div className="input-group">
            <label>Valor Matrícula:</label>
            <input type="number" step="0.01" name="valorMatricula" value={form.valorMatricula} onChange={handleChange} className="input-field" />
          </div>

          <div className="input-group">
            <label>Valor Mensalidade:</label>
            <input type="number" step="0.01" name="valorMensalidade" value={form.valorMensalidade} onChange={handleChange} className="input-field" />
          </div>

          <div className="input-group">
            <label>Dia Venc.:</label>
            <select name="diaVencimento" value={form.diaVencimento} onChange={handleChange} className="input-field">
              <option value="5">Dia 05</option>
              <option value="10">Dia 10</option>
              <option value="15">Dia 15</option>
              <option value="20">Dia 20</option>
              <option value="25">Dia 25</option>
              <option value="30">Dia 30</option>
            </select>
          </div>

          <div className="input-group">
            <label>Situação:</label>
            <select name="situacao" value={form.situacao} onChange={handleChange} className="input-field">
              <option value="Em Andamento">Em Andamento</option>
              <option value="Trancado">Trancado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div className="input-group">
            <label>Data Início:</label>
            <input type="date" name="dataInicio" value={form.dataInicio} onChange={handleChange} className="input-field" />
          </div>

          <div className="input-group">
            <label>Data Término:</label>
            <input type="date" name="dataTermino" value={form.dataTermino} onChange={handleChange} className="input-field" />
          </div>

          <div className="input-group">
            <label>Termo Inicial:</label>
            <input type="number" name="termo_atual" min="1" max="20" value={form.termo_atual} onChange={handleChange} className="input-field" required />
          </div>

          <div className="input-group">
            <label>Professora Responsável:</label>
            <select className="input-field" value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })}>
              <option value="Cristiane">Cristiane</option>
              <option value="Daiane">Daiane</option>
            </select>
          </div>

          <div className="full-width">
            <button type="submit" className="btn btn-primary">{editandoId ? "Salvar Alterações" : "Matricular"}</button>
          </div>
        </form>
      </div>

      <div className="tabela-container">
        <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
          <span><FaFilter /> Filtro:</span>
          {["Em Andamento", "Trancado", "Finalizado", "Todos"].map(f => (
            <button key={f} onClick={() => setFiltroSituacao(f)} className={`btn-filtro ${filtroSituacao === f ? "ativo" : ""}`} style={{ backgroundColor: filtroSituacao === f ? "#007bff" : "#e2e6ea", color: filtroSituacao === f ? "#fff" : "#333", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>{f}</button>
          ))}
        </div>

        <table className="tabela">
          <thead>
            <tr>
              <th>Aluno / Curso</th>
              <th>Mensalidade</th>
              <th>Horário / Freq.</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaExibida.map((m) => (
              <tr key={m.id}>
                <td><strong>{m.aluno?.nome}</strong><br/><span style={{ fontSize: "0.9rem", color: "#666" }}>{m.curso?.nome}</span></td>
                <td>{formatarMoeda(m.valorMensalidade)}</td>
                <td style={{ fontSize: "0.85rem" }}>{m.diaSemana}, {m.horario}<br/><span style={{ color: "#666" }}>({m.frequencia})</span></td>
                <td><span className={`badge ${m.situacao === "Em Andamento" ? "bg-cursando" : "bg-trancado"}`}>{m.situacao}</span></td>
                <td className="acoes">
                  <button onClick={() => prepararEdicao(m)} className="btn-icon" style={{ color: "#007bff" }}><FaPen /></button>
                  <button onClick={() => setMatriculaSelecionada(m)} className="btn-icon" style={{ color: "#333" }}><FaFileInvoiceDollar /></button>
                  <button onClick={() => abrirFinanceiro(m)} className="btn-icon" style={{ color: "#28a745" }}><FaMoneyBillWave /></button>
                  <button onClick={() => deletar(m.id)} className="btn-icon" style={{ color: "#333" }}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL BOLETIM RESTAURADO */}
      {matriculaSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>Boletim: {matriculaSelecionada.aluno?.nome}</h3>
              <button onClick={() => setMatriculaSelecionada(null)} className="btn-fechar">X</button>
            </div>
            <table className="tabela">
              <thead><tr><th>Módulo</th><th>Teórica</th><th>Prática</th><th>Ação</th></tr></thead>
              <tbody>
                {matriculaSelecionada.termos?.sort((a, b) => a.numeroTermo - b.numeroTermo).map((t) => (
                  <tr key={t.id}>
                    <td>{t.numeroTermo}º Módulo</td>
                    <td><input type="number" step="0.1" defaultValue={t.notaTeorica} id={`teorica-${t.id}`} className="input-pequeno" /></td>
                    <td><input type="number" step="0.1" defaultValue={t.notaPratica} id={`pratica-${t.id}`} className="input-pequeno" /></td>
                    <td><button className="btn-icon" style={{ color: "green" }} onClick={async () => {
                      const n1 = Number(document.getElementById(`teorica-${t.id}`).value);
                      const n2 = Number(document.getElementById(`pratica-${t.id}`).value);
                      await api.updateNota(t.id, n1, n2);
                      alert("Nota salva!");
                    }}>💾</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FINANCEIRO COM CORREÇÃO DO BOTÃO */}
      {financeiroSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h3>Financeiro: {financeiroSelecionado.aluno?.nome}</h3>
              <button onClick={() => setFinanceiroSelecionado(null)} className="btn-fechar">X</button>
            </div>
            <div style={{ textAlign: "center", padding: "15px", background: "#f8f9fa", marginBottom: "10px" }}>
              <label>Ano: </label>
              <input type="number" value={anoGeracao} onChange={(e) => setAnoGeracao(e.target.value)} style={{ width: "80px", marginRight: "10px" }} />
              <button onClick={() => handleGerarIndividual(financeiroSelecionado.id)} className="btn-primary" style={{ padding: '5px 15px', width: 'auto' }}>Gerar Parcelas</button>
            </div>
            <div className="tabela-container" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="tabela">
                <thead><tr><th>Venc.</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {listaParcelas.map((p) => (
                    <tr key={p.id} style={{ backgroundColor: p.status === "Paga" ? "#d4edda" : "#fff" }}>
                      <td>{new Date(p.dataVencimento).toLocaleDateString("pt-BR")}</td>
                      <td>{formatarMoeda(p.valorTotal)}</td>
                      <td>{p.status}</td>
                      <td className="acoes">
                        <button onClick={() => acaoFinanceira(p.id, p.status === 'Aberta' ? 'pagar' : 'estornar')} className="btn-icon">{p.status === 'Aberta' ? '✔' : '↩'}</button>
                        <button onClick={() => deletarParcela(p.id)} className="btn-icon" style={{ color: "red" }}><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}