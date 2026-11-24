import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const { novoRai }=await server.ssrLoadModule('/src/types/rai.ts');
 const { sugerirRai, atualizarImportados, periodoRaiInclui }=await server.ssrLoadModule('/src/services/documentosEstudante/raiModel.ts');
 const estudante={id:31,nomeCompleto:'Estudante teste',matricula:'RAI-31',curso:'Técnico Integrado em Informática',necessidadesEspecificas:['TDAH'],atendimentosCampus:['CUIDADOR'],condicoesAssociadas:['ANSIEDADE']};
 const contexto={estudante,planos:[{id:1,estudanteId:31,periodoLetivo:'2026.2',arquivado:false,necessidadesEspecificas:'NECESSIDADE_PLANO',principaisDemandas:'DEMANDA_PLANO',avancosDificuldadesPotencialidades:'AVANCO_PLANO',propostasIntervencao:'INTERVENCAO_PLANO',comorbidades:'SAUDE_PLANO'}],peis:[{id:2,estudanteId:31,semestreAno:'2026.2',arquivado:false,necessidadesEspecificas:'NECESSIDADE_PEI',dificuldadesApresentadas:'DIFICULDADE_PEI',conhecimentosHabilidadesInteresses:'HABILIDADE_PEI',propostasAdaptacoesCurriculares:'Recursos de comunicação e tempo adicional'}],adaptacoes:[{id:3,estudanteId:31,semestreAno:'2026.2',componenteCurricular:'Matemática',professorNome:'Docente teste',objetivoGeral:'OBJETIVO_PEA',objetivosEspecificos:'ESPECIFICO_PEA',conteudosProgramaticos:'CONTEUDO_PEA',metodologia:'Comunicação e recursos adaptados',avaliacao:'AVALIACAO_PEA',arquivado:false},{id:4,estudanteId:31,semestreAno:'2025.2',componenteCurricular:'Antigo',objetivoGeral:'FORA_DO_PERIODO'}],documentos:[],historico:[],falhas:{}};
 const r=sugerirRai(contexto,{anoLetivo:'2026',periodicidade:'BIMESTRAL',numeroPeriodo:'3'});
 assert.ok(r.deficiencia.includes('TDAH')&&r.deficiencia.includes('NECESSIDADE_PLANO')&&r.deficiencia.includes('NECESSIDADE_PEI'));
 assert.ok(r.aprendizagem.includes('DIFICULDADE_PEI')&&r.aprendizagem.includes('DEMANDA_PLANO'));assert.ok(r.saude.includes('SAUDE_PLANO'));
 assert.ok(r.competencias.includes('HABILIDADE_PEI')&&r.competencias.includes('AVANCO_PLANO'));assert.ok(r.objetivosGerais.includes('OBJETIVO_PEA'));
 assert.ok(!r.objetivosGerais.includes('FORA_DO_PERIODO'));assert.equal(r.professor,'Docente teste');assert.equal(r.local,'Monteiro');
 assert.deepEqual(new Set(r.adequacoes),new Set(['Conteúdos','Objetivos','Métodos','Recursos','Temporalidade','Avaliação']));assert.deepEqual(r.habilidades,{},'Não inferir desempenho a partir do planejamento');
 assert.ok(r.encaminhamentos.includes('INTERVENCAO_PLANO'));
 const manual={...r,competencias:'Avaliação revisada manualmente',adequacoes:['Recursos']};const novo={...r,competencias:'Nova fonte',objetivosGerais:'Objetivo atualizado',adequacoes:['Objetivos']};
 const mesclado=atualizarImportados(manual,r,novo);assert.equal(mesclado.competencias,manual.competencias);assert.deepEqual(mesclado.adequacoes,['Recursos']);assert.equal(mesclado.objetivosGerais,'Objetivo atualizado');
 assert.ok(periodoRaiInclui('2026.2',r));assert.ok(!periodoRaiInclui('2026.1',r));assert.ok(periodoRaiInclui('2026.1',{...r,periodicidade:'ANUAL'}));
 assert.throws(()=>sugerirRai({...contexto,falhas:{peis:'Falha'}},r),/fontes/);
 const { http }=await server.ssrLoadModule('/src/services/http.ts');const {raiService}=await server.ssrLoadModule('/src/services/raiService.ts');
 const get=http.get,post=http.post;try {
  const arquivo=new Blob(['modelo original'],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  http.get=async(url,opcoes)=>{assert.equal(url,'/rais/estudante/31/9/arquivo');assert.equal(opcoes.params.formato,'docx');assert.equal(opcoes.responseType,'blob');return {data:arquivo};};
  assert.equal(await raiService.arquivo(31,9,'docx'),arquivo);
  http.post=async(url,body)=>{assert.equal(url,'/rais/estudante/31/9/concluir');assert.deepEqual(body,{versao:2,revisado:true});return {data:{id:9,concluidoEm:'2026-11-17T10:00:00'}};};
  assert.ok((await raiService.concluir(31,{id:9,versao:2})).concluidoEm);
 }finally{http.get=get;http.post=post;}
 const {podeGerenciarFluxo}=await server.ssrLoadModule('/src/config/access.ts');assert.equal(podeGerenciarFluxo({perfil:'PROFESSOR',root:true}),false);assert.equal(podeGerenciarFluxo({perfil:'COORDENADOR'}),true);
 const {montarEtapas}=await server.ssrLoadModule('/src/services/acompanhamentoEstudanteService.ts');const etapas=montarEtapas(estudante,[],[],{anamneseStatus:'RASCUNHO',periodosConcluidos:[{anoLetivo:'2026',periodicidade:'BIMESTRAL',numeroPeriodo:'3'}]});assert.ok(etapas.every(e=>e.estado==='registrado'));assert.ok(etapas.every(e=>e.resumo.includes('2026')));
 const {detectarNovasOcorrencias}=await server.ssrLoadModule('/src/services/ocorrenciaAlertModel.ts');const antiga={id:1,etapa:'OCORRENCIA',lida:false};const inicial=detectarNovasOcorrencias(null,[antiga]);assert.deepEqual(inicial.novas,[]);
 const nova={id:2,etapa:'OCORRENCIA',lida:false};const lote=detectarNovasOcorrencias(inicial.ids,[antiga,nova,{id:3,etapa:'PEA',lida:false},{id:4,etapa:'OCORRENCIA',lida:true}]);assert.deepEqual(lote.novas,[nova]);assert.deepEqual(detectarNovasOcorrencias(lote.ids,[antiga,nova]).novas,[]);
 console.log('RAI: importação das quatro fontes, período, revisão preservada, Word/PDF via modelo, conclusão e bloqueio do professor. Alertas: entrada sem repetição, novas ocorrências e somente não lidas.');
}finally{await server.close();}
