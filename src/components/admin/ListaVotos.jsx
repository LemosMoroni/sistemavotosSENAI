import { useState, useEffect } from 'react';
import { obterListaVotos } from '../../services/supabase';
import './ListaVotos.css';

export default function ListaVotos() {
  const [votos, setVotos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarVotos();
  }, []);

  const carregarVotos = async () => {
    setCarregando(true);
    const resultado = await obterListaVotos();
    if (resultado.sucesso) {
      setVotos(resultado.votos);
    }
    setCarregando(false);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (carregando) {
    return <div className="carregando">Carregando votos...</div>;
  }

  return (
    <div className="lista-votos">
      <div className="header-lista">
        <h3>Lista de Votos Registrados</h3>
        <p>Total: {votos.length} voto(s)</p>
      </div>

      {votos.length === 0 ? (
        <div className="sem-votos">
          <p>Nenhum voto registrado ainda</p>
        </div>
      ) : (
        <div className="tabela-container">
          <table className="tabela-votos">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>CPF</th>
                <th>Candidato</th>
                <th>Escola</th>
              </tr>
            </thead>
            <tbody>
              {votos.map((voto) => (
                <tr key={voto.id}>
                  <td>{formatarData(voto.data_voto)}</td>
                  <td className="cpf-cell">
                    <code>{voto.cpf_mascarado}</code>
                  </td>
                  <td>{voto.candidatos?.nome || 'N/A'}</td>
                  <td>{voto.escolas?.nome || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
