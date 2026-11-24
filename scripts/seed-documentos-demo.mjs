// Cria somente os dois documentos de demonstraÃ§Ã£o solicitados, em uma API local.
const [estudanteArg, coordenadorArg, periodo = "2026.2", base = "http://localhost:8080/api"] = process.argv.slice(2);
const estudanteId = Number(estudanteArg);
const coordenadorId = Number(coordenadorArg);
if (!Number.isSafeInteger(estudanteId) || estudanteId <= 0 || !Number.isSafeInteger(coordenadorId) || coordenadorId <= 0) {
  throw new Error("Informe os IDs do estudante ativo e do coordenador: node scripts/seed-documentos-demo.mjs <estudanteId> <coordenadorId> [periodo]");
}
if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname)) {
  throw new Error("Este script sÃ³ pode criar exemplos em uma API local.");
}
const marcador = "[DEMONSTRAÃ‡ÃƒO UI DOCUMENTOS]";
async function api(caminho, body) {
  const resposta = await fetch(`${base}${caminho}`, body ? {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  } : undefined);
  if (!resposta.ok) throw new Error(`A API respondeu ${resposta.status} em ${caminho}: ${await resposta.text()}`);
  return resposta.json();
}
const estudante = await api(`/estudantes/${estudanteId}`);
if (!estudante.ativo || estudante.concluido || estudante.dataConclusao) throw new Error("O estudante precisa estar ativo e nÃ£o concluÃ­do.");
const coordenador = await api(`/coordenadores/${coordenadorId}`);
if (coordenador.status !== "ATIVO") throw new Error("O coordenador precisa estar ativo.");

const exemplos = [
  {
    tipo: "PEI", caminho: "/planos-educacionais", campoMarcador: "historico",
    body: {
      estudanteId, coordenadorId, semestreAno: periodo,
      historico: `${marcador} Documento fictÃ­cio criado exclusivamente para visualizar a pÃ¡gina de documentos. NÃ£o representa avaliaÃ§Ã£o, diagnÃ³stico ou histÃ³rico real do estudante.`,
      necessidadesEspecificas: `${marcador} Exemplo de apoio pedagÃ³gico: instruÃ§Ãµes organizadas em etapas e materiais apresentados com linguagem clara.`,
      conhecimentosHabilidadesInteresses: `${marcador} Exemplo fictÃ­cio: interesse por atividades prÃ¡ticas, resoluÃ§Ã£o de problemas e projetos colaborativos.`,
      dificuldadesApresentadas: `${marcador} SituaÃ§Ã£o hipotÃ©tica para demonstraÃ§Ã£o: organizar tarefas extensas em etapas menores. NÃ£o corresponde a uma dificuldade avaliada no estudante.`,
      propostasAdaptacoesCurriculares: `${marcador} Exemplo: roteiro de atividades, acompanhamento semanal e diversificaÃ§Ã£o dos instrumentos de avaliaÃ§Ã£o.`,
    },
  },
  {
    tipo: "Plano de aÃ§Ã£o", caminho: "/planos-acao", campoMarcador: "consideracoes",
    body: {
      estudanteId, coordenadorResponsavelId: coordenadorId, periodoLetivo: periodo,
      nomeResponsavel: "ResponsÃ¡vel fictÃ­cio â€” demonstraÃ§Ã£o", grauParentesco: "NÃ£o se aplica â€” demonstraÃ§Ã£o",
      telefoneResponsavel: "00000000000", emailResponsavel: "demo@example.invalid",
      possuiComorbidade: false, usaMedicacaoContinua: false, frequentaServicoApoio: false, possuiDocumentosComprobatorios: false,
      necessidadesEspecificas: `${marcador} Registro fictÃ­cio de planejamento pedagÃ³gico. As respostas e contatos deste exemplo nÃ£o representam dados clÃ­nicos ou familiares reais.`,
      consideracoes: `${marcador} Plano fictÃ­cio, nÃ£o assinado, criado apenas para testar filtros, visualizaÃ§Ã£o e aÃ§Ãµes da pÃ¡gina de documentos.`,
      avancosDificuldadesPotencialidades: `${marcador} Exemplo hipotÃ©tico: desenvolver autonomia na organizaÃ§Ã£o dos estudos e participaÃ§Ã£o nas atividades em grupo.`,
      principaisDemandas: `${marcador} Organizar orientaÃ§Ãµes por etapas e planejar momentos de acompanhamento pedagÃ³gico.`,
      propostasIntervencao: `${marcador} Exemplo: elaborar um roteiro semanal, combinar devolutivas com docentes e revisar o planejamento ao final do perÃ­odo.`,
    },
  },
];
const resultado = [];
for (const exemplo of exemplos) {
  const lista = await api(exemplo.caminho);
  let documento = lista.find(d => d.estudanteId === estudanteId && String(d[exemplo.campoMarcador] || "").includes(marcador));
  const existente = Boolean(documento);
  if (!documento) documento = await api(exemplo.caminho, exemplo.body);
  const confirmado = await api(`${exemplo.caminho}/${documento.id}`);
  if (confirmado.estudanteId !== estudanteId || !String(confirmado[exemplo.campoMarcador]).includes(marcador)) {
    throw new Error("A confirmaÃ§Ã£o do documento nÃ£o corresponde ao exemplo solicitado.");
  }
  resultado.push({ tipo: exemplo.tipo, id: confirmado.id, estudanteId, existente, status: confirmado.status || (confirmado.arquivado ? "Arquivado" : "Ativo") });
}
console.log(JSON.stringify(resultado, null, 2));
