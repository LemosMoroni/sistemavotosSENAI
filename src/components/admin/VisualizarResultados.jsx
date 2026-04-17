import { useState, useEffect } from 'react';
import { supabase, obterResultados, obterEstatisticas } from '../../services/supabase';
import './VisualizarResultados.css';

export default function VisualizarResultados() {
  const [resultados, setResultados] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();

    // Atualizar em tempo real
    const subscription = supabase
      .channel('votos_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votos' },
        () => {
          carregarDados();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const carregarDados = async () => {
    setCarregando(true);

    const [resResultados, resEstatisticas] = await Promise.all([
      obterResultados(),
      obterEstatisticas()
    ]);

    if (resResultados.sucesso) {
      setResultados(resResultados.resultados);
    }

    if (resEstatisticas.sucesso) {
      setEstatisticas(resEstatisticas.estatisticas);
    }

    setCarregando(false);
  };

  if (carregando) {
    return <div className="carregando">Carregando resultados...</div>;
  }

  const totalVotos = resultados.reduce((acc, r) => acc + r.total_votos, 0);

  return (
    <div className="visualizar-resultados">
      <div className="header-secao">
        <div>
          <h2>Resultados da Votação</h2>
          <p>Atualização em tempo real</p>
        </div>
        <button onClick={carregarDados} className="btn-atualizar">
          🔄 Atualizar
        </button>
      </div>

      {/* Estatísticas Gerais */}
      {estatisticas && (
        <div className="cards-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{estatisticas.totalEleitores}</h3>
              <p>Pessoas Votaram</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{estatisticas.totalVotos}</h3>
              <p>Total de Votos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>100%</h3>
              <p>Participação</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🗳️</div>
            <div className="stat-info">
              <h3>{Object.keys(estatisticas.votosPorEscola || {}).length}</h3>
              <p>Escolas Votando</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados por Candidato */}
      <div className="secao-resultados">
        <h3>Votos por Candidato</h3>
        
        {totalVotos === 0 ? (
          <div className="sem-votos">
            <p>Nenhum voto registrado ainda</p>
          </div>
        ) : (
          <div className="lista-resultados">
            {resultados.map((resultado, index) => (
              <div key={resultado.candidato_id} className="resultado-item">
                <div className="resultado-posicao">
                  {index + 1}º
                </div>
                <div className="resultado-info">
                  <h4>{resultado.candidato_nome}</h4>
                  <p>{resultado.escola_nome}</p>
                </div>
                <div className="resultado-barra">
                  <div 
                    className="barra-progresso"
                    style={{ width: `${resultado.percentual}%` }}
                  >
                    <span className="barra-label">
                      {resultado.percentual}%
                    </span>
                  </div>
                </div>
                <div className="resultado-votos">
                  <strong>{resultado.total_votos}</strong>
                  <small>{resultado.total_votos === 1 ? 'voto' : 'votos'}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Votos por Escola */}
      {estatisticas?.votosPorEscola && Object.keys(estatisticas.votosPorEscola).length > 0 && (
        <div className="secao-resultados">
          <h3>Votos por Escola</h3>
          <div className="lista-escolas-votos">
            {Object.entries(estatisticas.votosPorEscola).map(([escola, votos]) => (
              <div key={escola} className="escola-voto-item">
                <div className="escola-voto-nome">
                  🏫 {escola}
                </div>
                <div className="escola-voto-count">
                  <strong>{votos}</strong> {votos === 1 ? 'voto' : 'votos'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
