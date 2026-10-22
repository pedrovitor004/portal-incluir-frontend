import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { perfilEstudanteService, pertenceAoEstudante } = await server.ssrLoadModule("/src/services/perfilEstudanteService.ts");
  const { montarLinhaDoTempo } = await server.ssrLoadModule("/src/services/linhaDoTempoEstudante.ts");
  const { http } = await server.ssrLoadModule("/src/services/http.ts");
  const { auditoriasService } = await server.ssrLoadModule("/src/services/auditoriasService.ts");
  const { respostaPerfil, listaPerfil } = await server.ssrLoadModule("/src/pages/coordenador/estudantes/profilePresentation.ts");
  const estudante = { id: 7, nomeCompleto: "Estudante de teste", matricula: "0007", curso: "Curso", possuiNecessidadeEspecifica: false };
  const plano = { id: 1, estudanteId: 7, estudanteNome: estudante.nomeCompleto, estudanteMatricula: "0007", estudanteCurso: "Curso", periodoLetivo: "2026.2", arquivado: false, status: "RASCUNHO", possuiComorbidade: false, dataCriacao: "2026-10-01T10:00:00" };
  const outroPlano = { ...plano, estudanteId: 8 };
  const auditoria = (tabela, identidade, antes, depois, operacao = "MOD") => ({ tabela, identidade, revisao: 100, data: "2026-10-21T12:00:00Z", operacao, detalhes: { anteriorDisponivel: true, antes, depois, camposAlterados: {} } });
  const historico = [
    auditoria("estudantes_aud", { id: 7 }, {}, {}),
    auditoria("estudantes_aud", { id: 8 }, {}, {}),
    auditoria("usuarios_aud", { id: 7 }, {}, {}),
    auditoria("adaptacoes_pedagogicas_aud", { id: 15 }, { estudante_id: 7, metodologia: "Anterior" }, null, "DEL"),
    auditoria("adaptacoes_pedagogicas_aud", { id: 7 }, { estudante_id: 8 }, { estudante_id: 8 }),
    auditoria("planos_acao_aud", { id: 1 }, null, { estudante_id: 7 }, "ADD"),
    auditoria("estudante_necessidades_aud", { estudante_id: 7, tipo: "TDAH" }, null, null),
  ];
  assert.equal(pertenceAoEstudante(historico[0], 7), true);
  assert.equal(pertenceAoEstudante(historico[2], 7), false, "ID igual em uma tabela sem vínculo não pertence ao estudante");
  assert.equal(pertenceAoEstudante(historico[3], 7), true, "Exclusões precisam usar o vínculo preservado no estado anterior");
  assert.equal(pertenceAoEstudante(historico[4], 7), false);
  assert.equal(pertenceAoEstudante(historico[6], 7), true);
  const get = http.get, listar = auditoriasService.listarHistorico;
  const signal = new AbortController().signal;
  try {
    const consulta = async (url, config) => {
      assert.equal(config.signal, signal);
      if (url === "/estudantes/7") return { data: estudante };
      if (url === "/planos-acao") return { data: [outroPlano, plano] };
      if (url === "/planos-educacionais/estudante/7") return { data: [plano, outroPlano] };
      if (url === "/adaptacoes-pedagogicas/estudante/7") return { data: [{ id: 15, estudanteId: 7, arquivado: true }, { id: 7, estudanteId: 8 }] };
      throw new Error("Consulta inesperada");
    };
    http.get = consulta;
    auditoriasService.listarHistorico = async () => ({ registros: historico, total: historico.length });
    const dados = await perfilEstudanteService.consultar(7, signal);
    assert.equal(dados.planos.length, 1);
    assert.equal(dados.documentos.length, 2);
    assert.notEqual(dados.documentos[0].chave, dados.documentos[1].chave);
    assert(dados.documentos.every(d => d.estudanteId === 7));
    assert.deepEqual(dados.adaptacoes.map(a => a.id), [15]);
    assert.equal(dados.adaptacoes[0].arquivado, true, "Registros arquivados devem continuar disponíveis");
    assert.equal(dados.historico.length, 4);
    assert(dados.historico.some(r => r.operacao === "DEL"));
    const linha = montarLinhaDoTempo(dados);
    assert(linha.some(e => e.destino.tipo === "alteracao" && e.destino.registro.operacao === "DEL"));
    assert(linha.some(e => e.destino.tipo === "documento" && e.destino.documento.tipo === "PEI"));
    assert(!linha.some(e => e.destino.tipo === "documento" && e.destino.documento.tipo === "PLANO_ACAO"), "O documento já representado no histórico não deve aparecer duplicado");
    assert(linha.every((e, i) => i === 0 || Date.parse(linha[i - 1].data) >= Date.parse(e.data)), "A linha do tempo deve apresentar os eventos mais recentes primeiro");
    const semHistorico = { ...dados, historico: [], falhas: { historico: "Consulta indisponível" } };
    const alternativas = montarLinhaDoTempo(semHistorico);
    assert(alternativas.some(e => e.destino.tipo === "documento"), "Datas reais dos documentos devem continuar disponíveis quando o histórico falha");
    assert(!alternativas.some(e => e.destino.tipo === "adaptacao"), "Não se deve inventar data para uma adaptação sem data informada");
    assert.equal(montarLinhaDoTempo({ ...semHistorico, documentos: [], adaptacoes: [], estudante: { ...estudante, dataConclusao: "2026-10-10" } })[0].titulo, "Acompanhamento concluído");
    http.get = async (url, config) => { if (url === "/planos-acao") throw new Error("Falha na consulta de planos"); return consulta(url, config); };
    auditoriasService.listarHistorico = async () => { throw new Error("Sessão expirada"); };
    const parcial = await perfilEstudanteService.consultar(7, signal);
    assert.equal(parcial.estudante.id, 7);
    assert.equal(parcial.documentos.length, 1);
    assert(parcial.falhas.planos && parcial.falhas.historico);
    assert.equal(parcial.adaptacoes.length, 1);
    http.get = async () => { throw new Error("Falha no estudante"); };
    await assert.rejects(() => perfilEstudanteService.consultar(7, signal), /Falha no estudante/);
    await assert.rejects(() => perfilEstudanteService.consultar(-1, signal), /estudante informado/);
  } finally { http.get = get; auditoriasService.listarHistorico = listar; }
  assert.equal(respostaPerfil(false), "Não"); assert.equal(respostaPerfil(null), "Não informado");
  assert.equal(listaPerfil(["TDAH"], [{ value: "TDAH", label: "TDAH" }]), "TDAH");
  console.log("Perfil: vínculo exclusivo do estudante, documentos, adaptações arquivadas, exclusões no histórico, falhas parciais e respostas negativas verificados.");
} finally { await server.close(); }
