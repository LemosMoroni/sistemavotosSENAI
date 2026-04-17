import { createClient } from '@supabase/supabase-js';

// SUBSTITUA COM SUAS CREDENCIAIS DO SUPABASE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'SUA_URL_AQUI';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA_CHAVE_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================
// FUNÇÕES DE INTEGRAÇÃO
// =====================================================

/**
 * Verificar se CPF já votou
 */
export async function verificarCPF(cpf) {
  try {
    // Verificar se já existe voto com este CPF
    const { data, error } = await supabase
      .from('votos')
      .select('eleitor_cpf')
      .eq('eleitor_cpf', cpf)
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      return { valido: false, mensagem: 'Este CPF já votou' };
    }

    return { valido: true, mensagem: 'CPF válido' };
  } catch (error) {
    console.error('Erro ao verificar CPF:', error);
    return { valido: false, mensagem: 'Erro ao verificar CPF' };
  }
}

/**
 * Buscar todas as escolas ativas
 */
export async function buscarEscolas() {
  try {
    const { data, error } = await supabase
      .from('escolas')
      .select('id, nome')
      .eq('ativa', true)
      .order('nome');

    if (error) throw error;
    return { sucesso: true, escolas: data };
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    return { sucesso: false, escolas: [] };
  }
}

/**
 * Buscar candidatos de uma escola
 */
export async function buscarCandidatosPorEscola(escolaId) {
  try {
    const { data, error } = await supabase
      .from('candidatos')
      .select(`
        id,
        nome,
        numero,
        foto_url,
        escola_id,
        escolas (nome)
      `)
      .eq('escola_id', escolaId)
      .eq('ativo', true)
      .order('numero');

    if (error) throw error;
    return { sucesso: true, candidatos: data };
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return { sucesso: false, candidatos: [] };
  }
}

/**
 * Registrar voto
 */
export async function registrarVoto(cpf, candidatoId) {
  try {
    // Verificar se CPF já votou
    const verificacao = await verificarCPF(cpf);
    if (!verificacao.valido) {
      return {
        sucesso: false,
        mensagem: verificacao.mensagem
      };
    }

    // Obter IP do cliente
    let ip = null;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ip = ipData.ip;
    } catch (e) {
      console.log('Não foi possível obter IP');
    }

    // Obter escola do candidato
    const { data: candidato, error: candidatoError } = await supabase
      .from('candidatos')
      .select('escola_id')
      .eq('id', candidatoId)
      .single();

    if (candidatoError) throw candidatoError;

    // Registrar voto
    const { error } = await supabase
      .from('votos')
      .insert([{
        eleitor_cpf: cpf,
        candidato_id: candidatoId,
        escola_id: candidato.escola_id,
        ip_address: ip
      }]);

    if (error) throw error;

    return {
      sucesso: true,
      mensagem: 'Voto registrado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao registrar voto:', error);
    return {
      sucesso: false,
      mensagem: 'Erro ao registrar voto. Tente novamente.'
    };
  }
}

/**
 * Obter resultados em tempo real
 */
export async function obterResultados() {
  try {
    const { data, error } = await supabase.rpc('obter_resultados');

    if (error) throw error;
    return { sucesso: true, resultados: data };
  } catch (error) {
    console.error('Erro ao obter resultados:', error);
    return { sucesso: false, resultados: [] };
  }
}

/**
 * Obter resultados agrupados por escola com fotos dos candidatos
 */
