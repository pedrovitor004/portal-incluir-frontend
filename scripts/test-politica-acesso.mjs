import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({server:{middlewareMode:true},appType:'custom'});
try {
  const { canAccess } = await server.ssrLoadModule('/src/config/access.ts');
  const { podeAnalisarAcesso } = await server.ssrLoadModule('/src/services/solicitacoesAcessoService.ts');
  const user={id:2,perfilId:5,nome:'Teste',email:'teste@example.invalid',perfil:'COORDENADOR',permissoes:[]};
  assert.equal(canAccess('COORDENADOR','auditorias'),false);
  assert.equal(canAccess({...user,root:true},'auditorias'),true);
  assert.equal(podeAnalisarAcesso({...user,permissoes:['usuarios.gerenciar']}),false);
  assert.equal(podeAnalisarAcesso({...user,root:true}),true);
  assert.equal(podeAnalisarAcesso({...user,root:false,administracaoAprovada:true,permissoes:['usuarios.gerenciar']}),true);
  assert.equal(podeAnalisarAcesso({...user,perfil:'PROFESSOR',root:false,administracaoAprovada:false,permissoes:['usuarios.gerenciar']}),false);
  console.log('Politica de acesso: root, coordenacao comum, aprovacao administrativa e compatibilidade verificados.');
} finally { await server.close(); }
