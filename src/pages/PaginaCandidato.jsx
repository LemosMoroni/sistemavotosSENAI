import { useState, useEffect } from 'react';
import { buscarCandidatosPorEscola, registrarVoto } from '../services/supabase';
import './PaginaCandidato.css';

export default function PaginaCandidato({ cpf, escola, onVotoConfirmado }) {
  const [candidatos, setCandidatos] = useState([]);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [votando, setVotando] = useState(false);

  useEffect(() => {
    carregarCandidatos();
  }, [escola]);

  const carregarCandidatos = async () => {
    setCarregando(true);
    const resultado = await buscarCandidatosPorEscola(escola.id);
    if (resultado.sucesso && resultado.candidatos.length > 0) {
      setCandidatos(resultado.candidatos);
      // Selecionar primeiro candidato automaticamente
      setCandidatoSelecionado(resultado.candidatos[0]);
    }
    setCarregando(false);
  };

  const handleConfirmar = async () => {
    if (!candidatoSelecionado) return;

    if (window.confirm(`Confirma seu voto em ${candidatoSelecionado.nome}?`)) {
      setVotando(true);
      
      const resultado = await registrarVoto(cpf, candidatoSelecionado.id);
      
      if (resultado.sucesso) {
        onVotoConfirmado();
      } else {
        alert(resultado.mensagem || 'Erro ao registrar voto');
        setVotando(false);
      }
    }
  };

  if (carregando) {
    return (
      <div className="pagina-candidato">
        <div className="container-candidato">
          <div className="header-candidato">
            <h2>Carregando candidatos...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (candidatos.length === 0) {
    return (
      <div className="pagina-candidato">
        <div className="container-candidato">
          <div className="header-candidato">
            <h2>Nenhum candidato encontrado</h2>
            <p>Não há candidatos cadastrados para esta escola.</p>
          </div>
          <button
            className="btn-voltar"
            onClick={() => window.location.reload()}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-candidato">
      <div className="container-candidato">
        <div className="header-candidato">
          <h2>Confirme seu voto</h2>
          <p>Revise os dados do candidato antes de confirmar</p>
        </div>

        {candidatos.length > 1 && (
          <div className="seletor-candidatos">
            {candidatos.map((candidato) => (
              <button
                key={candidato.id}
                className={`mini-card ${candidatoSelecionado?.id === candidato.id ? 'ativo' : ''}`}
                onClick={() => setCandidatoSelecionado(candidato)}
              >
                <div className="mini-numero">Nº {candidato.numero}</div>
                <div className="mini-nome">{candidato.nome}</div>
              </button>
            ))}
          </div>
        )}

        <div className="candidato-card">
          <div className="candidato-foto">
            {candidatoSelecionado.foto_url ? (
              <img src={candidatoSelecionado.foto_url} alt={candidatoSelecionado.nome} />
            ) : (
              <div className="foto-placeholder">
                {candidatoSelecionado.nome.charAt(0)}
              </div>
            )}
          </div>

          <div className="candidato-info">
            {candidatoSelecionado.numero && (
              <div className="candidato-numero">Nº {candidatoSelecionado.numero}</div>
            )}
            <h3 className="candidato-nome">{candidatoSelecionado.nome}</h3>
            <p className="candidato-escola">
              <span className="icon">🏫</span>
              {escola.nome}
            </p>
          </div>
        </div>

        <div className="acoes">
          <button
            className="btn-confirmar"
            onClick={handleConfirmar}
            disabled={votando}
          >
            {votando ? 'Confirmando...' : '✓ Confirmar Voto'}
          </button>

          <button
            className="btn-voltar"
            onClick={() => window.location.reload()}
            disabled={votando}
          >
            ← Voltar
          </button>
        </div>

        <div className="aviso">
          <p>⚠️ Após confirmar, seu voto não poderá ser alterado</p>
        </div>

        <div className="footer-senai">
          <p>Desenvolvido no <span>SENAI – Otacílio Costa</span></p>
        </div>
      </div>
    </div>
  );
}
