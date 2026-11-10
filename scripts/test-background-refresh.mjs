import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const { dataConsultation } = await server.ssrLoadModule('/src/services/dataConsultation.ts');
  const { authService } = await server.ssrLoadModule('/src/services/authService.ts');
  const { notificacoesService } = await server.ssrLoadModule('/src/services/notificacoesService.ts');
  const { solicitacoesAcessoService } = await server.ssrLoadModule('/src/services/solicitacoesAcessoService.ts');
  const pendentes = [];
  http.defaults.adapter = config => new Promise(resolve => pendentes.push(() => resolve({ config, data: [], status: 200, statusText: 'OK', headers: {} })));
  let eventos = 0;
  const parar = dataConsultation.subscribe(() => { eventos++; });
  const consultas = [authService.me(), notificacoesService.listar(undefined, true), solicitacoesAcessoService.listar(false, undefined, true)];
  await setImmediate();
  assert.equal(pendentes.length, 3, 'Sessao e alertas continuam consultando o servidor');
  assert.equal(dataConsultation.getSnapshot(), false, 'Consultas automaticas nao exibem o carregamento global');
  assert.equal(eventos, 0);
  pendentes.splice(0).forEach(concluir => concluir());
  await Promise.all(consultas);
  assert.equal(eventos, 0, 'Concluir as consultas automaticas tambem nao altera o indicador');
  const manual = http.get('/estudantes');
  const silenciosa = notificacoesService.listar(undefined, true);
  await setImmediate();
  assert.equal(dataConsultation.getSnapshot(), true, 'Consultas normais continuam mostrando o indicador');
  pendentes.pop()(); await silenciosa;
  assert.equal(dataConsultation.getSnapshot(), true, 'Concluir uma consulta silenciosa nao encerra o carregamento manual');
  pendentes.pop()(); await manual;
  assert.equal(dataConsultation.getSnapshot(), false);
  http.defaults.adapter = async config => { throw { isAxiosError: true, config, message: 'Falha simulada' }; };
  await assert.rejects(http.get('/estudantes'));
  assert.equal(dataConsultation.getSnapshot(), false, 'Falhas nao deixam o indicador preso');
  parar();
  console.log('Atualizacao automatica: sessao e notificacoes silenciosas; carregamento manual, concorrencia e erros preservados.');
} finally { await server.close(); }
