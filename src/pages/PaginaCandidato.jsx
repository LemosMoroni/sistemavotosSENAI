import { useState, useEffect } from 'react';
import { buscarCandidatosPorEscola, registrarVoto } from '../services/supabase';
import { tocarSomUrna } from '../utils/somUrna';
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

    if (import.meta.env.DEV && escola.id === '__teste__') {
      setCandidatos([
        { id: '__cand1__', nome: 'Aluno Teste A', numero: 1, foto_url: null, escola_id: '__teste__' },
        { id: '__cand2__', nome: 'Aluno Teste B', numero: 2, foto_url: null, escola_id: '__teste__' },
      ]);
      setCarregando(false);
      return;
    }

    const resultado = await buscarCandidatosPorEscola(escola.id);
    if (resultado.sucesso) {
      setCandidatos(resultado.candidatos);
    }
    setCarregando(false);
  };

  const handleConfirmar = async () => {
    if (!candidatoSelecionado || votando) return;

    if (window.confirm(`Confirma seu voto em ${candidatoSelecionado.nome}?`)) {
      setVotando(true);

      if (import.meta.env.DEV && candidatoSelecionado.id.startsWith('__')) {
        tocarSomUrna();
        onVotoConfirmado();
        return;
      }

      const resultado = await registrarVoto(cpf, candidatoSelecionado.id);
      if (resultado.sucesso) {
        tocarSomUrna();
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
          <p className="msg-carregando">Carregando candidatos...</p>
        </div>
      </div>
    );
  }

  if (candidatos.length === 0) {
    return (
      <div className="pagina-candidato">
        <div className="container-candidato">
          <div className="header-candidato">
            <img src="/vereador-mirim.png" alt="Vereador Mirim 2026" className="logo-img-topo" />
            <h2>Nenhum candidato encontrado</h2>
            <p>Não há candidatos cadastrados para esta escola.</p>
          </div>
          <button className="btn-voltar" onClick={() => window.location.reload()}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-candidato">
      <div className="container-candidato">
        <button
          className="btn-voltar"
          onClick={() => window.location.reload()}
          disabled={votando}
        >
          ← Voltar
        </button>

        <div className="header-candidato">
          <img src="/vereador-mirim.png" alt="Vereador Mirim 2026" className="logo-img-topo" />
          <h2>Escolha seu candidato</h2>
          <p className="escola-label">🏫 {escola.nome}</p>
        </div>

        <div className="grade-candidatos">
          {candidatos.map((candidato) => {
            const selecionado = candidatoSelecionado?.id === candidato.id;
            return (
              <button
                key={candidato.id}
                className={`card-candidato ${selecionado ? 'selecionado' : ''}`}
                onClick={() => setCandidatoSelecionado(selecionado ? null : candidato)}
                disabled={votando}
              >
                {selecionado && <span className="badge-check">✓</span>}
                <div className="card-foto">
                  {candidato.foto_url ? (
                    <img src={candidato.foto_url} alt={candidato.nome} />
                  ) : (
                    <div className="card-foto-placeholder">{candidato.nome.charAt(0)}</div>
                  )}
                </div>
                <div className="card-numero">Nº {candidato.numero}</div>
                <div className="card-nome">{candidato.nome}</div>
              </button>
            );
          })}
        </div>

        {!candidatoSelecionado && (
          <p className="dica-selecao">Toque em um candidato para selecioná-lo</p>
        )}

        <div className="acoes">
          <button
            className="btn-confirmar"
            onClick={handleConfirmar}
            disabled={!candidatoSelecionado || votando}
          >
            {votando ? 'Confirmando...' : `✓ Votar em ${candidatoSelecionado?.nome ?? '...'}`}
          </button>
        </div>

        <div className="aviso">
          <p>⚠️ Após confirmar, seu voto não poderá ser alterado</p>
        </div>

        <div className="footer-senai">
          <p>Desenvolvido no <span>SENAI - Correia Pinto</span></p>
        </div>
      </div>
    </div>
  );
}
