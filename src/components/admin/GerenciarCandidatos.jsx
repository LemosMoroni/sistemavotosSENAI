import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import './GerenciarCandidatos.css';

export default function GerenciarCandidatos() {
  const [candidatos, setCandidatos] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editandoCandidato, setEditandoCandidato] = useState(null);

  const [nome, setNome] = useState('');
  const [escolaId, setEscolaId] = useState('');
  const [numero, setNumero] = useState('');
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);

    const { data: escolasData } = await supabase
      .from('escolas')
      .select('*')
      .order('nome');

    setEscolas(escolasData || []);

    const { data: candidatosData } = await supabase
      .from('candidatos')
      .select(`*, escolas (nome)`)
      .order('numero');

    setCandidatos(candidatosData || []);
    setCarregando(false);
  };

  const handleFotoChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setFoto(arquivo);
      setPreviewFoto(URL.createObjectURL(arquivo));
    }
  };

  const abrirNovo = () => {
    setEditandoCandidato(null);
    setNome('');
    setEscolaId('');
    setNumero('');
    setFoto(null);
    setPreviewFoto('');
    setModalAberto(true);
  };

  const abrirEditar = (candidato) => {
    setEditandoCandidato(candidato);
    setNome(candidato.nome);
    setEscolaId(candidato.escola_id);
    setNumero(candidato.numero || '');
    setFoto(null);
    setPreviewFoto(candidato.foto_url || '');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoCandidato(null);
    setNome('');
    setEscolaId('');
    setNumero('');
    setFoto(null);
    setPreviewFoto('');
  };

  const salvarCandidato = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !escolaId) return;

    setSalvando(true);

    try {
      let fotoUrl = editandoCandidato ? editandoCandidato.foto_url : null;

      if (foto) {
        const ext = foto.name.split('.').pop().toLowerCase();
        const nomeArquivo = `${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('fotos-candidatos')
          .upload(nomeArquivo, foto);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('fotos-candidatos')
          .getPublicUrl(nomeArquivo);

        fotoUrl = publicUrl;
      }

      if (previewFoto === '' && editandoCandidato) {
        fotoUrl = null;
      }

      const dados = {
        nome: nome.trim(),
        escola_id: escolaId,
        numero: numero.trim() || null,
        foto_url: fotoUrl,
      };

      if (editandoCandidato) {
        const { error } = await supabase
          .from('candidatos')
          .update(dados)
          .eq('id', editandoCandidato.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('candidatos')
          .insert([dados]);
        if (error) throw error;
      }

      fecharModal();
      carregarDados();
    } catch (error) {
      alert('Erro ao salvar candidato: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluirCandidato = async (id, nomeCandidato) => {
    if (window.confirm(`Tem certeza que deseja excluir "${nomeCandidato}"?`)) {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', id);

      if (!error) {
        carregarDados();
      } else {
        alert('Erro ao excluir: ' + error.message);
      }
    }
  };

  const toggleAtivo = async (id, ativoAtual) => {
    const { error } = await supabase
      .from('candidatos')
      .update({ ativo: !ativoAtual })
      .eq('id', id);

    if (!error) {
      carregarDados();
    }
  };

  if (carregando) {
    return <div className="carregando">Carregando candidatos...</div>;
  }

  return (
    <div className="gerenciar-candidatos">
      <div className="header-secao">
        <div>
          <h2>Gerenciar Candidatos</h2>
          <p>Total: {candidatos.length} candidato(s)</p>
        </div>
        <button
          className="btn-adicionar"
          onClick={abrirNovo}
          disabled={escolas.length === 0}
        >
          + Novo Candidato
        </button>
      </div>

      {escolas.length === 0 && (
        <div className="alerta-info">
          ⚠️ Cadastre pelo menos uma escola antes de adicionar candidatos
        </div>
      )}

      <div className="lista-candidatos-admin">
        {candidatos.length === 0 ? (
          <div className="vazio">
            <p>Nenhum candidato cadastrado</p>
            {escolas.length > 0 && (
              <button onClick={abrirNovo}>
                Adicionar Primeiro Candidato
              </button>
            )}
          </div>
        ) : (
          candidatos.map((candidato) => (
            <div key={candidato.id} className="candidato-item">
              <div className="candidato-foto-mini">
                {candidato.foto_url ? (
                  <img src={candidato.foto_url} alt={candidato.nome} />
                ) : (
                  <div className="foto-placeholder-mini">
                    {candidato.nome.charAt(0)}
                  </div>
                )}
              </div>
              <div className="candidato-info-admin">
                <h3>{candidato.nome}</h3>
                <p>🏫 {candidato.escolas?.nome || 'Escola não encontrada'}</p>
                {candidato.numero && <p>Nº {candidato.numero}</p>}
              </div>
              <div className="candidato-status">
                <span className={`badge ${candidato.ativo ? 'ativo' : 'inativo'}`}>
                  {candidato.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="candidato-acoes-admin">
                <button
                  onClick={() => abrirEditar(candidato)}
                  className="btn-editar"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleAtivo(candidato.id, candidato.ativo)}
                  className="btn-toggle"
                >
                  {candidato.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => excluirCandidato(candidato.id, candidato.nome)}
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
          <div className="modal-conteudo-grande" onClick={(e) => e.stopPropagation()}>
            <h3>{editandoCandidato ? 'Editar Candidato' : 'Novo Candidato'}</h3>
            <form onSubmit={salvarCandidato}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome do Candidato *</label>
                  <input
                    type="text"
                    placeholder="Nome completo ou nome para urna"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Escola *</label>
                  <select
                    value={escolaId}
                    onChange={(e) => setEscolaId(e.target.value)}
                    required
                  >
                    <option value="">Selecione a escola</option>
                    {escolas.map((escola) => (
                      <option key={escola.id} value={escola.id}>
                        {escola.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Número para votação *</label>
                  <input
                    type="text"
                    placeholder="Ex: 01, 07, 15"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    maxLength="3"
                    required
                  />
                </div>

                <div className="form-group-foto">
                  <label>Foto do Candidato</label>
                  <div className="upload-area">
                    {previewFoto ? (
                      <div className="preview-container">
                        <img src={previewFoto} alt="Preview" />
                        <button
                          type="button"
                          className="btn-remover-foto"
                          onClick={() => {
                            setFoto(null);
                            setPreviewFoto('');
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          style={{ display: 'none' }}
                        />
                        <div className="upload-placeholder">
                          <span className="upload-icon">📸</span>
                          <p>Clique para selecionar foto</p>
                          <small>JPG, PNG (máx 5MB)</small>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-acoes">
                <button type="submit" disabled={salvando || !nome.trim() || !escolaId || !numero.trim()}>
                  {salvando ? 'Salvando...' : editandoCandidato ? 'Salvar Alterações' : 'Salvar Candidato'}
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
