import { useState } from 'react';
import AdminLogin from './AdminLogin';
import GerenciarEscolas from '../components/admin/GerenciarEscolas';
import GerenciarCandidatos from '../components/admin/GerenciarCandidatos';
import VisualizarResultados from '../components/admin/VisualizarResultados';
import ListaVotos from '../components/admin/ListaVotos';
import './PainelAdmin.css';

export default function PainelAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('candidatos');

  if (!autenticado) {
    return <AdminLogin onLogin={() => setAutenticado(true)} />;
  }

  return (
    <div className="painel-admin">
      <header className="admin-header">
        <div className="header-content">
          <div className="logo-admin">
            <span className="icon">🗳️</span>
            <div>
              <h1>Painel Administrativo</h1>
              <p>Vereador Mirim 2026</p>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-tabs">
          <button
            className={abaSelecionada === 'candidatos' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('candidatos')}
          >
            👤 Candidatos
          </button>
          <button
            className={abaSelecionada === 'escolas' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('escolas')}
          >
            🏫 Escolas
          </button>
          <button
            className={abaSelecionada === 'resultados' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('resultados')}
          >
            📊 Resultados
          </button>
          <button
            className={abaSelecionada === 'votos' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('votos')}
          >
            📋 Votos
          </button>
        </nav>

        <div className="admin-content">
          {abaSelecionada === 'candidatos' && <GerenciarCandidatos />}
          {abaSelecionada === 'escolas' && <GerenciarEscolas />}
          {abaSelecionada === 'resultados' && <VisualizarResultados />}
          {abaSelecionada === 'votos' && <ListaVotos />}
        </div>
      </div>
    </div>
  );
}
