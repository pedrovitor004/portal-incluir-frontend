import assert from 'node:assert/strict';
import {createServer} from 'vite';
const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {detectarNovasOcorrencias}=await vite.ssrLoadModule('/src/services/ocorrenciaAlertModel.ts');
 const antiga={id:1,etapa:'OCORRENCIA',lida:false};const entrada=detectarNovasOcorrencias(null,[antiga]);assert.deepEqual(entrada.novas,[]);assert.deepEqual(entrada.iniciais,[antiga],'Não lidas aparecem ao entrar, sem novo som');
 const nova={id:2,etapa:'OCORRENCIA',lida:false};const resultado=detectarNovasOcorrencias(entrada.ids,[antiga,nova,{id:3,etapa:'PEA',lida:false},{id:4,etapa:'OCORRENCIA',lida:true}]);assert.deepEqual(resultado.novas,[nova]);assert.deepEqual(resultado.iniciais,[]);
 assert.deepEqual(detectarNovasOcorrencias(resultado.ids,[antiga,nova]).novas,[]);assert.deepEqual(detectarNovasOcorrencias(resultado.ids,[{...nova,lida:true}]).novas,[]);
 console.log('Alertas: não lidas visíveis ao entrar, som apenas para novas ocorrências, sem repetição e sem alertar outras etapas.');
}finally{await vite.close();}
