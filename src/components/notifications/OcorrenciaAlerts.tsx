import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { destinoNotificacao } from "../../services/notificacoesService";
import type { useNotificacoes } from "../../hooks/useNotificacoes";
const tocar = (ctx: AudioContext) => {
 const agora=ctx.currentTime;
 for(let i=0;i<3;i++) {
  const inicio=agora+i*0.72;const ganho=ctx.createGain();ganho.connect(ctx.destination);ganho.gain.setValueAtTime(0,inicio);ganho.gain.linearRampToValueAtTime(0.14,inicio+0.025);ganho.gain.exponentialRampToValueAtTime(0.001,inicio+0.5);
  const osc=ctx.createOscillator();osc.type="triangle";osc.frequency.setValueAtTime(740,inicio);osc.frequency.setValueAtTime(990,inicio+0.22);osc.connect(ganho);osc.start(inicio);osc.stop(inicio+0.52);osc.onended=()=>{osc.disconnect();ganho.disconnect();};
 }
};
export default function OcorrenciaAlerts({ dados, centralAberta = false }: { dados: ReturnType<typeof useNotificacoes>; centralAberta?: boolean }) {
 const idConta=dados.usuario?.id;const chave="portal.som-ocorrencias."+idConta;
 const [som,setSom]=useState(()=>{try{return localStorage.getItem(chave)==="1";}catch{return false;}});
 const [erro,setErro]=useState("");const audio=useRef<AudioContext|null>(null);const tocados=useRef(new Set<number>());
 const atual=dados.alertas[0];const id=atual?.id;
 useEffect(()=>{return ()=>{void audio.current?.close().catch(()=>{});audio.current=null;};},[]);
 useEffect(()=>{
  if(!som)return;
  const ativar=()=>{if(!audio.current&&window.AudioContext){audio.current=new AudioContext();void audio.current.resume().catch(()=>{});}};
  window.addEventListener("pointerdown",ativar,{once:true});window.addEventListener("keydown",ativar,{once:true});
  return()=>{window.removeEventListener("pointerdown",ativar);window.removeEventListener("keydown",ativar);};
 },[som]);
 useEffect(()=>{
  if(id===undefined||tocados.current.has(id))return;tocados.current.add(id);
  if(som&&dados.alertasSonoros.includes(id)&&audio.current?.state==="running"&&document.hasFocus())tocar(audio.current);
 },[id,som,dados.alertasSonoros]);
 async function alternar() {
  setErro("");try{
   if(!som){if(!window.AudioContext)throw new Error("Este navegador não oferece áudio para alertas.");audio.current??=new AudioContext();await audio.current.resume();tocar(audio.current);}
   setSom(!som);try{localStorage.setItem(chave,som?"0":"1");}catch{/* Preferência opcional. */}
  }catch(e){setErro(e instanceof Error?e.message:"Não foi possível ativar o som.");}
 }
 return <>
  <button type="button" aria-pressed={som} aria-label={som?"Silenciar alertas de ocorrência":"Ativar som dos alertas de ocorrência"} onClick={()=>void alternar()} title={som?"Som de ocorrências ativado — clique para silenciar":"Ativar som dos alertas de ocorrência"} className={`group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${som?"border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100":"border-[#dce5dc] bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
   <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m11 4-5 4H3v8h3l5 4V4Z"/>{som?<><path d="M15 8a6 6 0 0 1 0 8"/><path d="M18 5a10 10 0 0 1 0 14"/></>:<path d="m16 9 5 6m0-6-5 6"/>}</svg>
   {som&&<span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600 ring-2 ring-emerald-50"/>}
  </button>
  {erro&&<span role="status" className="block px-3 text-xs text-amber-800">{erro}</span>}
  {atual&&!centralAberta&&dados.usuario&&createPortal(<aside aria-label="Nova ocorrência de estudante" className="fixed right-4 top-24 z-[90] max-h-[calc(100dvh-7rem)] w-[520px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border-2 border-orange-400 bg-white shadow-[0_24px_80px_rgba(124,45,18,0.3)]">
   <div role="alert" aria-atomic="true"><div className="flex items-center gap-2 bg-orange-500 px-5 py-3 text-sm font-extrabold tracking-widest text-white"><span aria-hidden="true">⚠</span> ATENÇÃO — OCORRÊNCIA DE ESTUDANTE</div><div className="p-5"><div className="flex items-start gap-3"><span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 2 21h20L12 3Z" strokeLinejoin="round"/><path d="M12 9v5m0 3v1" strokeLinecap="round"/></svg></span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-amber-800">{dados.alertasSonoros.includes(atual.id)?"Nova ocorrência":"Ocorrência não lida"}</p><h2 className="mt-1 break-words text-xl font-bold text-slate-900">{atual.estudanteNome}</h2><p className="mt-1 text-xs text-slate-500">Registrada por {atual.remetente}</p></div><button type="button" aria-label="Dispensar alerta sem marcar como lido" className="min-h-9 min-w-9 rounded-lg text-xl text-slate-500 hover:bg-slate-100" onClick={()=>dados.fecharAlerta(atual.id)}>×</button></div><p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-orange-50 p-4 text-base leading-7 text-slate-800">{atual.mensagem}</p><time className="mt-2 block text-xs text-slate-500" dateTime={atual.criadaEm}>{new Date(atual.criadaEm).toLocaleString("pt-BR")}</time></div></div>
   <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-100 bg-amber-50/60 px-5 py-4"><Link to={destinoNotificacao(atual,dados.usuario.perfil)} onClick={()=>{void dados.ler(atual.id);dados.fecharAlerta(atual.id);}} className="inline-flex min-h-10 items-center rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700">Abrir ocorrência agora →</Link><span className="text-xs text-slate-600">{dados.alertas.length>1?String(dados.alertas.length)+" novos alertas":"Disponível na central de notificações"}</span></div>
  </aside>,document.body)}
 </>;
}
