import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { pendenciasAnamnese, pendenciasPlano, permissoesEtapa } = await server.ssrLoadModule('/src/services/fluxoEstudanteValidation.ts');
  assert.ok(pendenciasAnamnese({}).includes('Nome completo'));
  const cadastro = { nomeCompleto: 'Teste', dataNascimento: '2005-02-03', curso: 'Curso', matricula: '1', periodoIngresso: '2026.1', possuiNecessidadeEspecifica: false };
  assert.deepEqual(pendenciasAnamnese(cadastro), [], 'Uma resposta negativa é válida para concluir a anamnese');
  assert.deepEqual(pendenciasAnamnese({ ...cadastro, possuiNecessidadeEspecifica: null }), ['Informar se possui necessidade específica']);
  const plano = Object.fromEntries(['periodoLetivo','nomeResponsavel','grauParentesco','telefoneResponsavel','emailResponsavel','necessidadesEspecificas','consideracoes','avancosDificuldadesPotencialidades','principaisDemandas','propostasIntervencao'].map(c => [c,'Preenchido']));
  assert.deepEqual(pendenciasPlano(plano), []);
  assert.deepEqual(pendenciasPlano({ ...plano, possuiComorbidade: true, comorbidades: '  ' }), ['Descrição das comorbidades']);
  assert.ok(permissoesEtapa.ANAMNESE.includes('anamnese'));
  assert.ok(permissoesEtapa.PEI.includes('pei.editar'));
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const { fluxoEstudanteService } = await server.ssrLoadModule('/src/services/fluxoEstudanteService.ts');
  const { notificacoesService, destinoNotificacao } = await server.ssrLoadModule('/src/services/notificacoesService.ts');
  const put = http.put, get = http.get, patch = http.patch;
  try {
    let atribuicao;
    http.put = async (url, body) => { atribuicao = { url, body }; return { data: { estudanteId: 21, anamneseStatus: 'RASCUNHO' } }; };
    const fluxo = await fluxoEstudanteService.atribuir(21, 'PLANO_ACAO', 8, 'Finalize o plano', 7);
    assert.equal(fluxo.anamneseStatus, 'RASCUNHO', 'Delegar não deve concluir a etapa');
    assert.deepEqual(atribuicao, { url: '/estudantes/21/fluxo/responsaveis/PLANO_ACAO', body: { usuarioId: 8, mensagem: 'Finalize o plano', planoId: 7 } });
    const aviso = { id: 1, etapa: 'PLANO_ACAO', estudanteId: 21, planoId: 7, lida: false };
    http.get = async url => { assert.equal(url, '/notificacoes'); return { data: [aviso] }; };
    assert.equal((await notificacoesService.listar())[0].lida, false);
    http.patch = async url => { assert.equal(url, '/notificacoes/1/lida'); return { data: { ...aviso, lida: true } }; };
    assert.equal((await notificacoesService.ler(1)).lida, true);
    assert.equal(destinoNotificacao(aviso, 'PROFESSOR'), '/professor/plano-acao?estudanteId=21&planoId=7');
    assert.equal(destinoNotificacao({ ...aviso, etapa: 'ANAMNESE' }, 'EQUIPE_MULTIDISCIPLINAR'), '/equipe/anamnese?estudanteId=21');
    http.put = async () => { throw new Error('Conceda primeiro as permissões'); };
    await assert.rejects(() => fluxoEstudanteService.atribuir(21, 'PEI', 8, 'Conclua o PEI'), /permissões/);
  } finally { http.put = put; http.get = get; http.patch = patch; }
  console.log('Encaminhamento: pendências, respostas negativas, permissões, mensagem, links e leitura de notificações verificados.');
} finally { await server.close(); }
