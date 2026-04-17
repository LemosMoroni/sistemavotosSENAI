import { useState } from 'react';
import { validarCPF, formatarCPF } from '../utils/cpf';
import './PaginaCPF.css';

export default function PaginaCPF({ onCPFValido }) {
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const valor = e.target.value.replace(/[^\d]/g, '');
    if (valor.length <= 11) {
      setCpf(valor);
      setErro('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!validarCPF(cpf)) {
      setErro('CPF inválido. Verifique os dígitos.');
      return;
    }

    setCarregando(true);
    
    // Importar função do Supabase
    const { verificarCPF: verificarCPFSupabase } = await import('../services/supabase');
    
    const resultado = await verificarCPFSupabase(cpf);
    
    setCarregando(false);
    
    if (resultado.valido) {
      onCPFValido(cpf);
    } else {
      setErro(resultado.mensagem);
    }
  };

  return (
    <div className="pagina-cpf">
      <div className="container">
        <div className="logo">🗳️</div>
        <h1>Sistema de Votação</h1>
        <p className="subtitulo">Vereador Mirim 2026</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="cpf">Digite seu CPF</label>
            <input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={formatarCPF(cpf)}
              onChange={handleChange}
              disabled={carregando}
              autoFocus
            />
          </div>

          {erro && <div className="erro">{erro}</div>}

          <button type="submit" disabled={carregando || cpf.length !== 11}>
            {carregando ? 'Validando...' : 'Continuar'}
          </button>
        </form>

        <div className="info">
          <p>✓ Seu voto é secreto</p>
          <p>✓ Você pode votar apenas uma vez</p>
        </div>

        <div className="footer-senai">
          <p>Desenvolvido no <span>SENAI – Otacílio Costa</span></p>
        </div>
      </div>
    </div>
  );
}
