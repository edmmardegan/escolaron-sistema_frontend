import { useState, useEffect } from "react";
import { FaTrash, FaPen, FaUserPlus, FaSave, FaTimes } from "react-icons/fa";
// src/pages/Alunos/index.jsx
import { useAuth } from "../../AuthContext.jsx"; // "../.." sai de Alunos, sai de pages e chega na src
import { api } from "../../services/api.js";     // "../.." sai de Alunos, sai de pages e entra em services
import "./styles.css";

export default function Alunos() {
  const [listaAlunos, setListaAlunos] = useState([]);
  const [formAluno, setFormAluno] = useState({
    nome: "", telefone: "", dataNascimento: "", ativo: true,
    nomePai: "", nomeMae: "", rua: "", bairro: "", cidade: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [exibindoForm, setExibindoForm] = useState(false);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const dados = await api.getAlunos();
      setListaAlunos(dados);
    } catch (e) { console.error(e); alert("Erro ao carregar alunos."); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.saveAluno(formAluno, editandoId);
      alert("Aluno salvo!");
      setFormAluno({ nome: "", telefone: "", dataNascimento: "", ativo: true, nomePai: "", nomeMae: "", rua: "", bairro: "", cidade: "" });
      setEditandoId(null);
      setExibindoForm(false);
      carregar();
    } catch (e) { alert("Erro ao salvar"); }
  };

  const prepararEdicao = (aluno) => {
    setFormAluno(aluno);
    setEditandoId(aluno.id);
    setExibindoForm(true);
  };

  const mascaraTelefone = (valor) => {
    if (!valor) return "";
    valor = valor.replace(/\D/g, "");
    valor = valor.substring(0, 11);
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d)(\d{4})$/, "$1-$2");
    return valor;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "telefone") {
      setFormAluno({ ...formAluno, [name]: mascaraTelefone(value) });
    } else {
      setFormAluno({ ...formAluno, [name]: type === "checkbox" ? checked : value });
    }
  };

  return (
    <div className="container-alunos">
      <div className="card">
        <div className="header-card">
          <h2>Gerenciar Alunos</h2>
          {!exibindoForm && (
            <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
              <FaUserPlus /> Novo Aluno
            </button>
          )}
        </div>

        {exibindoForm && (
          <form onSubmit={salvar} className="form-grid">
            {/* LINHA 1 */}
            <div className="input-group campo-medio">
              <label>Nome Completo:</label>
              <input required name="nome" value={formAluno.nome} onChange={handleChange} className="input-field" />
            </div>
            <div className="input-group">
              <label>Telefone:</label>
              <input name="telefone" value={formAluno.telefone} onChange={handleChange} className="input-field" maxLength="15" />
            </div>
            <div className="input-group">
              <label>Data Nasc:</label>
              <input type="date" name="dataNascimento" value={formAluno.dataNascimento} onChange={handleChange} className="input-field" />
            </div>

            {/* LINHA 2 */}
            <div className="input-group campo-medio">
              <label>Rua:</label>
              <input name="rua" value={formAluno.rua} onChange={handleChange} className="input-field" />
            </div>
            <div className="input-group">
              <label>Bairro:</label>
              <input name="bairro" value={formAluno.bairro} onChange={handleChange} className="input-field" />
            </div>
            <div className="input-group">
              <label>Cidade:</label>
              <input name="cidade" value={formAluno.cidade} onChange={handleChange} className="input-field" />
            </div>

            {/* LINHA 3 - RECUPERADA */}
            <div className="input-group campo-medio">
              <label>Nome do Pai:</label>
              <input name="nomePai" value={formAluno.nomePai} onChange={handleChange} className="input-field" />
            </div>
            <div className="input-group campo-medio">
              <label>Nome da Mãe:</label>
              <input name="nomeMae" value={formAluno.nomeMae} onChange={handleChange} className="input-field" />
            </div>

            {/* LINHA 4 - STATUS RECUPERADO */}
            <div className="input-group checkbox-group">
              <input type="checkbox" name="ativo" id="ativo" checked={formAluno.ativo} onChange={handleChange} className="checkbox-field" />
              <label htmlFor="ativo">Aluno Ativo?</label>
            </div>

            <div className="acoes-form">
              <button type="submit" className="btn btn-primary"><FaSave /> Salvar Ficha</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setExibindoForm(false); setEditandoId(null); }}>
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
              <th>Nome</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaAlunos.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.nome}</strong></td>
                <td>{mascaraTelefone(a.telefone)}</td>
                <td style={{ color: a.ativo ? "green" : "red", fontWeight: "bold" }}>
                  {a.ativo ? "ATIVO" : "INATIVO"}
                </td>
                <td className="acoes">
                  <button onClick={() => prepararEdicao(a)} className="btn-icon icon-edit" title="Editar"><FaPen /></button>
                  <button onClick={() => api.deleteAluno(a.id).then(carregar)} className="btn-icon icon-trash" title="Excluir"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}