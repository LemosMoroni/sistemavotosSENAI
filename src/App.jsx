import { useState } from 'react';
import PaginaCPF from './pages/PaginaCPF';
import PaginaEscola from './pages/PaginaEscola';
import PaginaCandidato from './pages/PaginaCandidato';
import PaginaSucesso from './pages/PaginaSucesso';
import PainelAdmin from './pages/PainelAdmin';
import './App.css';

function App() {
  const [etapa, setEtapa] = useState('cpf'); // cpf, escola, candidato, sucesso
  const [cpf, setCpf] = useState('');
  const [escola, setEscola] = useState('');

  // Verificar se está acessando /admin (funciona local e no GitHub Pages)
  const isAdmin = window.location.pathname.endsWith('/admin');

  if (isAdmin) {
    return <PainelAdmin />;
  }

  const handleCPFValido = (cpfValido) => {
    setCpf(cpfValido);
    setEtapa('escola');
  };

  const handleEscolaSelecionada = (escolaSelecionada) => {
    setEscola(escolaSelecionada);
    setEtapa('candidato');
  };

  const handleVotoConfirmado = () => {
    setEtapa('sucesso');
  };

  return (
    <div className="app">
      {etapa === 'cpf' && <PaginaCPF onCPFValido={handleCPFValido} />}
      {etapa === 'escola' && <PaginaEscola onEscolaSelecionada={handleEscolaSelecionada} />}
      {etapa === 'candidato' && (
        <PaginaCandidato cpf={cpf} escola={escola} onVotoConfirmado={handleVotoConfirmado} />
      )}
      {etapa === 'sucesso' && <PaginaSucesso />}
    </div>
  );
}

export default App;
