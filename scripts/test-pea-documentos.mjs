import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const { adaptacoesPedagogicasService: service } = await server.ssrLoadModule('/src/services/adaptacoesPedagogicasService.ts');
  const { documentosService, mapearPea } = await server.ssrLoadModule('/src/services/documentosService.ts');
  const { camposPea, prepararEdicaoPea } = await server.ssrLoadModule('/src/services/cadastroPeaValidation.ts');
  const { tiposDocumento, tiposDocumentoPorPerfil } = await server.ssrLoadModule('/src/config/documentos.ts');
  const { AuthContext } = await server.ssrLoadModule('/src/contexts/AuthContext.ts');
  const { default: Actions } = await server.ssrLoadModule('/src/pages/coordenador/documentos/components/DocumentActions.tsx');
  const { default: Details } = await server.ssrLoadModule('/src/pages/coordenador/documentos/components/DocumentDetails.tsx');
  const usuario = { id: 91, perfilId: 12, perfil: 'PROFESSOR', nome: 'Docente', permissoes: ['documentos', 'pedagogico.editar'] };
  const estudante = { id: 34, concluido: false };
  const conteudo = Object.fromEntries(camposPea.map(campo => [campo.name, ' Texto válido ']));
  let pea = { ...conteudo, id: 78, estudanteId: 34, professorId: 12, estudanteNome: 'Estudante', estudanteMatricula: '2026001', estudanteCurso: 'Curso', professorNome: 'Docente', arquivado: false, dataCriacao: '2026-11-03T10:00:00', dataAtualizacao: null };
  assert.equal(tiposDocumentoPorPerfil(false), tiposDocumento, 'Outros perfis usam a configuração original');
  assert.deepEqual(tiposDocumento.map(c => c.tipo), ['TODOS', 'PEI', 'ANAMNESE', 'PLANO_ACAO', 'RAI']);
  assert.deepEqual(tiposDocumentoPorPerfil(true).map(c => c.tipo), ['TODOS', 'PEI', 'ANAMNESE', 'PLANO_ACAO', 'PEA']);
  const chamadas = [];
  let falhar = false;
  let vazio = false;
  let excluido = false;
  http.defaults.adapter = async config => {
    chamadas.push(`${config.method} ${config.url}`);
    if (config.url === '/planos-educacionais' || config.url === '/planos-acao') {
      return { data: [], status: 200, statusText: 'OK', headers: {}, config };
    }
    if (falhar) throw new Error('Falha de API simulada');
    if (config.method === 'get' && config.url === '/adaptacoes-pedagogicas/professor/12') {
      return { data: vazio || excluido ? [] : [pea, { ...pea, id: 79, professorId: 99 }], status: 200, statusText: 'OK', headers: {}, config };
    }
    if (config.method === 'post') {
      assert.ok(['/adaptacoes-pedagogicas/78/arquivar', '/adaptacoes-pedagogicas/78/desarquivar'].includes(config.url));
      pea = { ...pea, arquivado: config.url.endsWith('/arquivar') };
      return { data: pea, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (config.method === 'delete') {
      assert.equal(config.url, '/adaptacoes-pedagogicas/78');
      excluido = true;
      return { data: null, status: 204, statusText: 'No Content', headers: {}, config };
    }
    assert.equal(config.url, '/adaptacoes-pedagogicas/78');
    if (config.method === 'put') {
      const body = JSON.parse(config.data);
      assert.equal(body.estudanteId, 34);
      assert.equal(body.professorId, 12);
      assert.equal('planoEducacionalId' in body, false);
      assert.equal('id' in body, false);
      pea = { ...pea, ...body };
    } else assert.equal(config.method, 'get');
    return { data: pea, status: 200, statusText: 'OK', headers: {}, config };
  };
  const outros = await documentosService.listar();
  assert.deepEqual(outros.tiposDisponiveis, ['PEI', 'PLANO_ACAO']);
  assert.equal(chamadas.some(c => c.includes('adaptacoes')), false);
  const lista = await documentosService.listar(undefined, usuario.perfilId);
  assert.deepEqual(lista.documentos.map(d => d.id), [78]);
  assert.ok(lista.tiposDisponiveis.includes('PEA'));
  const original = await service.buscarPorId(78);
  const request = prepararEdicaoPea(conteudo, original, [estudante], usuario);
  for (const campo of camposPea) assert.equal(request[campo.name], conteudo[campo.name].trim());
  for (const alteracao of [{ professorId: 99 }, { arquivado: true }]) {
    assert.throws(() => prepararEdicaoPea(conteudo, { ...original, ...alteracao }, [estudante], usuario));
  }
  assert.throws(() => prepararEdicaoPea(conteudo, original, [estudante], { ...usuario, permissoes: [] }));
  assert.throws(() => prepararEdicaoPea(conteudo, original, [estudante], { ...usuario, perfil: 'COORDENADOR' }));
  assert.throws(() => prepararEdicaoPea(conteudo, original, [], usuario));
  await service.atualizar(original.id, request);
  assert.equal(chamadas.some(c => c.startsWith('post ')), false, 'Editar não deve criar outro PEA');
  const atualizado = await documentosService.listar(undefined, usuario.perfilId);
  assert.equal(atualizado.documentos[0].detalhes.find(d => d.titulo === 'Objetivo geral').valor, request.objetivoGeral);
  const doc = mapearPea(pea);
  const html = renderToStaticMarkup(React.createElement(Details, { documento: doc }));
  for (const campo of camposPea) assert.ok(html.includes(request[campo.name]));
  function renderActions(conta, documento = doc) {
    return renderToStaticMarkup(React.createElement(AuthContext.Provider, { value: { usuario: conta } }, React.createElement(Actions, { documento, onView() {}, onEdit() {}, onAction() {} })));
  }
  assert.equal((renderActions(usuario).match(/<button/g) ?? []).length, 4);
  assert.ok(renderActions(usuario).includes('title="Arquivar documento"'));
  assert.ok(renderActions(usuario, { ...doc, arquivado: true }).includes('title="Desarquivar documento"'));
  for (const conta of [{ ...usuario, perfilId: 99 }, { ...usuario, permissoes: [] }, { ...usuario, perfil: 'COORDENADOR' }, { ...usuario, perfil: 'ADMINISTRADOR' }, { ...usuario, perfil: 'EQUIPE_MULTIDISCIPLINAR' }]) {
    assert.equal((renderActions(conta).match(/<button/g) ?? []).length, 2, 'Outros perfis, outro autor ou falta de permissão não exibem ações PEA');
  }
  assert.equal((renderActions(usuario).match(/\sdisabled=""/g) ?? []).length, 0);
  for (const [conta, documento] of [[{ ...usuario, perfilId: 99 }, doc], [{ ...usuario, permissoes: [] }, doc], [usuario, { ...doc, arquivado: true }]]) {
    assert.equal((renderActions(conta, documento).match(/\sdisabled=""/g) ?? []).length, 1);
  }
  const antes = chamadas.length;
  for (const acao of ['arquivar', 'desarquivar', 'excluir']) await assert.rejects(documentosService.executar(doc, acao));
  assert.equal(chamadas.length, antes, 'Gerenciamento de PEA não pode chamar outro endpoint');
  for (const conta of [null, { ...usuario, perfilId: 99 }, { ...usuario, permissoes: ['documentos.gerenciar'] }, { ...usuario, perfil: 'COORDENADOR' }]) {
    for (const acao of ['arquivar', 'desarquivar', 'excluir']) await assert.rejects(documentosService.executar(doc, acao, conta));
  }
  assert.equal(chamadas.length, antes, 'Ações sem autoria ou permissão não enviam requisições');
  const arquivado = await documentosService.executar(doc, 'arquivar', usuario);
  assert.equal(arquivado.arquivado, true);
  assert.equal(arquivado.status, 'Arquivado');
  await assert.rejects(documentosService.executar(arquivado, 'arquivar', usuario));
  const ativo = await documentosService.executar(arquivado, 'desarquivar', usuario);
  assert.equal(ativo.arquivado, false);
  await assert.rejects(documentosService.executar(ativo, 'desarquivar', usuario));
  falhar = true;
  for (const acao of ['arquivar', 'excluir']) await assert.rejects(documentosService.executar(ativo, acao, usuario), /Falha de API simulada/);
  await assert.rejects(documentosService.executar(arquivado, 'desarquivar', usuario), /Falha de API simulada/);
  assert.equal(ativo.arquivado, false, 'Falha não deve alterar o objeto exibido');
  falhar = false;
  assert.equal(await documentosService.executar(arquivado, 'excluir', usuario), null);
  assert.equal((await documentosService.listar(undefined, usuario.perfilId)).documentos.length, 0);
  assert.ok(chamadas.includes('post /adaptacoes-pedagogicas/78/arquivar'));
  assert.ok(chamadas.includes('post /adaptacoes-pedagogicas/78/desarquivar'));
  assert.ok(chamadas.includes('delete /adaptacoes-pedagogicas/78'));
  vazio = true;
  const listaVazia = await documentosService.listar(undefined, usuario.perfilId);
  assert.equal(listaVazia.documentos.length, 0);
  assert.ok(listaVazia.tiposDisponiveis.includes('PEA'));
  vazio = false;
  falhar = true;
  await assert.rejects(service.atualizar(original.id, request));
  const parcial = await documentosService.listar(undefined, usuario.perfilId);
  assert.equal(parcial.falhas[0].tipo, 'PEA');
  assert.deepEqual(parcial.tiposDisponiveis, ['PEI', 'PLANO_ACAO']);
  assert.deepEqual(conteudo, Object.fromEntries(camposPea.map(campo => [campo.name, ' Texto válido '])));
  console.log('Documentos PEA: perfis, autoria, permissões, cadastro/edição, botões, arquivamento, desarquivamento, exclusão e erros verificados com API simulada.');
} finally {
  await server.close();
}
