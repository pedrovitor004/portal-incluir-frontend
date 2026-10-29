import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { unzipSync, strFromU8 } from 'fflate';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const originalFetch = globalThis.fetch;
try {
  globalThis.DOMParser = DOMParser;
  globalThis.XMLSerializer = XMLSerializer;
  const modelo = fs.readFileSync('src/assets/documentos/plano-acao-clai.docx');
  globalThis.fetch = async () => new Response(modelo);
  const { preencherModeloPlano, camposPlano } = await server.ssrLoadModule('/src/services/documentosEstudante/exportar.ts');
  const plano = {
    id: 7, estudanteId: 21, estudanteNome: 'Estudante de teste & exemplo', estudanteMatricula: 'TESTE-21', estudanteCurso: 'Curso de teste', estudantePeriodoIngresso: '2026.1', estudanteDataNascimento: '2005-02-03', estudanteTelefone: '00000000', estudanteEmail: 'estudante@example.invalid',
    periodoLetivo: '2026.2', nomeResponsavel: 'Responsável de teste', grauParentesco: 'Mãe', telefoneResponsavel: '1111111', emailResponsavel: 'responsavel@example.invalid', possuiComorbidade: false, comorbidades: '', usaMedicacaoContinua: true, medicacoes: 'Informação de teste', frequentaServicoApoio: false, servicosApoio: '', possuiDocumentosComprobatorios: true, documentosComprobatorios: 'Registro de teste', necessidadesEspecificas: 'Linha 1\nLinha 2 com <texto> & acentuação', consideracoes: 'Consideração de teste', avancosDificuldadesPotencialidades: 'Potencialidade de teste', principaisDemandas: 'Demanda de teste', propostasIntervencao: 'Proposta de teste',
  };
  const preenchido = await preencherModeloPlano(plano);
  const antes = unzipSync(modelo), depois = unzipSync(preenchido);
  assert.deepEqual(Object.keys(depois), Object.keys(antes), 'O pacote original deve ser preservado');
  for (const part of Object.keys(antes)) if (part !== 'word/document.xml') assert.deepEqual(depois[part], antes[part], `Parte preservada: ${part}`);
  const xml = new DOMParser().parseFromString(strFromU8(depois['word/document.xml']), 'application/xml');
  const texto = Array.from(xml.getElementsByTagName('w:t')).map(t => t.textContent).join('\n');
  for (const value of [plano.estudanteNome, plano.estudanteMatricula, plano.nomeResponsavel, plano.necessidadesEspecificas.split('\n')[1], plano.consideracoes, plano.avancosDificuldadesPotencialidades, plano.principaisDemandas, plano.propostasIntervencao]) assert.ok(texto.includes(value), `Campo preenchido: ${value}`);
  assert.ok(texto.includes('Assinatura do(a) coordenador(a) da COAPNE:'));
  assert.ok(texto.includes('Data: ____/____/_____.'));
  assert.ok(texto.includes('Não ( X )'), 'Respostas negativas preservadas');
  assert.ok(texto.includes('Sim ( X )'), 'Respostas positivas preenchidas');
  assert.equal(camposPlano(plano).find(c => c.titulo === 'Data de nascimento').valor, '03/02/2005');
  const { fluxoEstudanteService } = await server.ssrLoadModule('/src/services/fluxoEstudanteService.ts');
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const post = http.post;
  const calls = [];
  http.post = async (url, body) => { calls.push({ url, body }); return { data: { ...body.dados, id: body.planoId ?? 9 } }; };
  try {
    const first = await fluxoEstudanteService.salvarPlano(21, plano, null);
    await fluxoEstudanteService.salvarPlano(21, plano, first.id);
    assert.equal(calls[1].body.planoId, first.id, 'A retomada deve atualizar o mesmo plano');
    assert.ok(calls.every(c => c.url === '/estudantes/21/fluxo/plano'));
  } finally { http.post = post; }
  const { planoAcaoService } = await server.ssrLoadModule('/src/services/planoAcaoService.ts');
  const { mapearDocumento } = await server.ssrLoadModule('/src/services/documentosService.ts');
  const dataAssinatura = '2026-10-27T17:00:00';
  try {
    const chamadasAssinatura = [];
    http.post = async url => {
      chamadasAssinatura.push(url);
      return { data: { ...plano, status: 'ASSINADO', arquivado: false, dataAssinatura } };
    };
    const assinado = await planoAcaoService.assinar(plano.id);
    assert.deepEqual(chamadasAssinatura, ['/planos-acao/7/assinar']);
    assert.equal(assinado.status, 'ASSINADO');
    assert.equal(assinado.dataAssinatura, dataAssinatura);
    assert.equal(mapearDocumento(assinado, 'PLANO_ACAO').assinado, true, 'A assinatura deve ser reconhecida na consulta de documentos');
    const falha = new Error('Conclua os campos obrigatórios antes de assinar o plano');
    http.post = async () => { throw falha; };
    await assert.rejects(() => planoAcaoService.assinar(plano.id), erro => erro === falha, 'Falha na assinatura deve ser informada, sem simular conclusão');
  } finally { http.post = post; }
  fs.mkdirSync('tmp/pdfs/fluxo', { recursive: true });
  fs.writeFileSync('tmp/pdfs/fluxo/plano-teste.docx', preenchido);
  console.log('Fluxo: Anexo II, preservação do modelo, retomada de rascunho e registro de assinatura (sucesso e falha) verificados.');
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.DOMParser; delete globalThis.XMLSerializer;
  await server.close();
}
