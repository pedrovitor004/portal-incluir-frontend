import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { dashboardService } = await server.ssrLoadModule('/src/services/dashboardService.ts');
  const { consultarIndicadores } = await server.ssrLoadModule('/src/services/dashboardIndicadoresService.ts');
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const estudantes = [{ id: 1, ativo: true }, { id: 2, ativo: false, dataConclusao: '2026-01-01' }, { id: 1, ativo: true }];
  let peis = [{ id: 1, coordenadorId: 7, arquivado: false }, { id: 2, coordenadorId: 7, arquivado: true }, { id: 3, coordenadorId: 8, arquivado: false }, { id: 1, coordenadorId: 7, arquivado: false }];
  let falha = '';
  let chamadas = [];
  http.get = async url => {
    chamadas.push(url);
    if (url === falha) throw new Error('Consulta indisponivel');
    const dados = {
      '/coordenadores/7/dashboard': { estudantesAtivos: 999, planosAtivos: 999, planosArquivados: 999, professoresAtivos: 4, estudantesRecentes: [] },
      '/estudantes': estudantes,
      '/ocorrencias': [{ id: 1, ocorridaEm: '2020-01-01T10:00:00', arquivoNome: 'foto.jpg' }],
      '/planos-educacionais': peis,
      '/adaptacoes-pedagogicas/professor/7': [{ id: 1, professorId: 7, arquivado: false }, { id: 2, professorId: 7, arquivado: true }, { id: 3, professorId: 8, arquivado: false }],
      '/conteudos-academicos': [{ id: 1, professorId: 7 }, { id: 2, professorId: 8 }],
    };
    assert.ok(url in dados, `Endpoint inesperado: ${url}`);
    return { data: dados[url] };
  };
  assert.deepEqual(await dashboardService.buscarCoordenador(7), { estudantesAtivos: 1, professoresAtivos: 4, planosAtivos: 1, planosArquivados: 1, estudantesRecentes: [] });
  peis = peis.map(p => ({ ...p, arquivado: true }));
  assert.equal((await dashboardService.buscarCoordenador(7)).planosAtivos, 0);
  assert.equal((await dashboardService.buscarCoordenador(7)).planosArquivados, 2);
  const professor = { id: 10, perfilId: 7, perfil: 'PROFESSOR' };
  const valores = respostas => respostas.map(r => r.status === 'fulfilled' ? r.value : null);
  assert.deepEqual(valores(await consultarIndicadores(professor)), [2, 0, 1, 1]);
  falha = '/conteudos-academicos';
  assert.deepEqual(valores(await consultarIndicadores(professor)), [2, 0, 1, null]);
  chamadas = [];
  assert.deepEqual(valores(await consultarIndicadores({ ...professor, permissoes: [] })), [null, null, null, null]);
  assert.equal(chamadas.length, 0);
  falha = '';
  chamadas = [];
  assert.deepEqual(valores(await consultarIndicadores({ ...professor, perfil: 'EQUIPE_MULTIDISCIPLINAR' })), [2, 0, 1, 1]);
  assert.equal(chamadas.length, 2, 'A equipe consulta estudantes e ocorrencias uma vez cada');
  falha = '/planos-educacionais';
  await assert.rejects(dashboardService.buscarCoordenador(7));
  console.log('Dashboard: autoria, duplicatas, ativos, arquivados, atualizacao, perfis, permissoes e falhas verificados.');
} finally {
  await server.close();
}
