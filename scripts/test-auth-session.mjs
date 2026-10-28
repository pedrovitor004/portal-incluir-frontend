import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
const unauthorized=()=>({isAxiosError:true,response:{status:401,data:{message:'Sessão expirada'}}});
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r});return {promise,resolve}};
try {
 const {createAuthSession}=await server.ssrLoadModule('/src/services/authSession.ts');
 const user={id:2,perfilId:5,nome:'Teste',email:'teste@example.invalid',perfil:'COORDENADOR',permissoes:['estudantes.consultar']};
 let cached={...user,id:999,root:true};let meCalls=0;
 const pedido={id:8,tipo:'CADASTRO',status:'PENDENTE',email:user.email};
 const api={me:async()=>{meCalls++;return user;},login:async()=>user,register:async()=>pedido,logout:async()=>{}};
 const cache={read:()=>cached,save:u=>{cached=u;},clear:()=>{cached=null;}};
 const s=createAuthSession(api,cache);
 assert.equal(s.getSnapshot().usuario,null,'O cache local não pode autenticar a interface');
 assert.equal(s.getSnapshot().carregando,true);
 await s.refresh();assert.equal(s.getSnapshot().usuario.id,2,'A sessão deve ser restaurada pelo servidor, mesmo sem estado local válido');
 const antes=meCalls;assert.equal((await s.register({})).status,'PENDENTE');assert.equal(meCalls,antes);assert.equal(s.getSnapshot().usuario.id,2,'Solicitar cadastro não deve criar nem trocar uma sessão');
 api.login=async()=>{throw unauthorized();};await assert.rejects(()=>s.login({}));assert.equal(s.getSnapshot().usuario.id,2,'Credenciais inválidas não devem apagar a sessão já válida');
 api.logout=async()=>{throw Error('Rede indisponível');};await assert.rejects(()=>s.logout());assert.equal(s.getSnapshot().usuario.id,2,'Falha no logout não pode ser apresentada como saída concluída');
 api.logout=async()=>{};const late=deferred();api.me=()=>late.promise;const refresh=s.refresh();await s.logout();late.resolve(user);await refresh;assert.equal(s.getSnapshot().usuario,null,'Resposta atrasada não pode restaurar uma sessão encerrada');
 api.me=async()=>({...user,permissoes:['auditorias'],administracaoAprovada:true});await s.refresh();assert.deepEqual(s.getSnapshot().usuario.permissoes,['auditorias']);
 api.me=async()=>{throw unauthorized();};await s.refresh();assert.equal(s.getSnapshot().usuario,null);assert.equal(cached,null);
 api.login=async()=>user;await assert.rejects(()=>s.login({}));assert.equal(s.getSnapshot().usuario,null,'Login sem cookie reconhecido pelo servidor não deve liberar a interface');
 console.log('Sessão: restauração pelo servidor, cache não confiável, cadastro pendente, logout, expiração, resposta atrasada e permissões verificados.');
} finally {await server.close();}
