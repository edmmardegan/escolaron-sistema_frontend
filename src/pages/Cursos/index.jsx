import { useState, useEffect } from "react";
import { FaTrash, FaPen, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { api } from "../../services/api";
import "./styles.css";

export default function Cursos() {
  const [listaCursos, setListaCursos] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formCurso, setFormCurso] = useState({
    nome: "",
    valorMensalidade: "",
    qtdeTermos: "" // Campo restaurado
  });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const dados = await api.getCursos();
      setListaCursos(dados);
    } catch (e) { console.error(e); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      // Garantindo que os valores numéricos sejam enviados corretamente
      const payload = { 
        ...formCurso, 
        valorMensalidade: Number(formCurso.valorMensalidade),
        qtdeTermos: Number(formCurso.qtdeTermos) 
      };
      
      await api.saveCurso(payload, editandoId);
      alert("Curso salvo com sucesso!");
      limparECancelar();
      carregar();
    } catch (e) { alert("Erro ao salvar."); }
  };

  const limparECancelar = () => {
    setFormCurso({ nome: "", valorMensalidade: "", qtdeTermos: "" });
    setEditandoId(null);
    setExibindoForm(false);
  };

  const prepararEdicao = (curso) => {
    setFormCurso(curso);
    setEditandoId(curso.id);
    setExibindoForm(true);
  };

  return (
    <div className="container-alunos">
      <div className="card">
        <div className="header-card">
          <h2>Gerenciar Cursos</h2>
          {!exibindoForm && (
            <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
              <FaPlus /> Novo Curso
            </button>
          )}
        </div>

        {exibindoForm && (
          <form onSubmit={salvar} className="form-grid">
            <div className="input-group campo-medio">
              <label>Nome do Curso:</label>
              <input 
                required 
                name="nome" 
                value={formCurso.nome} 
                onChange={(e) => setFormCurso({...formCurso, nome: e.target.value})} 
                className="input-field" 
              />
            </div>

            <div className="input-group">
              <label>Valor Mensalidade (R$):</label>
              <input 
                type="number"
                step="0.01"
                required
                name="valorMensalidade" 
                placeholder="R$ 0,00"
                value={formCurso.valorMensalidade} 
                onChange={(e) => setFormCurso({...formCurso, valorMensalidade: e.target.value})} 
                className="input-field" 
              />
            </div>

            {/* Campo Qtde Termos Restaurado */}
            <div className="input-group">
              <label>Qtde Termos:</label>
              <input 
                type="number"
                required
                name="qtdeTermos" 
                value={formCurso.qtdeTermos} 
                onChange={(e) => setFormCurso({...formCurso, qtdeTermos: e.target.value})} 
                className="input-field" 
              />
            </div>
            
            <div className="acoes-form">
              <button type="submit" className="btn btn-primary"><FaSave /> Salvar Curso</button>
              <button type="button" className="btn btn-secondary" onClick={limparECancelar}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Módulos</th>
              <th>Valor Mensalidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaCursos.map(c => (
              <tr key={c.id}>
                <td><strong>{c.nome}</strong></td>
                <td>{c.qtdeTermos} Módulos</td>
                <td>{Number(c.valorMensalidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="acoes">
                  <button onClick={() => prepararEdicao(c)} className="btn-icon icon-edit"><FaPen /></button>
                  <button onClick={() => api.deleteCurso(c.id).then(carregar)} className="btn-icon icon-trash"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}