export async function obterResultadosPorEscola() {
  try {
    const [{ data: candidatos, error: errCand }, { data: votos, error: errVotos }] =
      await Promise.all([
        supabase
          .from('candidatos')
          .select('id, nome, numero, foto_url, escola_id, escolas(id, nome)')
          .eq('ativo', true)
          .order('numero'),
        supabase.from('votos').select('candidato_id'),
      ]);

    if (errCand) throw errCand;
    if (errVotos) throw errVotos;

    const votosPorCandidato = {};
    votos.forEach((v) => {
      votosPorCandidato[v.candidato_id] = (votosPorCandidato[v.candidato_id] || 0) + 1;
    });

    const escolasMap = {};
    candidatos.forEach((cand) => {
      const escolaId = cand.escola_id;
      const escolaNome = cand.escolas?.nome || 'Desconhecida';
      if (!escolasMap[escolaId]) {
        escolasMap[escolaId] = { id: escolaId, nome: escolaNome, candidatos: [] };
      }
      escolasMap[escolaId].candidatos.push({ ...cand, votos: votosPorCandidato[cand.id] || 0 });
    });

    const escolas = Object.values(escolasMap).map((escola) => {
      const ordenados = [...escola.candidatos].sort((a, b) => b.votos - a.votos);
      const totalEscola = ordenados.reduce((sum, c) => sum + c.votos, 0);
      return { ...escola, candidatos: ordenados, totalVotos: totalEscola };
    });

    const totalVotos = votos.length;
    const escolasVotando = escolas.filter((e) => e.totalVotos > 0).length;

    return { sucesso: true, escolas, totalVotos, escolasVotando };
  } catch (error) {
    console.error('Erro ao obter resultados por escola:', error);
    return { sucesso: false, escolas: [], totalVotos: 0, escolasVotando: 0 };
  }
}

/**
 * Obter estatísticas gerais
 */
export async function obterEstatisticas() {
  try {
    // Total de votos
    const { count: totalVotos } = await supabase
      .from('votos')
      .select('*', { count: 'exact', head: true });

    // Total de CPFs únicos que votaram
    const { data: votosData, error } = await supabase
      .from('votos')
      .select('eleitor_cpf, escola_id, escolas (nome)');

    if (error) throw error;

    // Contar CPFs únicos
    const cpfsUnicos = new Set(votosData.map(v => v.eleitor_cpf));
    const totalEleitores = cpfsUnicos.size;

    // Agrupar por escola
    const votosPorEscola = votosData.reduce((acc, voto) => {
      const escolaNome = voto.escolas?.nome || 'Desconhecida';
      acc[escolaNome] = (acc[escolaNome] || 0) + 1;
      return acc;
    }, {});

    return {
      sucesso: true,
      estatisticas: {
        totalEleitores: totalEleitores,
        totalVotos: totalVotos,
        jaVotaram: totalEleitores,
        pendentes: 0,
        percentualParticipacao: 100,
        votosPorEscola: votosPorEscola
      }
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return { sucesso: false, estatisticas: null };
  }
}

/**
 * Obter lista de votos com CPF parcialmente oculto
 */
export async function obterListaVotos() {
  try {
    const { data, error } = await supabase
      .from('votos')
      .select(`
        id,
        eleitor_cpf,
        data_voto,
        candidatos (nome),
        escolas (nome)
      `)
      .order('data_voto', { ascending: false });

    if (error) throw error;

    // Mascarar CPFs
    const votosComCpfMascarado = data.map(voto => ({
      ...voto,
      cpf_mascarado: mascarCPF(voto.eleitor_cpf)
    }));

    return { sucesso: true, votos: votosComCpfMascarado };
  } catch (error) {
    console.error('Erro ao obter lista de votos:', error);
    return { sucesso: false, votos: [] };
  }
}

/**
 * Mascarar CPF (mostra só primeiros 3 e últimos 2 dígitos)
 * Exemplo: 123.456.789-01 → 123.***.***-01
 */
function mascarCPF(cpf) {
  if (!cpf || cpf.length !== 11) return '***.***.***-**';
  return `${cpf.substr(0, 3)}.***.***-${cpf.substr(9, 2)}`;
}

/**
 * Subscrever a atualizações de votos em tempo real
 */
export function subscreverVotos(callback) {
  const subscription = supabase
    .channel('votos_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'votos' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}
