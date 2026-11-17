import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { canAccess, podeGerenciarFluxo } from "../../../../config/access";
import { raiService } from "../../../../services/raiService";
import { perfilEstudanteService } from "../../../../services/perfilEstudanteService";
import { sugerirRai, atualizarImportados, origensCamposRai, periodoRaiInclui } from "../../../../services/documentosEstudante/raiModel";
import { mensagemErro } from "../../../../services/apiError";
import { adequacoesRai, camposTextoRai, frequenciasRai, habilidadesRai, novoRai, type RaiResponse, type RaiConteudo } from "../../../../types/rai";
import type { EstudanteResponse } from "../../../../types/estudante";
import type { DadosPerfilEstudante } from "../../../../types/perfilEstudante";
import Button from "../../../../components/common/Button";
import StudentExport from "./StudentExport";
const campo = "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal disabled:bg-slate-50";
export default function RaiForm({ estudante }: { estudante: EstudanteResponse }) {
 const { usuario } = useAuth();
 const [registros,setRegistros] = useState<RaiResponse[]>([]);
 const [registro,setRegistro] = useState<RaiResponse>();
 const [contexto,setContexto] = useState<DadosPerfilEstudante>();
 const [dados,setDados] = useState(novoRai);
 const importados = useRef(novoRai());
 const [erro,setErro] = useState(""); const [sucesso,setSucesso] = useState("");
 const [carregando,setCarregando] = useState(true); const [ocupado,setOcupado] = useState(false);
 const [tentativa,setTentativa] = useState(0); const [alterado,setAlterado] = useState(false); const [revisado,setRevisado] = useState(false);
 const trava = useRef(false);
 const autorizado = podeGerenciarFluxo(usuario) && !!usuario && canAccess(usuario,"sensivel.consultar") && canAccess(usuario,"documentos");
 const editar = autorizado && !!usuario && canAccess(usuario,"pei.editar") && estudante.ativo && !estudante.concluido && !registro?.concluidoEm;
 useEffect(() => {
  if (!autorizado) return;
  const c = new AbortController();
  void Promise.all([raiService.listar(estudante.id,c.signal),perfilEstudanteService.consultar(estudante.id,c.signal,usuario)]).then(([rs,ctx]) => {
   if(c.signal.aborted) return;
   const sugestao=sugerirRai(ctx); setContexto(ctx); setRegistros(rs); setRegistro(rs[0]);
   importados.current=sugestao; setDados(rs[0]?.dados ?? sugestao); setAlterado(false); setErro("");
  }).catch(e=>{if(!c.signal.aborted) setErro(mensagemErro(e));}).finally(()=>{if(!c.signal.aborted) setCarregando(false);});
  return ()=>c.abort();
 },[estudante.id,autorizado,tentativa,usuario]);
 useEffect(()=>{
  if(!alterado) return;
  const avisar=(e:BeforeUnloadEvent)=>{e.preventDefault();}; window.addEventListener("beforeunload",avisar);
  return ()=>window.removeEventListener("beforeunload",avisar);
 },[alterado]);
 if(!autorizado) return <p>O RAI é gerenciado pela coordenação.</p>;
 function selecionar(id:string) {
  if(!contexto) return; const r=registros.find(r=>String(r.id)===id); const novo=sugerirRai(contexto);
  setRegistro(r); setDados(r?.dados ?? novo); importados.current=novo; setAlterado(false);setRevisado(false);setSucesso("");setErro("");
 }
 function alterar<K extends keyof RaiConteudo>(chave:K,valor:RaiConteudo[K]) {
  let proximo={...dados,[chave]:valor};
  if(contexto && ["anoLetivo","periodicidade","numeroPeriodo","componenteCurricular"].includes(chave)) {
   if(chave==="periodicidade") proximo.numeroPeriodo="1";
   const sugestao=sugerirRai(contexto,proximo); proximo=atualizarImportados(proximo,importados.current,sugestao);importados.current=sugestao;
  }
  setDados(proximo);setAlterado(true);setRevisado(false);setSucesso("");
 }
 async function salvar(event:FormEvent) {
  event.preventDefault(); if(trava.current||!editar) return;trava.current=true;setOcupado(true);setErro("");
  try {const r=await raiService.salvar(estudante.id,dados,registro);setRegistro(r);setDados(r.dados);setRegistros(rs=>[r,...rs.filter(v=>v.id!==r.id)]);setAlterado(false);setSucesso("RAI salvo. Revise o relatório e conclua o acompanhamento do período quando estiver pronto.");}
  catch(e){setErro(mensagemErro(e));}finally{trava.current=false;setOcupado(false);}
 }
 async function importar() {
  if(trava.current||!editar) return;trava.current=true;setOcupado(true);setErro("");
  try{const ctx=await perfilEstudanteService.consultar(estudante.id,new AbortController().signal,usuario);const sugestao=sugerirRai(ctx,dados);setDados(atualizarImportados(dados,importados.current,sugestao));importados.current=sugestao;setContexto(ctx);setAlterado(true);setRevisado(false);setSucesso("Dados atualizados a partir da anamnese, Plano de Ação, PEI e PEA. As alterações manuais foram preservadas.");}
  catch(e){setErro(mensagemErro(e));}finally{trava.current=false;setOcupado(false);}
 }
 async function concluir() {
  if(!registro||alterado||!revisado||trava.current||!editar)return;trava.current=true;setOcupado(true);setErro("");
  try{const r=await raiService.concluir(estudante.id,registro);setRegistro(r);setRegistros(rs=>rs.map(v=>v.id===r.id?r:v));setSucesso("Acompanhamento do período concluído para "+estudante.nomeCompleto+". Você pode consultar os documentos e gerar um novo RAI.");window.dispatchEvent(new Event("portal:fluxo-concluido"));}
  catch(e){setErro(mensagemErro(e));}finally{trava.current=false;setOcupado(false);}
 }
 const texto=(chave:keyof typeof camposTextoRai,longo=true)=><label key={chave} className="block text-sm font-medium text-slate-700">{camposTextoRai[chave]}{longo?<textarea className={campo} rows={3} maxLength={5000} value={dados[chave]} onChange={e=>alterar(chave,e.target.value)}/>:<input className={campo} type={chave==="data"?"date":"text"} maxLength={150} value={dados[chave]} onChange={e=>alterar(chave,e.target.value)}/>}{origensCamposRai[chave]&&<span className="mt-1 block text-xs font-normal text-slate-500">Origem: {origensCamposRai[chave]}. Revise conforme o acompanhamento.</span>}</label>;
 const componentes=[...new Set(contexto?.adaptacoes.filter(a=>!a.arquivado&&periodoRaiInclui(a.semestreAno,dados)).map(a=>a.componenteCurricular)??[])];
 return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
  <h2 className="text-lg font-semibold">Relatório de Acompanhamento Individual</h2>
  <p className="text-sm leading-6 text-slate-600">Os dados da anamnese, Plano de Ação, PEI e PEA preenchem este relatório. Revise os resultados do período antes de concluir. A exportação utiliza o modelo institucional em Word.</p>
  {carregando?<p role="status">Reunindo os dados do acompanhamento...</p>:contexto&&<>
   <label className="block text-sm font-medium">Relatório<select className={campo} disabled={ocupado||alterado} value={registro?.id??"novo"} onChange={e=>selecionar(e.target.value)}><option value="novo">Gerar novo RAI</option>{registros.map(r=><option key={r.id} value={r.id}>{r.dados.anoLetivo} · {r.dados.periodicidade} {r.dados.periodicidade==="ANUAL"?"":r.dados.numeroPeriodo} · {r.dados.componenteCurricular||"Todos os componentes"} · {r.concluidoEm?"Concluído":"Em revisão"} · nº {r.id}</option>)}</select></label>
   {registro?.concluidoEm&&<p role="status" className="text-sm font-semibold text-green-800">Acompanhamento deste período concluído. Selecione “Gerar novo RAI” para continuar o acompanhamento. O estudante permanece ativo.</p>}
   <form onSubmit={e=>void salvar(e)} className="space-y-6"><fieldset disabled={!editar||ocupado} className="space-y-5">
    <legend className="font-semibold">Identificação e período</legend>
    <p className="text-sm">Estudante: {estudante.nomeCompleto} · Curso: {estudante.curso}</p>
    <div className="grid gap-4 sm:grid-cols-2">{texto("campus",false)}
     <label className="block text-sm font-medium">Componente curricular<input list="componentes-rai" className={campo} maxLength={150} placeholder="Todos os componentes" value={dados.componenteCurricular} onChange={e=>alterar("componenteCurricular",e.target.value)}/><datalist id="componentes-rai">{componentes.map(c=><option key={c} value={c}/>)}</datalist><span className="text-xs font-normal text-slate-500">Selecione uma disciplina para reunir seu PEA, ou deixe vazio para todas.</span></label>
     {texto("professor",false)}<label className="block text-sm font-medium">Ano letivo *<input required type="number" min="2000" max="2100" className={campo} value={dados.anoLetivo} onChange={e=>alterar("anoLetivo",e.target.value)}/></label>
     <label className="block text-sm font-medium">Periodicidade<select className={campo} value={dados.periodicidade} onChange={e=>alterar("periodicidade",e.target.value as RaiConteudo["periodicidade"])}><option value={/t[eé]cnico/i.test(estudante.curso)?"BIMESTRAL":"SEMESTRAL"}>{/t[eé]cnico/i.test(estudante.curso)?"Bimestral":"Semestral"}</option><option value="ANUAL">Anual</option></select></label>
     {dados.periodicidade!=="ANUAL"&&<label className="block text-sm font-medium">{dados.periodicidade==="BIMESTRAL"?"Bimestre":"Semestre"}<select className={campo} value={dados.numeroPeriodo} onChange={e=>alterar("numeroPeriodo",e.target.value)}>{Array.from({length:dados.periodicidade==="BIMESTRAL"?4:2},(_,i)=><option key={i} value={i+1}>{i+1}º</option>)}</select></label>}
    </div>
    <Button variant="secondary" onClick={()=>void importar()}>Atualizar dados das etapas anteriores</Button>
    <p className="text-xs leading-5 text-slate-500">O período selecionado determina os planos e PEAs utilizados. No RAI bimestral, o planejamento do semestre correspondente serve de referência. Dados revisados manualmente são preservados.</p>
    <h3 className="font-semibold">Observações da equipe multiprofissional</h3>{(["deficiencia","acompanhamento","comunicacao","aprendizagem","saude"] as const).map(k=>texto(k))}
    <h3 className="font-semibold">Desempenho quanto às habilidades</h3><p className="text-sm text-slate-500">Registre a frequência observada em cada habilidade. O planejamento não permite deduzir estas respostas.</p>
    <div className="grid gap-4 sm:grid-cols-2">{Object.entries(habilidadesRai).map(([k,rotulo])=><label key={k} className="block text-sm font-medium">{rotulo}<select className={campo} value={dados.habilidades[k as keyof typeof habilidadesRai]??""} onChange={e=>{const h={...dados.habilidades};if(e.target.value)h[k as keyof typeof habilidadesRai]=e.target.value as typeof frequenciasRai[number];else delete h[k as keyof typeof habilidadesRai];alterar("habilidades",h);}}><option value="">Avaliar</option>{frequenciasRai.map(f=><option key={f}>{f}</option>)}</select></label>)}</div>
    {(["competencias","objetivosGerais","objetivosEspecificos","comentarios","avaliacao"] as const).map(k=>texto(k))}
    <fieldset className="flex flex-wrap gap-4"><legend className="mb-3 text-sm font-semibold">Necessidades de adaptações curriculares</legend>{adequacoesRai.map(a=><label key={a} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dados.adequacoes.includes(a)} onChange={e=>alterar("adequacoes",e.target.checked?[...dados.adequacoes,a]:dados.adequacoes.filter(v=>v!==a))}/>{a}</label>)}</fieldset>
    <p className="text-xs text-slate-500">Importadas dos campos dos PEAs e das propostas do PEI. Confirme as adaptações efetivamente aplicadas.</p>
    {(["encaminhamentos","consideracoesGerais"] as const).map(k=>texto(k))}
    <div className="grid gap-4 sm:grid-cols-2">{texto("local",false)}{texto("data",false)}</div><p className="text-xs text-slate-500">A cidade compõe a linha de data e assinatura prevista no modelo institucional.</p>
    {editar&&<Button type="submit">{ocupado?"Salvando...":"Salvar RAI"}</Button>}
   </fieldset></form>
   {alterado&&<><p role="status" className="text-sm text-amber-800">Salve suas alterações antes de exportar, concluir ou trocar de relatório.</p><Button variant="secondary" disabled={ocupado} onClick={()=>selecionar(registro?String(registro.id):"novo")}>Descartar alterações não salvas</Button></>}
   {registro&&<StudentExport estudanteId={estudante.id} tipo="rai" raiId={registro.id} disabled={alterado||ocupado}/>}
   {registro&&editar&&<div className="space-y-3 border-t border-slate-200 pt-5"><label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" checked={revisado} disabled={alterado||ocupado} onChange={e=>setRevisado(e.target.checked)}/>Revisei os resultados e confirmei as adaptações aplicadas neste período.</label><Button disabled={alterado||ocupado||!revisado} onClick={()=>void concluir()}>Concluir acompanhamento deste período</Button><p className="text-xs text-slate-500">Marca as etapas deste período como concluídas para {estudante.nomeCompleto}. Os documentos continuam acessíveis e novos RAIs podem ser gerados.</p></div>}
  </>}
  {erro&&<p role="alert" className="text-sm text-red-800">{erro}</p>}{!contexto&&!carregando&&<Button variant="secondary" onClick={()=>{setCarregando(true);setTentativa(v=>v+1);}}>Tentar consultar novamente</Button>}{sucesso&&<p role="status" className="text-sm text-green-800">{sucesso}</p>}
 </section>;
}
