import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { auditoriasService } = await server.ssrLoadModule("/src/services/auditoriasService.ts");
  const { http } = await server.ssrLoadModule("/src/services/http.ts");
  const { areaAuditoria, valorAuditoria, operacoes } = await server.ssrLoadModule("/src/pages/coordenador/auditorias/auditPresentation.ts");
  const registros = Array.from({ length: 125 }, (_, id) => ({ tabela: "usuarios_aud", revisao: 200 - id, identidade: { id }, operacao: id === 124 ? "DEL" : "MOD", data: "2026-10-21T12:00:00Z", detalhes: { anteriorDisponivel: true, antes: { ativo: false }, depois: id === 124 ? null : { ativo: true }, camposAlterados: { ativo: { antes: false, depois: true } } } }));
  const original = http.get;
  const controller = new AbortController();
  try {
    const chamadas = [];
    http.get = async (url, config) => {
      assert.equal(url, "/auditorias");
      assert.equal(config.withCredentials, true);
      assert.equal(config.signal, controller.signal);
      chamadas.push(config.params.pagina);
      const inicio = config.params.pagina * config.params.tamanho;
      return { data: { registros: registros.slice(inicio, inicio + config.params.tamanho), total: registros.length } };
    };
    const consulta = await auditoriasService.listarHistorico(controller.signal);
    assert.deepEqual(chamadas, [0, 1]);
    assert.equal(consulta.registros.length, 125, "O histórico deve incluir as páginas seguintes para os filtros globais do AG Grid");
    assert.equal(consulta.registros.at(-1).operacao, "DEL", "Exclusões em páginas seguintes também devem chegar à tabela");
    assert.deepEqual(consulta.registros.at(-1).detalhes.antes, { ativo: false });
    assert.equal(consulta.registros.at(-1).detalhes.depois, null);
    http.get = async (_url, config) => {
      if (config.params.pagina > 0) throw new Error("Falha na segunda página");
      return { data: { registros: registros.slice(0, 100), total: 125 } };
    };
    await assert.rejects(() => auditoriasService.listarHistorico(controller.signal), /Falha na segunda página/, "Uma falha não deve apresentar indicadores parciais como totais do histórico");
    http.get = async () => ({ data: { registros: [registros[0], { ...registros[0], tabela: "estudantes_aud" }, registros[0]], total: 3 } });
    const iguais = await auditoriasService.listarHistorico(controller.signal);
    assert.equal(iguais.total, 2, "Identidades iguais de tabelas diferentes devem permanecer no histórico");
  } finally { http.get = original; }
  assert.equal(valorAuditoria(false), "Não");
  assert.equal(valorAuditoria(0), "0");
  assert.equal(valorAuditoria(null), "Sem valor");
  assert.equal(valorAuditoria(undefined), "Não registrado");
  assert.equal(operacoes.DEL, "Exclusão");
  assert.notEqual(areaAuditoria("usuarios_aud").icone, areaAuditoria("planos_acao_aud").icone);
  console.log("Auditorias: histórico completo, exclusões, falhas de paginação, identidades e valores verificados.");
} finally { await server.close(); }
