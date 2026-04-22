import { useState, useEffect } from 'react';
import { buscarEscolas } from '../services/supabase';
import './PaginaEscola.css';

export default function PaginaEscola({ onEscolaSelecionada }) {
  const [escolaSelecionada, setEscolaSelecionada] = useState(null);
  const [escolas, setEscolas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEscolas();
  }, []);

  const carregarEscolas = async () => {
    setCarregando(true);
    const resultado = await buscarEscolas();
    if (resultado.sucesso) {
      setEscolas(resultado.escolas);
    }
    setCarregando(false);
  };

  const handleContinuar = () => {
    if (escolaSelecionada) {
      onEscolaSelecionada(escolaSelecionada);
    }
  };

  if (carregando) {
    return (
      <div className="pagina-escola">
        <div className="container">
          <div className="header">
            <div className="logo-pequeno">🗳️</div>
            <h2>Carregando escolas...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-escola">
      <div className="container">
        <div className="header">
          <div className="logo-pequeno">🗳️</div>
          <h2>Selecione sua escola</h2>
          <p>Escolha a escola do candidato que deseja votar</p>
        </div>

        <div className="lista-escolas">
          {escolas.map((escola) => (
            <button
              key={escola.id}
              className={`escola-card ${escolaSelecionada?.id === escola.id ? 'selecionada' : ''}`}
              onClick={() => setEscolaSelecionada(escola)}
              disabled={carregando}
            >
              <div className="escola-icon">🏫</div>
              <div className="escola-nome">{escola.nome}</div>
              {escolaSelecionada?.id === escola.id && (
                <div className="check">✓</div>
              )}
            </button>
          ))}
        </div>

        <button
          className="btn-continuar"
          onClick={handleContinuar}
          disabled={!escolaSelecionada || carregando}
        >
          {carregando ? 'Carregando...' : 'Continuar'}
        </button>

        <div className="footer-senai">
          <p>Desenvolvido no <span>SENAI - Correia Pinto</span></p>
        </div>
      </div>
    </div>
  );
}
