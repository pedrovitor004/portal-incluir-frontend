import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { camposPei, prepararPei, exigirEdicaoPei } = await server.ssrLoadModule('/src/services/planoEducacionalValidation.ts');
  const { planoEducacionalService: service } = await server.ssrLoadModule('/src/services/planoEducacionalService.ts');
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const usuario = { id: 91, perfilId: 12, perfil: 'COORDENADOR', permissoes: ['pei.editar'] };
  const estudante = { id: 34, concluido: false };
  const conteudo = Object.fromEntries(camposPei.map(campo => [campo.name, ' Texto válido ']));
  const original = { ...conteudo, id: 78, estudanteId: 34, coordenadorId: 23, arquivado: false, adaptacoesPedagogicas: [] };
  const novo = prepararPei(conteudo, estudante, usuario);
  const edicao = prepararPei(conteudo, estudante, usuario, original);
  assert.equal(novo.coordenadorId, usuario.perfilId);
  assert.notEqual(novo.coordenadorId, usuario.id);
  assert.equal(edicao.coordenadorId, original.coordenadorId);
  assert.equal(edicao.estudanteId, original.estudanteId);
  assert.equal('adaptacoesPedagogicas' in edicao, false);
  for (const campo of camposPei) {
    assert.equal(novo[campo.name], 'Texto válido');
    assert.throws(() => prepararPei({ ...conteudo, [campo.name]: '   ' }, estudante, usuario));
    assert.throws(() => prepararPei({ ...conteudo, [campo.name]: 'a'.repeat(campo.limite + 1) }, estudante, usuario));
    assert.doesNotThrow(() => prepararPei({ ...conteudo, [campo.name]: 'a'.repeat(campo.limite) }, estudante, usuario));
  }
  for (const conta of [null, { ...usuario, perfil: 'PROFESSOR' }, { ...usuario, perfil: 'ADMINISTRADOR' }, { ...usuario, perfil: 'EQUIPE_MULTIDISCIPLINAR' }, { ...usuario, permissoes: [] }, { ...usuario, perfilId: 0 }]) {
    assert.throws(() => prepararPei(conteudo, estudante, conta));
  }
  assert.throws(() => prepararPei(conteudo, { ...estudante, concluido: true }, usuario));
  assert.throws(() => exigirEdicaoPei({ ...original, arquivado: true }, estudante.id));
  assert.throws(() => exigirEdicaoPei(original, 99));
  const chamadas = [];
  http.defaults.adapter = async config => {
    chamadas.push(`${config.method} ${config.url}`);
    if (config.method === 'get') {
      const data = config.url === '/planos-educacionais/estudante/34'
        ? [original, { ...original, id: 79 }] : original;
      return { data, status: 200, statusText: 'OK', headers: {}, config };
    }
    const body = JSON.parse(config.data);
    assert.deepEqual(body, config.method === 'post' ? novo : edicao);
    return { data: { ...original, ...body }, status: 200, statusText: 'OK', headers: {}, config };
  };
  assert.equal((await service.listarPorEstudante(34)).length, 2);
  assert.equal((await service.buscarPorId(78)).id, 78);
  await service.criar(novo);
  await service.atualizar(78, edicao);
  assert.deepEqual(chamadas, [
    'get /planos-educacionais/estudante/34', 'get /planos-educacionais/78',
    'post /planos-educacionais', 'put /planos-educacionais/78',
  ]);
  const snapshot = { ...conteudo };
  http.defaults.adapter = async () => { throw new Error('Falha simulada'); };
  await assert.rejects(service.atualizar(78, edicao), /Falha simulada/);
  assert.deepEqual(conteudo, snapshot);
  const {default:PeiForm}=await server.ssrLoadModule('/src/pages/coordenador/estudantes/components/PeiForm.tsx');
  const {AuthContext}=await server.ssrLoadModule('/src/contexts/AuthContext.ts');
  const html=renderToStaticMarkup(React.createElement(AuthContext.Provider,{value:{usuario}},React.createElement(PeiForm,{estudante:{...estudante,nomeCompleto:'Estudante',matricula:'2026001'},peiId:null,areaSolicitacoes:React.createElement('aside',{'data-area':'solicitacoes'},'Solicitações de PEA'),onSaved(){},onCancel(){},onBusyChange(){}})));
  const formId=/<form id="([^"]+)"/.exec(html)[1];
  assert.equal(/<button[^>]*form="([^"]+)"[^>]*>Salvar PEI/.exec(html)[1],formId);
  assert.equal((html.match(/<form /g)??[]).length,1);
  assert.equal((html.match(/required=""/g)??[]).length,camposPei.length);
  assert.equal(/novalidate/i.test(html),false);
  assert.ok(html.indexOf('</form>')<html.indexOf('data-area="solicitacoes"'));
  assert.ok(html.indexOf('data-area="solicitacoes"')<html.indexOf('Salvar PEI'));
  console.log('PEI: campos, limites, permissões, IDs, múltiplos registros e contratos GET/POST/PUT verificados com API simulada.');
} finally {
  await server.close();
}
