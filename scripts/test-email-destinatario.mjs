import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {destinatariosEmail,templateEmailAcompanhamento,emailEstudanteService}=await vite.ssrLoadModule('/src/services/emailEstudanteService.ts');
 const lista=destinatariosEmail('Aluno','aluno@example.test','Responsável','responsavel@example.test');
 assert.deepEqual(lista.map(d=>[d.tipo,d.valido]),[['ESTUDANTE',true],['RESPONSAVEL',true]]);
 assert.equal(destinatariosEmail('Aluno','','Responsável','responsavel@example.test').find(d=>d.valido).tipo,'RESPONSAVEL');
 assert.ok(templateEmailAcompanhamento('Aluno','Responsável').mensagem.includes('Olá, Responsável'));assert.ok(templateEmailAcompanhamento('Aluno','Responsável').mensagem.includes('acompanhamento de Aluno'));
 const {http}=await vite.ssrLoadModule('/src/services/http.ts');const original=http.post;
 try{http.post=async(url,body)=>{assert.equal(url,'/estudantes/2/email');assert.equal(body.destinatario,'RESPONSAVEL');assert.equal(body.email,undefined);return {data:{}};};await emailEstudanteService.enviar(2,{destinatario:'RESPONSAVEL',assunto:'Assunto',mensagem:'Mensagem'});}finally{http.post=original;}
 console.log('E-mail: seleção dos dois contatos, contato ausente, saudação e envio pelo tipo cadastrado verificados sem SMTP.');
}finally{await vite.close();}
