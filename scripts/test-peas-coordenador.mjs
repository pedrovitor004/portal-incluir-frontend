import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { createServer } from "vite";
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
let casos=0;
async function caso(nome, testar) { await testar(); casos++; console.log(`OK ${nome}`); }
try {
  const {adaptacoesPedagogicasService:api}=await server.ssrLoadModule("/src/services/adaptacoesPedagogicasService.ts");
  const {http}=await server.ssrLoadModule("/src/services/http.ts");
  const {default:Consulta,ListaPeasCoordenador:Lista}=await server.ssrLoadModule("/src/pages/coordenador/acompanhamento/ConsultaPeasCoordenador.tsx");
  const {default:Gestao}=await server.ssrLoadModule("/src/pages/coordenador/acompanhamento/GestaoAcompanhamentoPage.tsx");
  const {professoresComPeas,filtrarPeasCoordenador:filtrar}=await server.ssrLoadModule("/src/pages/coordenador/acompanhamento/presentation.ts");
  const {AuthContext}=await server.ssrLoadModule("/src/contexts/AuthContext.ts");
  const {camposPea}=await server.ssrLoadModule("/src/services/cadastroPeaValidation.ts");
  const {mapearPea}=await server.ssrLoadModule("/src/services/documentosService.ts");
  const {default:Details}=await server.ssrLoadModule("/src/pages/coordenador/documentos/components/DocumentDetails.tsx");
  const conteudo=Object.fromEntries(camposPea.map((c,i)=>[c.name,`Conteúdo completo ${i}`]));
  const pea={...conteudo,id:1,professorId:11,professorNome:"Ana",estudanteId:7,estudanteNome:"João",estudanteMatricula:"2026007",estudanteCurso:"Informática",arquivado:false,dataCriacao:"2026-11-03T10:00:00",dataAtualizacao:null};
  const registros=[pea,{...pea,id:2,professorId:22,arquivado:true,estudanteNome:"Maria",estudanteMatricula:"2026008"},{...pea,id:3,dataCriacao:null}];
  const usuario={id:42,perfilId:9,perfil:"COORDENADOR",permissoes:["pedagogico.consultar"]};
  const render=(componente,u=usuario)=>renderToStaticMarkup(React.createElement(MemoryRouter,{},React.createElement(AuthContext.Provider,{value:{usuario:u}},componente)));
  const lista=(dados,extra={})=>render(React.createElement(Lista,{dados,erro:"",carregando:false,recarregar(){},...extra}));
  const chamadas=[];let responder=()=>registros;
  http.defaults.adapter=async config=>{chamadas.push(config);return {data:await responder(config),status:200,statusText:"OK",headers:{},config};};
  await caso("consulta usa GET autorizado e inclui todos os documentos retornados sem inferir origem",async()=>{
    const signal=new AbortController().signal;
    assert.deepEqual(await api.listarTodos(signal),registros);
    assert.equal(chamadas.at(-1).method,"get");assert.equal(chamadas.at(-1).url,"/adaptacoes-pedagogicas");assert.equal(chamadas.at(-1).withCredentials,true);assert.equal(chamadas.at(-1).signal,signal);
    await api.listarPorProfessor(11);assert.equal(chamadas.at(-1).url,"/adaptacoes-pedagogicas/professor/11");
    responder=()=>pea;await api.buscarPorId(1);assert.equal(chamadas.at(-1).url,"/adaptacoes-pedagogicas/1");
    assert.equal(chamadas.every(c=>c.method==="get"),true);
  });
  await caso("professores homônimos são separados pelo ID e aparecem apenas se têm PEAs",()=>{
    assert.deepEqual(professoresComPeas(registros),[[11,"Ana"],[22,"Ana"]]);
    assert.deepEqual(filtrar(registros,"11","TODOS","").map(p=>p.id),[1,3]);
    assert.deepEqual(filtrar(registros,"22","TODOS","").map(p=>p.id),[2]);
    assert.deepEqual(filtrar(registros,"99","TODOS",""),[]);
    const html=lista(registros);assert.ok(html.includes('value="11"'));assert.ok(html.includes('value="22"'));assert.ok(html.includes("somente professores com PEAs disponíveis"));
    assert.deepEqual(registros.map(p=>p.id),[1,2,3]);
  });
  await caso("busca identifica estudante, matrícula, curso e estado do documento",()=>{
    assert.deepEqual(filtrar(registros,"","TODOS","JOAO").map(p=>p.id),[1,3]);
    assert.deepEqual(filtrar(registros,"","TODOS","2026008").map(p=>p.id),[2]);
    assert.equal(filtrar(registros,"","TODOS","informatica").length,3);
    assert.deepEqual(filtrar(registros,"","ARQUIVADO","").map(p=>p.id),[2]);
    assert.deepEqual(filtrar(registros,"","ATIVO","").map(p=>p.id),[1,3]);
    const html=lista(registros);for(const texto of ["João","Maria","2026007","Informática","Documento ativo","Documento arquivado"]) assert.ok(html.includes(texto),texto);
    for(const proibido of ["PEA espontâneo","PEA solicitado","Solicitação pendente","PEA entregue","Editar","Excluir",">Arquivar<"]) assert.equal(html.includes(proibido),false,proibido);
  });
  await caso("conteúdo completo reutiliza a apresentação de leitura com os nove campos",()=>{
    const html=render(React.createElement(Details,{documento:mapearPea(pea)}));
    for(const campo of camposPea) {assert.ok(html.includes(campo.label));assert.ok(html.includes(pea[campo.name]));}
    assert.ok(html.includes("João"));assert.ok(html.includes("Ana"));assert.equal(/<form|<input|<textarea|<button/.test(html),false);
  });
  await caso("carregamento, falha e resposta vazia são estados distintos sem dados antigos",()=>{
    const carregando=lista(registros,{carregando:true});assert.ok(carregando.includes("Carregando PEAs disponíveis"));assert.equal(carregando.includes("João"),false);assert.equal(carregando.includes("Nenhum PEA"),false);
    const erro=lista(registros,{erro:"Você não tem autorização para esta operação."});assert.ok(erro.includes('role="alert"'));assert.ok(erro.includes("Tentar novamente"));assert.equal(erro.includes("João"),false);assert.equal(erro.includes("Nenhum PEA"),false);
    assert.ok(lista([]).includes("Nenhum PEA disponível"));assert.equal(lista(null).includes("Nenhum PEA"),false);
  });
  await caso("403 e demais falhas não disparam endpoints alternativos nem operações de escrita",async()=>{
    for(const status of [401,403,404,500]) {
      const erro={isAxiosError:true,response:{status,data:{}}};responder=()=>{throw erro;};const antes=chamadas.length;
      await assert.rejects(api.listarTodos(),e=>e===erro);assert.equal(chamadas.length,antes+1);
    }
    const erro={isAxiosError:true,code:"ERR_NETWORK"};responder=()=>{throw erro;};await assert.rejects(api.listarTodos(),e=>e===erro);
    assert.equal(chamadas.every(c=>c.method==="get"),true);
  });
  await caso("permissão de consulta é exigida e demais visões permanecem independentes",()=>{
    for(const u of [null,{...usuario,permissoes:["pedagogico.editar"]},{...usuario,perfil:"PROFESSOR"}]) assert.ok(render(React.createElement(Consulta),u).includes("não tem autorização"));
    const html=render(React.createElement(Gestao,{visao:"adaptacoes"}));assert.ok(html.includes("Carregando PEAs disponíveis"));assert.equal(html.includes("Explorar demonstração"),false);
    for(const visao of ["conteudo","atendimentos"]) {const destino=Gestao({visao});assert.equal(destino.props.visao,visao);assert.notEqual(destino.type,Consulta);}
  });
  console.log(`${casos} cenários de PEAs da coordenação aprovados com API simulada; nenhuma conexão ao backend.`);
} finally {await server.close();}
