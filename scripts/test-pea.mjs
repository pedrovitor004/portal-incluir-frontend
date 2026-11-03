import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { camposPea, prepararCadastroPea } = await server.ssrLoadModule('/src/services/cadastroPeaValidation.ts');
  const { getNavigation } = await server.ssrLoadModule('/src/config/navigation.ts');
  const { routes } = await server.ssrLoadModule('/src/config/routes.ts');
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const { adaptacoesPedagogicasService } = await server.ssrLoadModule('/src/services/adaptacoesPedagogicasService.ts');
  const usuario = { id: 91, perfilId: 12, perfil: 'PROFESSOR', nome: 'Docente', permissoes: ['pedagogico.editar', 'estudantes.consultar'] };
  const estudante = { id: 34, nomeCompleto: 'Estudante', matricula: '2026001', concluido: false };
  const conteudo = Object.fromEntries(camposPea.map(campo => [campo.name, ' Texto válido ']));
  const original = { ...conteudo };
  const request = prepararCadastroPea(conteudo, 34, [estudante], usuario);
  assert.equal(request.professorId, 12);
  assert.notEqual(request.professorId, usuario.id);
  assert.equal(request.estudanteId, 34);
  assert.equal('planoEducacionalId' in request, false);
  assert.deepEqual(conteudo, original, 'Preparação não deve apagar ou modificar o preenchimento');
  for (const campo of camposPea) {
    assert.equal(request[campo.name], 'Texto válido');
    assert.throws(() => prepararCadastroPea({ ...conteudo, [campo.name]: '   ' }, 34, [estudante], usuario));
    assert.throws(() => prepararCadastroPea({ ...conteudo, [campo.name]: 'a'.repeat(campo.limite + 1) }, 34, [estudante], usuario));
    assert.doesNotThrow(() => prepararCadastroPea({ ...conteudo, [campo.name]: 'a'.repeat(campo.limite) }, 34, [estudante], usuario));
  }
  assert.throws(() => prepararCadastroPea(conteudo, 99, [estudante], usuario));
  assert.throws(() => prepararCadastroPea(conteudo, 34, [{ ...estudante, concluido: true }], usuario));
  assert.throws(() => prepararCadastroPea(conteudo, 34, [estudante], null));
  assert.throws(() => prepararCadastroPea(conteudo, 34, [estudante], { ...usuario, perfil: 'COORDENADOR' }));
  assert.throws(() => prepararCadastroPea(conteudo, 34, [estudante], { ...usuario, perfilId: 0 }));
  assert.throws(() => prepararCadastroPea(conteudo, 34, [estudante], { ...usuario, permissoes: [] }));
  const menu = getNavigation(usuario).flatMap(item => item.children ?? []);
  assert.ok(menu.some(item => `/professor/${item.slug}` === routes.cadastroPeaProfessor));
  assert.equal(getNavigation({ ...usuario, permissoes: ['pedagogico.consultar'] }).flatMap(item => item.children ?? []).some(item => item.slug === 'adaptacoes'), false);

  let chamadas = 0;
  http.defaults.adapter = async config => {
    chamadas++;
    assert.equal(config.method, 'post');
    assert.equal(config.url, '/adaptacoes-pedagogicas');
    assert.equal(config.withCredentials, true);
    const body = JSON.parse(config.data);
    assert.deepEqual(body, request);
    assert.equal('planoEducacionalId' in body, false);
    return { data: { ...body, id: 78 }, status: 200, statusText: 'OK', headers: {}, config };
  };
  const resposta = await adaptacoesPedagogicasService.criar(request);
  assert.equal(chamadas, 1);
  assert.equal(resposta.estudanteId, 34);
  assert.equal(resposta.professorId, 12);
  assert.equal(resposta.id, 78);
  http.defaults.adapter = async () => { throw new Error('Falha simulada'); };
  await assert.rejects(adaptacoesPedagogicasService.criar(request), /Falha simulada/);
  assert.deepEqual(conteudo, original);
  console.log('PEA: validação de todos os campos, limites, sessão, estudante, permissões, menu e POST sem PEI verificados com API simulada.');
} finally {
  await server.close();
}
