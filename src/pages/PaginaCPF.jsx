import { useState, useEffect } from 'react';
import { validarCPF, formatarCPF } from '../utils/cpf';
import { buscarEscolas } from '../services/supabase';
import './PaginaCPF.css';

const ESCOLA_KEY = 'votacao_escola_selecionada';

export default function PaginaCPF({ onCPFValido }) {
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [escolas, setEscolas] = useState([]);
  const [escolaSelecionada, setEscolaSelecionada] = useState(() => {
    try {
      const salva = localStorage.getItem(ESCOLA_KEY);
      return salva ? JSON.parse(salva) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    buscarEscolas().then((resultado) => {
      if (resultado.sucesso) {
        setEscolas(resultado.escolas);
      }
    });
  }, []);

  const handleEscola = (escola) => {
    setEscolaSelecionada(escola);
    localStorage.setItem(ESCOLA_KEY, JSON.stringify(escola));
  };

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

    if (!escolaSelecionada) {
      setErro('Selecione a escola antes de continuar.');
      return;
    }

    if (!validarCPF(cpf)) {
      setErro('CPF inválido. Verifique os dígitos.');
      return;
    }

    setCarregando(true);

    const { verificarCPF: verificarCPFSupabase } = await import('../services/supabase');
    const resultado = await verificarCPFSupabase(cpf);

    setCarregando(false);

    if (resultado.valido) {
      onCPFValido(cpf, escolaSelecionada);
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
            <label htmlFor="escola">Escola</label>
            <select
              id="escola"
              className="select-escola"
              value={escolaSelecionada?.id ?? ''}
              onChange={(e) => {
                const escola = escolas.find((es) => es.id === e.target.value);
                if (escola) handleEscola(escola);
              }}
              disabled={carregando || escolas.length === 0}
            >
              <option value="" disabled>
                {escolas.length === 0 ? 'Carregando...' : 'Selecione a escola'}
              </option>
              {escolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome}
                </option>
              ))}
            </select>
          </div>

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

          <button type="submit" disabled={carregando || cpf.length !== 11 || !escolaSelecionada}>
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
