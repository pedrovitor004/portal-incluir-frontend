import { readFile } from "node:fs/promises";
import ts from "typescript";
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
let casos = 0;
async function caso(nome, testar) { await testar(); casos++; console.log(`OK ${nome}`); }
try {
  const model = await server.ssrLoadModule('/src/services/solicitacaoPeaModel.ts');
  const { camposPea, prepararCadastroPea, prepararEdicaoPea } = await server.ssrLoadModule('/src/services/cadastroPeaValidation.ts');
  const { solicitacoesPeaService: api } = await server.ssrLoadModule('/src/services/solicitacoesPeaService.ts');
  const { adaptacoesPedagogicasService: espontaneo } = await server.ssrLoadModule('/src/services/adaptacoesPedagogicasService.ts');
  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const { default: Fields } = await server.ssrLoadModule('/src/components/pea/PeaFields.tsx');
  const { default: Card } = await server.ssrLoadModule('/src/components/pea/SolicitacaoPeaCard.tsx');
  const { default: State } = await server.ssrLoadModule('/src/components/pea/ConsultaPeaState.tsx');
  const { default: Lista } = await server.ssrLoadModule('/src/pages/professor/solicitacoes/SolicitacoesPeaProfessorPage.tsx');
  const { default: Resposta } = await server.ssrLoadModule('/src/pages/professor/solicitacoes/ResponderSolicitacaoPeaPage.tsx');
  const { default: PeiForm } = await server.ssrLoadModule("/src/pages/coordenador/estudantes/components/PeiForm.tsx");
  const { SelecaoDestinatariosPea, ResumoVinculosPea } = await server.ssrLoadModule("/src/pages/coordenador/estudantes/components/SolicitacoesPeaPanel.tsx");
  const { default: Panel } = await server.ssrLoadModule('/src/pages/coordenador/estudantes/components/SolicitacoesPeaPanel.tsx');
  const { AuthContext } = await server.ssrLoadModule('/src/contexts/AuthContext.ts');
  const { getNavigation } = await server.ssrLoadModule('/src/config/navigation.ts');
  const { routes } = await server.ssrLoadModule('/src/config/routes.ts');
  const professor = { id: 91, perfilId: 12, perfil: 'PROFESSOR', nome: 'Docente', permissoes: ['pedagogico.consultar', 'pedagogico.editar'] };
  const coord = { id: 42, perfilId: 9, perfil: 'COORDENADOR', permissoes: ['pei.editar', 'estudantes.consultar', 'pedagogico.consultar', 'estudantes.vincular'] };
  const conteudo = Object.fromEntries(camposPea.map(c => [c.name, ' Texto original ']));
  const elegiveis = [
    { professorId: 12, nome: 'Ana', setor: 'Ensino', disciplina: 'Matematica', cursosAtuacao: ['Curso'], vinculado: false, mesmoCurso: true },
    { professorId: 15, nome: 'Bruno', setor: '  ENSÍNO ', disciplina: null, cursosAtuacao: [], vinculado: true, mesmoCurso: false },
    { professorId: 19, nome: 'Carla', setor: 'Pesquisa', disciplina: null, cursosAtuacao: ['Curso'], vinculado: false, mesmoCurso: true },
  ];
  const solicitacao = {
    id: 7, versao: 0, estudante: { id: 34, nome: 'Estudante', matricula: '2026001', curso: 'Curso' },
    solicitanteUsuarioId: 42, solicitanteNome: 'Coordenação', contexto: '2026.2', orientacoes: 'Orientações de ensino', modalidade: 'PROFESSORES', setor: null,
    criadaEm: '2026-11-03T10:00:00', canceladaEm: null, motivoCancelamento: null, situacao: 'PENDENTE',
    destinatarios: [{ id: 51, professorId: 12, professorNome: 'Docente', setorNoEnvio: 'Ensino', situacao: 'PENDENTE', respondidaEm: null, canceladaEm: null, peaId: null }],
  };
  const pea = { ...conteudo, id: 78, estudanteId: 34, estudanteNome: 'Estudante', estudanteMatricula: '2026001', estudanteCurso: 'Curso', professorId: 12, professorNome: 'Docente', arquivado: false, dataCriacao: null, dataAtualizacao: null };
  const chamadas = [];
  let responder = () => solicitacao;
  http.defaults.adapter = async config => {
    chamadas.push(config);
    const data = await responder(config);
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
  const render = componente => renderToStaticMarkup(componente);
  const autenticado = (componente, usuario = professor) => render(React.createElement(MemoryRouter, {}, React.createElement(AuthContext.Provider, { value: { usuario } }, componente)));
  await caso('seleção individual, por setor normalizado e todos usa os elegíveis recebidos', () => {
    const dados = { modalidade: 'PROFESSORES', contexto: ' 2026.2 ', professorIds: [15,12,12], setor: 'ignorado' };
    const preparado = model.prepararSolicitacaoPea(dados, elegiveis, coord);
    assert.deepEqual(preparado.professorIds, [12,15]); assert.equal(preparado.contexto, '2026.2'); assert.equal('setor' in preparado, false);
    assert.deepEqual(model.previaDestinatariosPea(preparado, elegiveis).map(p => p.professorId), [12,15]);
    const setor = model.prepararSolicitacaoPea({ modalidade: 'SETOR', contexto: 'Periodo', setor: 'Ensino', professorIds: [19] }, elegiveis, coord);
    assert.equal('professorIds' in setor, false); assert.deepEqual(model.previaDestinatariosPea(setor,elegiveis).map(p => p.professorId),[12,15]);
    assert.equal(model.previaDestinatariosPea({ modalidade: 'TODOS' },elegiveis).length,3);
    assert.throws(() => model.prepararSolicitacaoPea({ ...dados, professorIds: [99] },elegiveis,coord));
    assert.throws(() => model.prepararSolicitacaoPea({ ...dados, professorIds: [] },elegiveis,coord));
    for (const alteracao of [{ contexto: ' ' },{ contexto: 'x'.repeat(151) },{ orientacoes: 'x'.repeat(2001) }]) assert.throws(() => model.prepararSolicitacaoPea({ ...dados,...alteracao },elegiveis,coord));
    assert.throws(() => model.prepararSolicitacaoPea({ modalidade: 'TODOS', contexto: 'Periodo' },[],coord));
  });
  await caso('chaves idempotentes são reutilizadas para conteúdo igual e mudam para outro conteúdo', async () => {
    let numero=0; const chave=model.criarChavesIdempotencia(() => `chave-${++numero}`);
    const request=model.prepararSolicitacaoPea({ modalidade:'PROFESSORES',contexto:'Periodo',professorIds:[12] },elegiveis,coord);
    responder = () => { throw new Error('Falha de rede simulada'); };
    await assert.rejects(api.criar(34,request,chave(request)));
    responder = () => solicitacao;
    await api.criar(34,{ ...request },chave({ ...request }));
    const a=chamadas.at(-2),b=chamadas.at(-1);
    assert.equal(a.headers.get('Idempotency-Key'),b.headers.get('Idempotency-Key'));
    assert.notEqual(chave(request),chave({ ...request,contexto:'Outro periodo' }));
    assert.equal(chave(request),'chave-1');
    assert.equal(b.url,'/estudantes/34/solicitacoes-pea');assert.equal(b.method,'post');assert.equal(b.withCredentials,true);
    assert.deepEqual(JSON.parse(b.data),JSON.parse(JSON.stringify(request)));
  });
  await caso('listagem, elegíveis filtrados, contexto e andamento seguem os endpoints reais', async () => {
    responder = config => config.url.endsWith('/elegiveis') ? elegiveis : config.url.endsWith('/contexto') || config.url.endsWith('/andamento') || config.url==='/solicitacoes-pea/7' ? solicitacao : [solicitacao];
    assert.deepEqual(await api.listar(34),[solicitacao]);assert.equal(chamadas.at(-1).url,'/estudantes/34/solicitacoes-pea');
    const signal=new AbortController().signal;
    await api.elegiveis(34,'Ensino',signal);assert.equal(chamadas.at(-1).params.setor,'Ensino');assert.equal(chamadas.at(-1).signal,signal);
    await api.detalhes(7);assert.equal(chamadas.at(-1).url,'/solicitacoes-pea/7');
    await api.contexto(7);assert.equal(chamadas.at(-1).url,'/solicitacoes-pea/7/contexto');
    await api.andamento(7);assert.equal(chamadas.at(-1).url,'/solicitacoes-pea/7/andamento');
    assert.deepEqual(await api.recebidas(),[solicitacao]);assert.equal(chamadas.at(-1).url,'/solicitacoes-pea/recebidas');
  });
  await caso('cancelamento envia a versão consultada e preserva conflito sem repetição automática', async () => {
    responder = () => ({ ...solicitacao,situacao:'CANCELADA',versao:1 });
    await api.cancelar(7,0,'Fim do periodo');assert.deepEqual(JSON.parse(chamadas.at(-1).data),{ versao:0,motivo:'Fim do periodo' });assert.equal(chamadas.at(-1).url,'/solicitacoes-pea/7/cancelar');
    const antes=chamadas.length;
    responder = () => { throw { isAxiosError:true,response:{ status:409,data:{ message:'Versão desatualizada' } } }; };
    await assert.rejects(api.cancelar(7,0,'Fim'));assert.equal(chamadas.length,antes+1);
  });
  await caso('professor sem vínculo ou permissão de estudante entrega somente os nove campos', async () => {
    const request=model.prepararEntregaPea({ ...conteudo,estudanteId:999,professorId:999,planoEducacionalId:999 },solicitacao,professor);
    assert.deepEqual(Object.keys(request).sort(),camposPea.map(c => c.name).sort());
    assert.equal(elegiveis[0].vinculado,false);assert.equal(professor.permissoes.includes('estudantes.consultar'),false);
    responder = () => pea;
    const antes=chamadas.length; await api.entregar(7,request,'entrega-1');
    assert.equal(chamadas.length,antes+1);const c=chamadas.at(-1);
    assert.equal(c.url,'/solicitacoes-pea/7/entregas');assert.equal(c.method,'post');assert.equal(c.headers.get('Idempotency-Key'),'entrega-1');assert.deepEqual(JSON.parse(c.data),request);
    assert.equal(chamadas.slice(antes).some(c => /estudantes|planos-educacionais|adaptacoes-pedagogicas/.test(c.url)),false);
    for(const campo of camposPea) { assert.throws(() => model.prepararEntregaPea({ ...conteudo,[campo.name]:' ' },solicitacao,professor));assert.throws(() => model.prepararEntregaPea({ ...conteudo,[campo.name]:'x'.repeat(campo.limite+1) },solicitacao,professor)); }
  });
  await caso('canceladas, entregues, outro autor e falta de permissão não habilitam entrega', () => {
    for(const situacao of ['CANCELADO','ENTREGUE']) assert.throws(() => model.prepararEntregaPea(conteudo,{ ...solicitacao,destinatarios:[{ ...solicitacao.destinatarios[0],situacao }] },professor));
    for(const usuario of [null,coord,{ ...professor,perfilId:99 },{ ...professor,permissoes:['pedagogico.consultar'] }]) assert.throws(() => model.prepararEntregaPea(conteudo,solicitacao,usuario));
  });
  await caso('andamento distingue estado agregado misto e estados individuais, sem link geral ao estudante', () => {
    const misto={ ...solicitacao,situacao:'PARCIALMENTE_ENTREGUE_CANCELADA',motivoCancelamento:'Encerramento',destinatarios:[{ ...solicitacao.destinatarios[0],situacao:'ENTREGUE',peaId:78 },{ ...solicitacao.destinatarios[0],id:52,professorId:15,situacao:'CANCELADO' }] };
    const html=render(React.createElement(Card,{ solicitacao:misto,onViewPea() {} }));
    for(const texto of ['Parcialmente entregue e cancelada','PEA entregue','Solicitação cancelada','Consultar PEA entregue','Orientações de ensino','Encerramento']) assert.ok(html.includes(texto),texto);
    assert.equal(html.includes('/estudantes/34'),false);
  });
  await caso('formulário compartilhado preserva nove campos, obrigatoriedade e limites', () => {
    const html=render(React.createElement(Fields,{ conteudo,onChange() {} }));
    assert.equal((html.match(/<input/g)??[]).length,2);assert.equal((html.match(/<textarea/g)??[]).length,7);assert.equal((html.match(/required=""/g)??[]).length,9);
    for(const c of camposPea) {assert.ok(html.includes(`name="${c.name}"`));assert.ok(html.includes(`maxLength="${c.limite}"`));}
  });
  await caso('cadastro espontâneo e edição mantêm identidades e endpoint próprios sem PEI', async () => {
    const comVinculo={ ...professor,permissoes:[...professor.permissoes,'estudantes.consultar'] }; const estudantes=[{ id:34,concluido:false }];
    const request=prepararCadastroPea(conteudo,34,estudantes,comVinculo);assert.equal(request.professorId,12);assert.equal('planoEducacionalId' in request,false);
    assert.throws(() => prepararCadastroPea(conteudo,34,[],comVinculo));
    responder=()=>pea;await espontaneo.criar(request);assert.equal(chamadas.at(-1).url,'/adaptacoes-pedagogicas');
    await espontaneo.atualizar(78,prepararEdicaoPea(conteudo,pea,estudantes,comVinculo));assert.equal(chamadas.at(-1).method,'put');assert.equal(chamadas.at(-1).url,'/adaptacoes-pedagogicas/78');
  });
  await caso('erros 400/401/403/404/409/410 e rede mantêm mensagens explícitas e propagação', async () => {
    for(const status of [400,401,403,404,409,410]) {
      const erro={ isAxiosError:true,response:{ status,data:{ message:'Detalhe do servidor' } } };
      assert.ok(model.mensagemErroSolicitacaoPea(erro).includes('Detalhe do servidor'));
      responder=()=>{throw erro;};await assert.rejects(api.recebidas());
    }
    assert.match(model.mensagemErroSolicitacaoPea({ isAxiosError:true }),/conectar/);
    assert.match(model.mensagemErroSolicitacaoPea({ isAxiosError:true,response:{ status:403,data:{} } }),/autorização/);
  });
  await caso('carregamento, erro e nova consulta são apresentados sem lista vazia prematura', () => {
    assert.ok(render(React.createElement(State,{ carregando:true,erro:'',onRetry() {} })).includes('Consultando solicitações'));
    const erro=render(React.createElement(State,{ carregando:false,erro:'Falha simulada',onRetry() {} }));assert.ok(erro.includes('role="alert"'));assert.ok(erro.includes('Tentar novamente'));
    const lista=autenticado(React.createElement(Lista));assert.ok(lista.includes('Consultando solicitações'));assert.equal(lista.includes('Nenhuma solicitação recebida'),false);
  });
  await caso('coordenação funciona sem PEI e rotas do professor não dependem de acesso ao estudante', () => {
    assert.ok(model.podeGerenciarSolicitacoes(coord));assert.equal(model.podeGerenciarSolicitacoes(professor),false);
    const painel=autenticado(React.createElement(Panel,{ estudanteId:34,somenteLeitura:false }),coord);assert.ok(painel.includes('mesmo sem PEI cadastrado'));
    const menu=getNavigation(professor);assert.ok(menu.some(i => i.slug==='documentos/solicitacoes-pea'));
    assert.equal(routes.solicitacoesPeaProfessor,'/professor/documentos/solicitacoes-pea');
    // Uma URL inválida não dispara consultas nem libera o perfil do estudante.
    assert.ok(autenticado(React.createElement(Resposta)).includes('Solicitação inválida'));
  });
  const renderSelecao = (dados, consulta) => render(React.createElement(SelecaoDestinatariosPea, { dados, consulta, onChange() {} }));
  const consultaOk = dados => ({ dados, carregando: false, erro: '', recarregar() {} });
  await caso('elegíveis carregados da API alimentam as três modalidades e os setores reais', async () => {
    responder = () => elegiveis;
    const recebidos = await api.elegiveis(34);
    assert.deepEqual(recebidos, elegiveis);
    const chamada = chamadas.at(-1);
    assert.equal(chamada.url, '/estudantes/34/solicitacoes-pea/elegiveis');
    assert.equal(chamada.withCredentials, true); assert.equal(chamada.params, undefined);
    const professores = renderSelecao({ modalidade: 'PROFESSORES', contexto: 'Periodo', professorIds: [12] }, consultaOk(recebidos));
    assert.equal((professores.match(/type="checkbox"/g) ?? []).length, 3);
    for (const p of recebidos) assert.ok(professores.includes(p.nome));
    assert.ok(professores.includes('Prévia: 1 destinatário(s)'));
    const todos = renderSelecao({ modalidade: 'TODOS', contexto: 'Periodo' }, consultaOk(recebidos));
    assert.ok(todos.includes('Prévia: 3 destinatário(s)')); assert.equal(todos.includes('type="checkbox"'), false);
    const setor = renderSelecao({ modalidade: 'SETOR', contexto: 'Periodo', setor: 'Ensino' }, consultaOk(recebidos));
    assert.ok(setor.includes('Prévia: 2 destinatário(s)')); assert.ok(setor.includes('Pesquisa'));
    // Três modalidades + setor vazio e dois setores distintos, com acentos/caixa agrupados.
    assert.equal((setor.match(/<option/g) ?? []).length, 6);
    assert.equal(professores.includes('Nenhum professor elegível disponível'), false);
  });
  await caso('resposta inválida não vira lista vazia nem descarta silenciosamente um professor', async () => {
    for (const resposta of [null, '', '<html>Erro</html>', {}, { content: elegiveis }, [null], [{}],
      [elegiveis[0], { ...elegiveis[1], setor: null }],
      [{ ...elegiveis[0], professorId: '12' }], [{ ...elegiveis[0], cursosAtuacao: 'Curso' }],
      [{ ...elegiveis[0], vinculado: 'true' }], [{ ...elegiveis[0], mesmoCurso: null }],
      [{ ...elegiveis[0], disciplina: undefined }]]) {
      responder = () => resposta;
      await assert.rejects(api.elegiveis(34), /Resposta inválida ao consultar professores elegíveis/);
    }
    const antes = chamadas.length;
    for (const id of [NaN, 0, -1, 1.5]) await assert.rejects(api.elegiveis(id), /Identificador do estudante inválido/);
    assert.equal(chamadas.length, antes);
    const erro = renderSelecao({ modalidade: 'TODOS' }, { ...consultaOk(null), erro: 'Resposta inválida ao consultar professores elegíveis.' });
    assert.ok(erro.includes('Resposta inválida')); assert.ok(erro.includes('role="alert"'));
    assert.equal(erro.includes('Nenhum professor elegível disponível'), false); assert.equal(erro.includes('Prévia:'), false);
  });
  await caso('carregamento, HTTP, rede e 200 vazio têm apresentações distintas no seletor', async () => {
    const dados = { modalidade: 'TODOS', contexto: 'Periodo' };
    const carregando = renderSelecao(dados, { ...consultaOk(elegiveis), carregando: true });
    assert.ok(carregando.includes('Carregando professores elegíveis'));
    assert.equal(carregando.includes('Nenhum professor elegível disponível'), false);
    assert.equal(carregando.includes('Ana'), false); assert.equal(carregando.includes('Prévia:'), false);
    for (const status of [400, 401, 403, 404, 409, 500]) {
      const falha = { isAxiosError: true, response: { status, data: { message: `Falha HTTP ${status}` } } };
      responder = () => { throw falha; };
      await assert.rejects(api.elegiveis(34), erro => erro === falha);
      const html = renderSelecao(dados, { ...consultaOk(null), erro: model.mensagemErroSolicitacaoPea(falha) });
      assert.ok(html.includes(`Falha HTTP ${status}`)); assert.ok(html.includes('Tentar novamente'));
      assert.equal(html.includes('Nenhum professor elegível disponível'), false); assert.equal(html.includes('Prévia:'), false);
    }
    const rede = { isAxiosError: true, code: 'ERR_NETWORK' };
    responder = () => { throw rede; }; await assert.rejects(api.elegiveis(34), erro => erro === rede);
    const htmlRede = renderSelecao(dados, { ...consultaOk(null), erro: model.mensagemErroSolicitacaoPea(rede) });
    assert.ok(htmlRede.includes('Não foi possível conectar')); assert.equal(htmlRede.includes('Nenhum professor elegível disponível'), false);
    responder = () => [];
    const vazio = renderSelecao(dados, consultaOk(await api.elegiveis(34)));
    assert.ok(vazio.includes('Nenhum professor elegível disponível')); assert.ok(vazio.includes('Prévia: 0 destinatário(s)'));
    assert.equal(vazio.includes('role="alert"'), false);
    assert.equal(renderSelecao(dados, consultaOk(null)).includes('Nenhum professor elegível disponível'), false);
  });
  await caso('PEI contém campos, solicitações fora do formulário e ações únicas com submissão associada', async () => {
    const caminho = 'src/pages/coordenador/estudantes/EtapaDocumentoPage.tsx';
    const fonte = ts.createSourceFile(caminho, await readFile(caminho,'utf8'), ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    const elementos=[];let painel;
    function visitar(node) {
      if(ts.isJsxSelfClosingElement(node) && node.tagName.getText(fonte)==='PeiForm') elementos.push(node);
      if(ts.isVariableDeclaration(node) && node.name.getText(fonte)==='painelSolicitacoes') painel=node;
      ts.forEachChild(node,visitar);
    }
    visitar(fonte);
    assert.equal(elementos.length,1);assert.ok(painel);
    const area=elementos[0].attributes.properties.find(p=>p.name?.getText(fonte)==='areaSolicitacoes');
    assert.equal(area.initializer.expression.getText(fonte),'painelSolicitacoes');
    assert.equal(/documentos|peiId|formularioAberto/.test(painel.initializer.getText(fonte)),false);
    assert.ok(fonte.text.includes('!exibirFormularioPei && painelSolicitacoes'),'Painel independente do formulário e de PEI salvo');
    const slot=React.createElement('section',{'data-testid':'solicitacoes'},React.createElement('form',{id:'solicitacao'},React.createElement('button',{type:'submit'},'Enviar solicitação')));
    const html=autenticado(React.createElement(PeiForm,{estudante:{id:34,nomeCompleto:'Estudante',matricula:'2026001',concluido:false},peiId:null,areaSolicitacoes:slot,onSaved(){},onCancel(){},onBusyChange(){} }),coord);
    assert.ok(html.indexOf('Novo PEI')<html.indexOf('name="semestreAno"'));
    assert.ok(html.indexOf('name="propostasAdaptacoesCurriculares"')<html.indexOf('data-testid="solicitacoes"'));
    assert.ok(html.indexOf('</form>')<html.indexOf('data-testid="solicitacoes"'),'A solicitação não fica aninhada no form PEI');
    assert.ok(html.indexOf('data-testid="solicitacoes"')<html.indexOf('Voltar à consulta'));
    assert.ok(html.indexOf('data-testid="solicitacoes"')<html.indexOf('Salvar PEI'));
    assert.equal((html.match(/>Voltar à consulta<\/button>/g)??[]).length,1);
    assert.equal((html.match(/>Salvar PEI<\/button>/g)??[]).length,1);
    const formId=/<form id="([^"]+)"/.exec(html)[1];
    assert.equal(/<button[^>]*form="([^"]+)"[^>]*>Salvar PEI/.exec(html)[1],formId);
    assert.equal((html.match(/<form /g)??[]).length,2);
  });
  await caso('vínculo automático exige permissão e remove a opção e o motivo do contrato novo', async () => {
    const dados={modalidade:'PROFESSORES',contexto:'Periodo',professorIds:[12]};
    const request=model.prepararSolicitacaoPea({...dados,criarVinculoAcompanhamento:false,motivoVinculo:'Ignorado'},elegiveis,coord);
    assert.equal('criarVinculoAcompanhamento' in request,false);assert.equal('motivoVinculo' in request,false);
    const semVincular={...coord,permissoes:coord.permissoes.filter(p=>p!=='estudantes.vincular')};
    for(const usuario of [semVincular,professor,null]) assert.throws(()=>model.prepararSolicitacaoPea(dados,elegiveis,usuario));
    assert.equal(model.podeGerenciarSolicitacoes(semVincular),true);assert.equal(model.podeCriarSolicitacaoPea(semVincular),false);
    responder=()=>solicitacao;await api.criar(34,request,'automatico');
    const body=JSON.parse(chamadas.at(-1).data);assert.equal('motivoVinculo' in body,false);assert.equal('criarVinculoAcompanhamento' in body,false);
    const html=renderSelecao({...dados,modalidade:'TODOS'},consultaOk(elegiveis));
    assert.ok(html.includes('automaticamente vínculo'));assert.ok(html.includes('sem conceder novas permissões'));
    assert.ok(html.includes('cancelar a solicitação não encerra'));assert.equal(html.includes('type="checkbox"'),false);assert.equal(html.includes('Motivo do vínculo'),false);
  });
  await caso('modo solicitado fixa a operação e rejeita identificação inválida ou combinada antes de carregar', async () => {
    const {default:Cadastro}=await server.ssrLoadModule('/src/pages/professor/adaptacoes/CadastroPeaPage.tsx');
    assert.deepEqual(model.modoCadastroPea(new URLSearchParams()),{peaId:null,solicitacaoId:null});
    assert.deepEqual(model.modoCadastroPea(new URLSearchParams('solicitacaoId=7')),{peaId:null,solicitacaoId:'7'});
    assert.deepEqual(model.modoCadastroPea(new URLSearchParams('peaId=78')),{peaId:'78',solicitacaoId:null});
    for(const query of ['peaId=78&solicitacaoId=7','peaId=&solicitacaoId=7','solicitacaoId=0','solicitacaoId=-1','solicitacaoId=1.2','solicitacaoId=abc','solicitacaoId=9007199254740992','peaId=']) {
      assert.throws(()=>model.modoCadastroPea(new URLSearchParams(query)));
      const html=render(React.createElement(MemoryRouter,{initialEntries:[`/professor/adaptacoes?${query}`]},React.createElement(AuthContext.Provider,{value:{usuario:professor}},React.createElement(Cadastro))));
      assert.ok(html.includes('role="alert"'));assert.equal(html.includes('<form'),false);
    }
    const solicitado=render(React.createElement(MemoryRouter,{initialEntries:['/professor/adaptacoes?solicitacaoId=7']},React.createElement(AuthContext.Provider,{value:{usuario:professor}},React.createElement(Cadastro))));
    assert.ok(solicitado.includes('Preencher PEA solicitado'));assert.ok(solicitado.includes('Carregando solicitação'));
    assert.equal((solicitado.match(/<form/g)??[]).length,1);assert.equal((solicitado.match(/<textarea/g)??[]).length,7);
    assert.ok(/<select[^>]*id="pea-estudante"[^>]*disabled/.test(solicitado));
  });
  await caso('consulta histórica usa estudante e professor autenticado e nunca faz entrega', async () => {
    responder=()=>[pea];const antes=chamadas.length;const signal=new AbortController().signal;
    assert.deepEqual(await espontaneo.listarPorEstudanteEProfessor(34,12,signal),[pea]);
    assert.equal(chamadas.length,antes+1);const chamada=chamadas.at(-1);
    assert.equal(chamada.method,'get');assert.equal(chamada.url,'/adaptacoes-pedagogicas/estudante/34/professor/12');assert.equal(chamada.signal,signal);
    for(const ids of [[0,12],[34,0],[NaN,12]]) await assert.rejects(espontaneo.listarPorEstudanteEProfessor(...ids));
    assert.equal(chamadas.length,antes+1);
    responder=()=>{throw {isAxiosError:true,response:{status:403,data:{}}};};await assert.rejects(espontaneo.listarPorEstudanteEProfessor(34,12));
    assert.equal(chamadas.slice(antes).every(c=>c.method==='get'),true);
  });
  await caso('tentativas de entrega preservam a chave e documento antigo não integra o payload', async () => {
    const request=model.prepararEntregaPea({...conteudo,peaId:78,id:78},solicitacao,professor);
    let n=0;const chave=model.criarChavesIdempotencia(()=>`entrega-${++n}`);const antes=chamadas.length;
    responder=()=>{throw {isAxiosError:true,code:'ERR_NETWORK'};};await assert.rejects(api.entregar(7,request,chave(request)));
    responder=()=>({...pea,id:79});const entregue=await api.entregar(7,{...request},chave({...request}));assert.equal(entregue.id,79);
    const [a,b]=chamadas.slice(antes);assert.equal(a.headers.get('Idempotency-Key'),b.headers.get('Idempotency-Key'));
    assert.equal('peaId' in JSON.parse(b.data),false);assert.equal('id' in JSON.parse(b.data),false);
    assert.notEqual(chave(request),chave({...request,metodologia:'Outro conteúdo'}));
    assert.equal(chamadas.slice(antes).every(c=>c.url==='/solicitacoes-pea/7/entregas'),true);
  });
  await caso('SETOR e TODOS incluem docentes de outro curso e informam contagem da última consulta sem inventar divisão', () => {
    const institucionais=elegiveis.map((p,i)=>({...p,vinculado:i===1,mesmoCurso:false,cursosAtuacao:['Outro curso']}));
    for(const modalidade of ['TODOS','SETOR']) {
      const dados={modalidade,contexto:'Periodo',setor:modalidade==='SETOR'?'Ensino':undefined};
      const selecionados=model.previaDestinatariosPea(dados,institucionais);
      assert.equal(selecionados.length,modalidade==='TODOS'?3:2);
      const html=render(React.createElement(ResumoVinculosPea,{destinatarios:selecionados}));
      assert.ok(html.includes(`${selecionados.length} professor(es) contemplado(s)`));
      assert.ok(html.includes(`${selecionados.length-1} vínculo(s) a criar ou reativar`));
      assert.ok(html.includes('1 vínculo(s) ativo(s) a preservar'));
      assert.ok(html.includes('Na última consulta'));assert.ok(html.includes('quantidade final não pode ser garantida'));
      assert.ok(html.includes('não distinguem novos vínculos de reativações'));
    }
  });
  console.log(`${casos} cenários de solicitações de PEA aprovados com API simulada; nenhuma conexão ao backend.`);
} finally { await server.close(); }
