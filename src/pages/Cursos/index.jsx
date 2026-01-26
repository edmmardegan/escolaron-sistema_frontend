import { useState, useEffect } from 'react';
import { FaTrash, FaPen } from 'react-icons/fa';
import { api } from '../../services/api';
import './styles.css';

export default function Cursos() {
  const [listaCursos, setListaCursos] = useState([]);
  const [formCurso, setFormCurso] = useState({ nome: '', valorMensalidade: '', qtdeTermos: '' });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const dados = await api.getCursos();
      setListaCursos(dados);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar cursos');
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formCurso, 
        valorMensalidade: Number(formCurso.valorMensalidade),
        qtdeTermos: Number(formCurso.qtdeTermos) 
      };
      
      await api.saveCurso(payload, editandoId);
      alert('Curso salvo!');
      setFormCurso({ nome: '', valorMensalidade: '', qtdeTermos: '' });
      setEditandoId(null);
      carregar();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar');
    }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir curso?')) return;
    try {
      await api.deleteCurso(id);
      carregar();
    } catch (e) {
      console.error(e);
      alert('Não é possível excluir (curso em uso).');
    }
  };

  const handleChange = (e) => {
    setFormCurso({ ...formCurso, [e.target.name]: e.target.value });
  };

  const formatarMoeda = (valor) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      <div className="card">
        <h2>Gerenciar Cursos</h2>
        <form onSubmit={salvar} className="form-grid">
          
          <div className="input-group full-width">
            <label>Nome do Curso:</label>
            <input 
              required 
              name="nome" 
              value={formCurso.nome} 
              onChange={handleChange} 
              className="input-field" 
              placeholder="Ex: Informática Básica"
            />
          </div>
          
          <div className="input-group">
            <label>Valor Mensalidade Padrão:</label>
            <input 
              type="number" 
              required 
              name="valorMensalidade" 
              value={formCurso.valorMensalidade} 
              onChange={handleChange} 
              className="input-field" 
              placeholder="R$ 0,00"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label>Qtde. Termos/Módulos:</label>
            <input 
              type="number" 
              required 
              name="qtdeTermos" 
              value={formCurso.qtdeTermos} 
              onChange={handleChange} 
              className="input-field" 
              placeholder="Ex: 4"
            />
          </div>

          <div className="full-width">
            <button type="submit" className="btn btn-primary">
              {editandoId ? 'Atualizar Curso' : 'Salvar Curso'}
            </button>
          </div>
        </form>
      </div>

      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Termos</th>
              <th>Valor Padrão</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaCursos.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.nome}</strong></td>
                <td>{c.qtdeTermos} Módulos</td>
                <td>{formatarMoeda(c.valorMensalidade)}</td>
                <td className="acoes">
                  <button 
                    onClick={() => { setFormCurso(c); setEditandoId(c.id); }} 
                    className="btn-icon icon-edit" 
                    style={{ color: '#333' }}
                    title="Editar"
                  >
                    <FaPen />
                  </button>
                  <button 
                    onClick={() => deletar(c.id)} 
                    className="btn-icon icon-trash" 
                    style={{ color: '#333' }}
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}