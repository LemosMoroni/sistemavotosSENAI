import './PaginaSucesso.css';

export default function PaginaSucesso() {
  return (
    <div className="pagina-sucesso">
      <div className="container-sucesso">
        <img src="/vereador-mirim.png" alt="Vereador Mirim 2026" className="logo-img-sucesso" />
        <div className="icone-sucesso">✓</div>
        <h1>Voto Computado!</h1>
        <p className="mensagem">Seu voto foi registrado com sucesso.</p>
        
        <div className="info-box">
          <p>✓ Voto anônimo e seguro</p>
          <p>✓ Resultado será divulgado após o término</p>
          <p>✓ Obrigado por participar!</p>
        </div>

        <button
          className="btn-finalizar"
          onClick={() => window.location.reload()}
        >
          Finalizar
        </button>

        <div className="footer-senai">
          <p>Desenvolvido no <span>SENAI - Correia Pinto</span></p>
        </div>
      </div>
    </div>
  );
}
