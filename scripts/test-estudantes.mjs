import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { estudantesService } = await server.ssrLoadModule("/src/services/estudantesService.ts");
  const { montarEtapas, acompanhamentoEstudanteService } = await server.ssrLoadModule("/src/services/acompanhamentoEstudanteService.ts");
  const { acaoEstudantePermitida } = await server.ssrLoadModule("/src/config/estudantes.ts");
  const { http } = await server.ssrLoadModule("/src/services/http.ts");
  const estudante = { id: 7, nomeCompleto: "Estudante de teste", matricula: "0007", curso: "Curso", periodoIngresso: "2026.1", dataNascimento: "2000-01-01", possuiNecessidadeEspecifica: false };
  assert.equal(acaoEstudantePermitida({ status: "Ativo" }, "ativar"), false);
  assert.equal(acaoEstudantePermitida({ status: "Ativo" }, "inativar"), true);
  assert.equal(acaoEstudantePermitida({ status: "Inativo" }, "ativar"), true);
  for (const acao of ["ativar", "inativar", "concluir"]) assert.equal(acaoEstudantePermitida({ status: "Concluído" }, acao), false);
  const vazio = montarEtapas(estudante, [], []);
  assert.equal(vazio.find(e => e.id === "identificacao").estado, "registrado");
  assert.equal(vazio.find(e => e.id === "anamnese").estado, "revisar", "Cadastro existente não deve ser tratado como anamnese concluída");
  assert.equal(vazio.find(e => e.id === "plano").estado, "pendente");
  assert.equal(vazio.find(e => e.id === "pei").estado, "pendente");
  assert.equal(vazio.find(e => e.id === "rai").estado, "indisponivel");
  assert.equal(montarEtapas(estudante, null, null).find(e => e.id === "plano").estado, "indisponivel", "Falha de consulta não deve virar pendência confirmada");
  const plano = { estudanteId: 7, arquivado: false, status: "RASCUNHO" };
  assert.equal(montarEtapas(estudante, [plano], []).find(e => e.id === "plano").estado, "revisar");
  assert.equal(montarEtapas(estudante, [{ ...plano, status: "ASSINADO" }], []).find(e => e.id === "plano").estado, "registrado");
  assert.equal(montarEtapas(estudante, [{ ...plano, estudanteId: 8 }], []).find(e => e.id === "plano").estado, "pendente");
  assert.equal(montarEtapas(estudante, [], [{ ...plano, arquivado: true }]).find(e => e.id === "pei").estado, "pendente");
  const post = http.post, get = http.get;
  try {
    const chamadas = [];
    http.post = async (url, body) => { chamadas.push([url, body]); return { data: estudante }; };
    assert.equal((await estudantesService.ativar(7)).id, 7);
    await estudantesService.inativar(7);
    await estudantesService.concluir(7, "2026-10-21");
    assert.deepEqual(chamadas, [["/estudantes/7/ativar", undefined], ["/estudantes/7/inativar", undefined], ["/estudantes/7/concluir", { dataConclusao: "2026-10-21" }]]);
    http.get = async url => { if (url === "/estudantes/7") return { data: estudante }; if (url === "/planos-acao") throw new Error("Indisponível"); return { data: [] }; };
    const parcial = await acompanhamentoEstudanteService.consultar(7, new AbortController().signal);
    assert.equal(parcial.etapas.find(e => e.id === "plano").estado, "indisponivel");
    assert.equal(parcial.etapas.find(e => e.id === "pei").estado, "pendente");
    http.get = async () => { throw new Error("Falha no estudante"); };
    await assert.rejects(() => acompanhamentoEstudanteService.consultar(7, new AbortController().signal), /Falha no estudante/);
  } finally { http.post = post; http.get = get; }
  console.log("Estudantes: transições, rotas, data de conclusão, etapas, documentos arquivados e falhas parciais verificados com HTTP simulado.");
} finally { await server.close(); }
