import React, { useState } from "react";
import "./styles.css";
import { FaPrint, FaCheckDouble, FaTimes } from "react-icons/fa";

function ModalCarne({ isOpen, onClose, onConfirm, anoPadrao }) {
  const [ano, setAno] = useState(anoPadrao || new Date().getFullYear());
  const [incluirCapa, setIncluirCapa] = useState(true);
  const [incluirMatricula, setIncluirMatricula] = useState(false);
  
  const [mesesSelecionados, setMesesSelecionados] = useState(
    new Array(12).fill(true)
  );

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const toggleMes = (index) => {
    const novosMeses = [...mesesSelecionados];
    novosMeses[index] = !novosMeses[index];
    setMesesSelecionados(novosMeses);
  };

  const selecionarTodos = (status) => {
    setMesesSelecionados(new Array(12).fill(status));
  };

  const handleConfirmar = () => {
    console.log("-> Botão 'Gerar Lote' clicado no Modal");

    const listaMeses = mesesSelecionados
      .map((selecionado, index) => (selecionado ? index + 1 : null))
      .filter((m) => m !== null);

    const dadosConfig = {
      ano: Number(ano),
      meses: listaMeses,
      incluirCapa,
      incluirMatricula,
    };

    console.log("-> Dados preparados no Modal:", dadosConfig);

    // Verifica se a função onConfirm foi recebida corretamente via props
    if (onConfirm) {
      console.log("-> Enviando dados para a página Financeiro...");
      onConfirm(dadosConfig);
    } else {
      console.error("-> ERRO: Prop onConfirm não encontrada no Modal!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3><FaPrint /> Configurar Carnê</h3>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="input-group">
            <label>Ano de Referência:</label>
            <input 
              type="number" 
              value={ano} 
              onChange={(e) => setAno(e.target.value)} 
              className="input-field"
            />
          </div>

          <div className="opcoes-extras" style={{ margin: "15px 0", display: "flex", gap: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={incluirCapa} 
                onChange={(e) => setIncluirCapa(e.target.checked)} 
              />
              Incluir Capa
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={incluirMatricula} 
                onChange={(e) => setIncluirMatricula(e.target.checked)} 
              />
              Incluir Matrícula
            </label>
          </div>

          <div className="meses-container">
            <div className="meses-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <label>Parcelas Mensais:</label>
              <div>
                <button type="button" onClick={() => selecionarTodos(true)} style={{ border: "none", background: "none", color: "blue", cursor: "pointer", marginRight: "10px" }}>Todos</button>
                <button type="button" onClick={() => selecionarTodos(false)} style={{ border: "none", background: "none", color: "blue", cursor: "pointer" }}>Nenhum</button>
              </div>
            </div>
            
            <div className="grid-meses" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {nomesMeses.map((nome, index) => (
                <div 
                  key={index} 
                  onClick={() => toggleMes(index)}
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px",
                    backgroundColor: mesesSelecionados[index] ? "#e3f2fd" : "#fff",
                    borderColor: mesesSelecionados[index] ? "#2196f3" : "#ccc",
                    color: mesesSelecionados[index] ? "#1976d2" : "#333"
                  }}
                >
                  {nome}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: "8px 15px", cursor: "pointer" }}>Cancelar</button>
          <button 
            onClick={handleConfirmar} 
            className="btn-primary" 
            style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}
          >
            <FaCheckDouble /> Gerar Lote
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCarne;