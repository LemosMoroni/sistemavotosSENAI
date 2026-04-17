import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import './GerenciarEscolas.css';

export default function GerenciarEscolas() {
  const [escolas, setEscolas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeEscola, setNomeEscola] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [editandoEscola, setEditandoEscola] = useState(null);

  useEffect(() => {
    carregarEscolas();
  }, []);

  const carregarEscolas = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from('escolas')
      .select('*')
      .order('nome');

    if (!error) {
      setEscolas(data);
    }
    setCarregando(false);
  };

  const abrirNovo = () => {
    setEditandoEscola(null);
    setNomeEscola('');
    setModalAberto(true);
  };

  const abrirEditar = (escola) => {
    setEditandoEscola(escola);
    setNomeEscola(escola.nome);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoEscola(null);
    setNomeEscola('');
  };

  const salvarEscola = async (e) => {
    e.preventDefault();
    if (!nomeEscola.trim()) return;

    setSalvando(true);

    if (editandoEscola) {
      const { error } = await supabase
        .from('escolas')
        .update({ nome: nomeEscola.trim() })
        .eq('id', editandoEscola.id);

      if (!error) {
        fecharModal();
        carregarEscolas();
      } else {
        alert('Erro ao editar escola: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('escolas')
        .insert([{ nome: nomeEscola.trim() }]);

      if (!error) {
        fecharModal();
        carregarEscolas();
      } else {
        alert('Erro ao adicionar escola: ' + error.message);
      }
    }

    setSalvando(false);
  };

  const toggleAtiva = async (id, ativaAtual) => {
    const { error } = await supabase
      .from('escolas')
      .update({ ativa: !ativaAtual })
      .eq('id', id);

    if (!error) {
      carregarEscolas();
    }
  };

  const excluirEscola = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      const { error } = await supabase
        .from('escolas')
        .delete()
        .eq('id', id);

      if (!error) {
        carregarEscolas();
      } else {
        alert('Erro ao excluir: ' + error.message);
      }
    }
  };

  if (carregando) {
    return <div className="carregando">Carregando escolas...</div>;
  }

  return (
    <div className="gerenciar-escolas">
      <div className="header-secao">
        <div>
          <h2>Gerenciar Escolas</h2>
          <p>Total: {escolas.length} escola(s)</p>
        </div>
        <button
          className="btn-adicionar"
          onClick={abrirNovo}
        >
          + Nova Escola
        </button>
      </div>

      <div className="lista-escolas-admin">
        {escolas.length === 0 ? (
          <div className="vazio">
            <p>Nenhuma escola cadastrada</p>
            <button onClick={abrirNovo}>
              Adicionar Primeira Escola
            </button>
          </div>
        ) : (
          escolas.map((escola) => (
            <div key={escola.id} className="escola-item">
              <div className="escola-info">
                <h3>{escola.nome}</h3>
                <span className={`status ${escola.ativa ? 'ativa' : 'inativa'}`}>
                  {escola.ativa ? '✓ Ativa' : '✗ Inativa'}
                </span>
              </div>
              <div className="escola-acoes">
                <button
                  onClick={() => abrirEditar(escola)}
                  className="btn-editar"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleAtiva(escola.id, escola.ativa)}
                  className="btn-toggle"
                >
                  {escola.ativa ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => excluirEscola(escola.id, escola.nome)}
                  className="btn-excluir"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <h3>{editandoEscola ? 'Editar Escola' : 'Nova Escola'}</h3>
            <form onSubmit={salvarEscola}>
              <input
                type="text"
                placeholder="Nome da escola"
                value={nomeEscola}
                onChange={(e) => setNomeEscola(e.target.value)}
                autoFocus
              />
              <div className="modal-acoes">
                <button type="submit" disabled={salvando || !nomeEscola.trim()}>
                  {salvando ? 'Salvando...' : editandoEscola ? 'Salvar Alterações' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={fecharModal}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
