import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { documentosService, mapearDocumento } = await server.ssrLoadModule("/src/services/documentosService.ts");
  const { http } = await server.ssrLoadModule("/src/services/http.ts");
  const { formatarDataDocumento } = await server.ssrLoadModule("/src/config/documentos.ts");
  const plano = { id: 7, estudanteId: 2, estudanteNome: "Estudante de teste", estudanteMatricula: "0001", estudanteCurso: "Curso de teste", arquivado: false, possuiComorbidade: false };
  const pei = mapearDocumento(plano, "PEI");
  const assinado = mapearDocumento({ ...plano, status: "ASSINADO", arquivado: true }, "PLANO_ACAO");
  assert.notEqual(pei.chave, assinado.chave, "IDs iguais em entidades diferentes não devem colidir na tabela");
  assert.equal(assinado.assinado, true);
  assert.equal(assinado.status, "Arquivado · Assinado", "Arquivamento não deve esconder que o documento está assinado");
  assert.equal(pei.dataRegistro, null, "Uma data ausente não deve ser inventada");
  assert.equal(formatarDataDocumento(null), "Não informada");
  assert.equal(formatarDataDocumento("inválida"), "Não informada");
  assert.equal(pei.detalhes.find(d => d.titulo === "Possui comorbidade")?.valor, "Não", "Respostas negativas devem ser preservadas na visualização");

  const get = http.get;
  const del = http.delete;
  const post = http.post;
  try {
    http.get = async url => {
      if (url === "/planos-educacionais") return { data: [plano] };
      throw new Error("Fonte de planos indisponível");
    };
    const consulta = await documentosService.listar();
    assert.equal(consulta.documentos.length, 1, "Falha em uma fonte não deve apagar documentos carregados de outra");
    assert.deepEqual(consulta.tiposDisponiveis, ["PEI"]);
    assert.equal(consulta.falhas[0].tipo, "PLANO_ACAO");
    const { acaoPermitida } = await server.ssrLoadModule("/src/config/documentActions.ts");
    assert.equal(acaoPermitida(assinado, "excluir"), false);
    assert.equal(acaoPermitida(assinado, "desarquivar"), true);
    const chamadas = [];
    http.post = async url => { chamadas.push(url); return { data: { ...plano, arquivado: url.endsWith("/arquivar"), status: "RASCUNHO" } }; };
    assert.equal((await documentosService.executar(pei, "arquivar")).arquivado, true);
    assert.equal((await documentosService.executar({ ...pei, arquivado: true }, "desarquivar")).arquivado, false);
    assert.deepEqual(chamadas, ["/planos-educacionais/7/arquivar", "/planos-educacionais/7/desarquivar"]);
    await assert.rejects(() => documentosService.executar(pei, "assinar"));
    await assert.rejects(() => documentosService.executar(assinado, "assinar"));
    assert.equal(chamadas.length, 2, "Ações indisponíveis não devem chamar a API");
    http.post = async () => { throw new Error("Servidor indisponível"); };
    await assert.rejects(() => documentosService.executar(pei, "arquivar"), /Servidor indisponível/);
    let excluido;
    http.delete = async url => { excluido = url; };
    await documentosService.excluir(pei);
    assert.equal(excluido, "/planos-educacionais/7");
    excluido = undefined;
    await assert.rejects(() => documentosService.excluir({ ...pei, tipo: "RAI" }));
    assert.equal(excluido, undefined, "Um tipo sem integração não deve disparar exclusão para outro endpoint");
  } finally { http.get = get; http.delete = del; http.post = post; }
  console.log("Documentos: normalização, estados, consulta parcial e exclusão verificados com chamadas HTTP simuladas.");
} finally { await server.close(); }
