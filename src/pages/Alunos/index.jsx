import { useState, useEffect } from "react";
import { FaTrash, FaPen, FaUserPlus } from "react-icons/fa";
import { api } from "../../services/api";
import "./styles.css";

export default function Alunos() {
  const [listaAlunos, setListaAlunos] = useState([]);
  const [formAluno, setFormAluno] = useState({
    nome: "",
    telefone: "",
    dataNascimento: "",
    ativo: true,
    nomePai: "",
    nomeMae: "",
    rua: "",
    bairro: "",
    cidade: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [exibindoForm, setExibindoForm] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const dados = await api.getAlunos();
      setListaAlunos(dados);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar alunos.");
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      // Remove a formatação antes de enviar pro banco (opcional, mas recomendado salvar limpo)
      // Se preferir salvar com mascara, basta remover essa linha do payload
      const payload = { ...formAluno };

      await api.saveAluno(payload, editandoId);
      alert("Aluno salvo!");

      setFormAluno({
        nome: "",
        telefone: "",
        dataNascimento: "",
        ativo: true,
        nomePai: "",
        nomeMae: "",
        rua: "",
        bairro: "",
        cidade: "",
      });
      setEditandoId(null);
      setExibindoForm(false);
      carregar();
    } catch (e) {
      alert("Erro ao salvar");
    }
  };

  const deletar = async (id) => {
    if (!confirm("Excluir aluno?")) return;
    try {
      await api.deleteAluno(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir");
    }
  };

  const prepararEdicao = (aluno) => {
    setFormAluno(aluno);
    setEditandoId(aluno.id);
    setExibindoForm(true);
  };

  // --- FUNÇÃO MÁGICA DA MÁSCARA ---
  const mascaraTelefone = (valor) => {
    if (!valor) return "";

    // 1. Remove tudo que não é número
    valor = valor.replace(/\D/g, "");

    // 2. Limita a 11 dígitos
    valor = valor.substring(0, 11);

    // 3. Aplica a formatação (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d)(\d{4})$/, "$1-$2");

    return valor;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Se for o campo telefone, aplica a máscara
    if (name === "telefone") {
      setFormAluno({ ...formAluno, [name]: mascaraTelefone(value) });
    } else {
      setFormAluno({
        ...formAluno,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

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
          <h2>Gerenciar Alunos</h2>
          <button
            className="btn btn-primary"
            onClick={() => setExibindoForm(!exibindoForm)}
          >
            {exibindoForm ? (
              "Cancelar"
            ) : (
              <>
                <FaUserPlus /> Novo Aluno
              </>
            )}
          </button>
        </div>

        {exibindoForm && (
          <form
            onSubmit={salvar}
            className="form-grid"
            style={{ marginTop: "20px" }}
          >
            <div className="input-group full-width">
              <label>Nome Completo:</label>
              <input
                required
                name="nome"
                value={formAluno.nome}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* CAMPO TELEFONE COM MÁSCARA */}
            <div className="input-group">
              <label>Telefone:</label>
              <input
                name="telefone"
                value={formAluno.telefone}
                onChange={handleChange}
                className="input-field"
                placeholder="(16) 99999-9999"
                maxLength="15" // Garante que não digite além da conta
              />
            </div>

            <div className="input-group">
              <label>Data Nasc:</label>
              <input
                type="date"
                name="dataNascimento"
                value={formAluno.dataNascimento}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="input-group full-width">
              <label>Rua:</label>
              <input
                name="rua"
                value={formAluno.rua}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label>Bairro:</label>
              <input
                name="bairro"
                value={formAluno.bairro}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label>Cidade:</label>
              <input
                name="cidade"
                value={formAluno.cidade}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label>Pai:</label>
              <input
                name="nomePai"
                value={formAluno.nomePai}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label>Mãe:</label>
              <input
                name="nomeMae"
                value={formAluno.nomeMae}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div
              className="input-group"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                paddingTop: "30px",
              }}
            >
              <input
                type="checkbox"
                name="ativo"
                checked={formAluno.ativo}
                onChange={handleChange}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setFormAluno({ ...formAluno, ativo: !formAluno.ativo })
                }
              >
                Aluno Ativo?
              </label>
            </div>

            <div className="full-width">
              <button type="submit" className="btn btn-primary">
                Salvar Ficha
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
                <td>
                  <strong>{a.nome}</strong>
                </td>

                {/* TELEFONE COM MÁSCARA NA LISTAGEM TAMBÉM */}
                <td>{mascaraTelefone(a.telefone)}</td>

                <td
                  style={{
                    fontWeight: "bold",
                    color: a.ativo ? "green" : "red",
                  }}
                >
                  {a.ativo ? "ATIVO" : "INATIVO"}
                </td>

                <td className="acoes">
                  <button
                    onClick={() => prepararEdicao(a)}
                    className="btn-icon icon-edit"
                    style={{ color: "#333" }}
                    title="Editar"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => deletar(a.id)}
                    className="btn-icon icon-trash"
                    style={{ color: "#333" }}
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
