import { useState, useEffect, useRef } from 'react';
import { obterResultadosPorEscola } from '../../services/supabase';
import './VisualizarResultados.css';

const INTERVALO_MS = 3 * 60 * 1000;

export default function VisualizarResultados() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [proximaEm, setProximaEm] = useState(INTERVALO_MS / 1000);
  const intervalRef = useRef(null);
  const contagemRef = useRef(null);
  const conteudoRef = useRef(null);

  const carregarDados = async () => {
    setCarregando(true);
    const resultado = await obterResultadosPorEscola();
    if (resultado.sucesso) {
      setDados(resultado);
      setUltimaAtualizacao(new Date());
    }
    setCarregando(false);
    setProximaEm(INTERVALO_MS / 1000);
  };

  useEffect(() => {
    carregarDados();
    intervalRef.current = setInterval(carregarDados, INTERVALO_MS);
    contagemRef.current = setInterval(() => {
      setProximaEm((prev) => (prev > 1 ? prev - 1 : INTERVALO_MS / 1000));
    }, 1000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(contagemRef.current);
    };
  }, []);

  const exportarPDF = async () => {
    if (!dados || exportando) return;
    setExportando(true);

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const elemento = conteudoRef.current;
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let yPos = 0;
      let paginaAtual = 0;

      while (yPos < imgHeight) {
        if (paginaAtual > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yPos, imgWidth, imgHeight);
        yPos += pdfHeight;
        paginaAtual++;
      }

      const dataHora = new Date().toLocaleString('pt-BR').replace(/[/:]/g, '-').replace(', ', '_');
      pdf.save(`resultados_votacao_${dataHora}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    }

    setExportando(false);
  };

  const formatarHora = (data) =>
    data
      ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '--';

  const formatarSegundos = (s) => {
    const m = Math.floor(s / 60);
    const seg = s % 60;
    return m > 0 ? `${m}m ${seg}s` : `${seg}s`;
  };

  return (
    <div className="visualizar-resultados">
      <div className="header-secao">
        <div>
          <h2>Resultados da Votação</h2>
          <p className="info-atualizacao">
            {ultimaAtualizacao && <>Atualizado às {formatarHora(ultimaAtualizacao)} · </>}
            Próxima atualização em <strong>{formatarSegundos(proximaEm)}</strong>
          </p>
        </div>
        <div className="header-acoes">
          <button onClick={carregarDados} className="btn-atualizar" disabled={carregando}>
            {carregando ? '⏳ Carregando...' : '🔄 Atualizar'}
          </button>
          <button
            onClick={exportarPDF}
            className="btn-exportar"
            disabled={exportando || !dados || dados.totalVotos === 0}
          >
            {exportando ? '⏳ Gerando...' : '📄 Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Conteúdo capturado para PDF */}
      <div ref={conteudoRef}>
        {/* Cards de resumo */}
        <div className="cards-stats">
          <div className="stat-card">
            <div className="stat-icon">🗳️</div>
            <div className="stat-info">
              <h3>{dados?.totalVotos ?? '—'}</h3>
              <p>Total de Votos</p>
            </div>
          </div>
          <div className="stat-card stat-card-verde">
            <div className="stat-icon">🏫</div>
            <div className="stat-info">
              <h3>{dados?.escolasVotando ?? '—'}</h3>
              <p>Escolas Votando</p>
            </div>
          </div>
        </div>

        {carregando && !dados && (
          <div className="sem-votos"><p>Carregando resultados...</p></div>
        )}

        {dados?.escolas.map((escola) => (
          <div key={escola.id} className="secao-escola">
            <div className="escola-header">
              <span className="escola-header-nome">🏫 {escola.nome}</span>
              <span className="escola-header-total">
                {escola.totalVotos} {escola.totalVotos === 1 ? 'voto' : 'votos'}
              </span>
            </div>

            {escola.totalVotos === 0 ? (
              <p className="sem-votos-escola">Nenhum voto ainda</p>
            ) : (
              <div className="lista-candidatos-resultado">
                {escola.candidatos.map((cand, index) => {
                  const pct =
                    escola.totalVotos > 0
                      ? Math.round((cand.votos / escola.totalVotos) * 100)
                      : 0;
                  return (
                    <div
                      key={cand.id}
                      className={`card-candidato-resultado ${index === 0 && cand.votos > 0 ? 'lider' : ''}`}
                    >
                      <div className="candidato-foto-resultado">
                        {cand.foto_url ? (
                          <img src={cand.foto_url} alt={cand.nome} crossOrigin="anonymous" />
                        ) : (
                          <div className="foto-placeholder">👤</div>
                        )}
                        {index === 0 && cand.votos > 0 && (
                          <span className="badge-lider">1º</span>
                        )}
                      </div>
                      <div className="candidato-dados-resultado">
                        <div className="candidato-nome-resultado">{cand.nome}</div>
                        <div className="candidato-numero-resultado">Nº {cand.numero}</div>
                        <div className="barra-wrapper">
                          <div className="barra-resultado">
                            <div className="barra-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="pct-label">{pct}%</span>
                        </div>
                      </div>
                      <div className="candidato-votos-resultado">
                        <strong>{cand.votos}</strong>
                        <small>{cand.votos === 1 ? 'voto' : 'votos'}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {dados?.escolas.length === 0 && !carregando && (
          <div className="sem-votos"><p>Nenhum candidato cadastrado ainda</p></div>
        )}
      </div>
    </div>
  );
}
