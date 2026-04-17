import { useState } from 'react';
import './AdminLogin.css';

export default function AdminLogin({ onLogin }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Senha padrão (depois vamos melhorar)
    if (senha === import.meta.env.VITE_ADMIN_SENHA) {
      onLogin();
    } else {
      setErro('Senha incorreta');
      setSenha('');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-box">
        <div className="admin-icon">🔐</div>
        <h1>Painel Administrativo</h1>
        <p>Acesso restrito</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Digite a senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoFocus
          />

          {erro && <div className="erro">{erro}</div>}

          <button type="submit">Entrar</button>
        </form>

      </div>
    </div>
  );
}
