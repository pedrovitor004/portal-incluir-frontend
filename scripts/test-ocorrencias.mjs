import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { ocorrenciasService, filtrarOcorrencias } = await server.ssrLoadModule('/src/services/ocorrenciasService.ts');
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const { getNavigation } = await server.ssrLoadModule('/src/config/navigation.ts');
  const { destinoNotificacao, nomesEtapas } = await server.ssrLoadModule('/src/services/notificacoesService.ts');
  const registros = [{ id: 1, estudanteNome: 'João', estudanteMatricula: '123', autorNome: 'Márcia', descricao: 'Dificuldade na atividade', ocorridaEm: '2026-01-10T09:00:00' },
    { id: 2, estudanteNome: 'Ana', estudanteMatricula: '456', autorNome: 'Pedro', descricao: 'Ausência informada', ocorridaEm: '2026-02-10T10:00:00' }];
  assert.deepEqual(filtrarOcorrencias(registros, 'joao', 'marcia').map(o => o.id), [1]);
  assert.deepEqual(filtrarOcorrencias(registros, '456', '').map(o => o.id), [2]);
  assert.equal(filtrarOcorrencias(registros, 'inexistente', '').length, 0);
  const dados = { estudanteId: 3, descricao: 'Registro de teste', ocorridaEm: '2026-01-10T09:00:00' };
  const anexo = new File(['Anexo'], 'relato.txt', { type: 'text/plain' });
  http.post = async (url, form) => {
    assert.equal(url, '/ocorrencias');
    assert.deepEqual(JSON.parse(await form.get('dados').text()), dados);
    assert.equal(form.get('arquivo').name, 'relato.txt');
    return { data: registros[0] };
  };
  assert.equal((await ocorrenciasService.registrar(dados, anexo)).id, 1);
  http.get = async (url, opcoes) => {
    assert.equal(url, '/ocorrencias/relatorio');
    assert.equal(opcoes.params.mes, '2026-01');
    return { data: registros };
  };
  assert.equal((await ocorrenciasService.listar({ mes: '2026-01' }, undefined, true)).length, 2);
  http.get = async () => ({ data: { total: 2 } });
  await assert.rejects(ocorrenciasService.listar(), /consultar/);
  const equipe = getNavigation('EQUIPE_MULTIDISCIPLINAR');
  assert.ok(equipe.some(i => i.slug === 'ocorrencias/nova'));
  assert.ok(equipe.some(i => i.slug === 'ocorrencias'));
  assert.equal(equipe.some(i => i.slug === 'relatorios' || i.slug === 'atendimentos'), false);
  assert.equal(equipe.some(i => i.section), false, 'Equipe possui menu direto, sem a seta de agrupamento');
  assert.ok(getNavigation('COORDENADOR').some(i => i.section === 'Equipe multidisciplinar'));
  assert.ok(getNavigation('PROFESSOR').some(i => i.slug === 'ocorrencias'));
  for (const perfil of ['PROFESSOR', 'COORDENADOR']) {
    assert.equal(getNavigation(perfil).some(i => i.slug === 'ocorrencias/nova'), false);
  }
  assert.equal(nomesEtapas.OCORRENCIA, 'Ocorrência');
  assert.equal(destinoNotificacao({ etapa: 'OCORRENCIA', ocorrenciaId: 17 }, 'PROFESSOR'), '/professor/ocorrencias?id=17');
  assert.equal(destinoNotificacao({ etapa: 'OCORRENCIA', ocorrenciaId: 17 }, 'COORDENADOR'), '/coordenador/ocorrencias?id=17');
  const { gerarPdfOcorrencias } = await server.ssrLoadModule('/src/services/exportarOcorrencias.ts');
  const pdf = gerarPdfOcorrencias([{ ...registros[0], descricao: 'Relato de acompanhamento. '.repeat(2000) + ' FIM_DO_RELATO', arquivoNome: 'foto.jpg' }, registros[1]], '2026-01', '', '');
  assert.ok(pdf.getNumberOfPages() > 1, 'Relatos extensos devem continuar em outras paginas');
  assert.ok(pdf.output().includes('FIM_DO_RELATO'), 'O PDF deve preservar o fim do relato');
  assert.ok(pdf.output().includes('456'), 'Todos os registros devem constar no PDF');
  console.log('Ocorrencias: envio com anexo, relatorio mensal, filtros, menu por perfil e destino dos alertas verificados.');
} finally {
  await server.close();
}
