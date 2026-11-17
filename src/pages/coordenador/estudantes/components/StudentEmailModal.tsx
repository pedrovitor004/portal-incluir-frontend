import { useRef, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { colorThemes } from "../../../../config/uiThemes";
import { mensagemErro } from "../../../../services/apiError";
import { emailEstudanteService, destinatariosEmail, templateEmailAcompanhamento } from "../../../../services/emailEstudanteService";
import { getOverlayToolsHost } from "../../../../services/overlayTools";
import { notificationService } from "../../../../services/notificationService";
import Button from "../../../../components/common/Button";
import Modal from "../../../../components/common/Modal";
type Props = { estudanteId: number; nome: string; email: string; nomeResponsavel?: string; emailResponsavel?: string; onClose: () => void };
const campo="min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus-visible:outline-2 focus-visible:outline-green-700";
export default function StudentEmailModal({estudanteId,nome,email,nomeResponsavel="",emailResponsavel="",onClose}:Props) {
 const opcoes=destinatariosEmail(nome,email,nomeResponsavel,emailResponsavel);
 const inicial=opcoes.find(o=>o.valido)??opcoes[0];
 const [tipo,setTipo]=useState<"ESTUDANTE"|"RESPONSAVEL">(inicial.tipo);
 const destinatario=opcoes.find(o=>o.tipo===tipo)!;
 const modeloInicial=templateEmailAcompanhamento(nome,inicial.tipo==="RESPONSAVEL"?nomeResponsavel||"responsável":undefined);
 const [assunto,setAssunto]=useState(modeloInicial.assunto);const [mensagem,setMensagem]=useState(modeloInicial.mensagem);
 const [erro,setErro]=useState("");const [enviando,setEnviando]=useState(false);const trava=useRef(false);
 function selecionar(valor:"ESTUDANTE"|"RESPONSAVEL") {
  const anterior=templateEmailAcompanhamento(nome,tipo==="RESPONSAVEL"?nomeResponsavel||"responsável":undefined);
  const proximo=templateEmailAcompanhamento(nome,valor==="RESPONSAVEL"?nomeResponsavel||"responsável":undefined);
  if(assunto===anterior.assunto)setAssunto(proximo.assunto);if(mensagem===anterior.mensagem)setMensagem(proximo.mensagem);setTipo(valor);setErro("");
 }
 async function enviar(event:FormEvent) {
  event.preventDefault();if(trava.current)return;
  if(!destinatario.valido){setErro("O destinatário selecionado não possui e-mail válido cadastrado.");return;}
  if(!assunto.trim()||!mensagem.trim()){setErro("Preencha o assunto e o conteúdo da mensagem.");return;}
  trava.current=true;setEnviando(true);setErro("");
  try {
   const confirmacao=await Swal.fire({target:getOverlayToolsHost(),titleText:"Confirmar envio do e-mail?",text:"A mensagem será enviada para "+destinatario.nome+" ("+destinatario.email+"). Revise o destinatário, o assunto e o conteúdo.",icon:"question",showCancelButton:true,confirmButtonText:"Enviar",cancelButtonText:"Voltar para revisar",confirmButtonColor:colorThemes.green["--accent-main"],cancelButtonColor:"#64748b",focusCancel:true,allowOutsideClick:false,heightAuto:false});
   if(!confirmacao.isConfirmed)return;
   await emailEstudanteService.enviar(estudanteId,{destinatario:tipo,assunto:assunto.trim(),mensagem:mensagem.trim()});notificationService.success("E-mail enviado com sucesso!");onClose();
  }catch(e){const texto=mensagemErro(e);setErro(texto);notificationService.error(texto);}finally{trava.current=false;setEnviando(false);}
 }
 return <Modal open onClose={onClose} busy={enviando} title="Enviar e-mail" description={"Selecione quem receberá a mensagem sobre "+nome+". A logo do Portal Incluir será incluída automaticamente."} size="wide" footer={<div className="flex w-full justify-end gap-3"><Button variant="secondary" disabled={enviando} onClick={onClose}>Cancelar</Button><Button type="submit" form="student-email-form" disabled={enviando||!destinatario.valido}>{enviando?"Aguarde...":"Enviar"}</Button></div>}>
  <form id="student-email-form" onSubmit={e=>void enviar(e)} className="space-y-5"><fieldset disabled={enviando} className="space-y-5">
   <div><label htmlFor="email-tipo" className="mb-1.5 block text-sm font-semibold text-slate-700">Enviar para</label><select id="email-tipo" className={campo} value={tipo} onChange={e=>selecionar(e.target.value as typeof tipo)}>{opcoes.map(o=><option key={o.tipo} value={o.tipo} disabled={!o.valido}>{o.tipo==="ESTUDANTE"?"Estudante":"Responsável"} — {o.nome} — {o.email||"E-mail não cadastrado"}{o.email&&!o.valido?" (inválido)":""}</option>)}</select></div>
   <div><label htmlFor="email-destinatario" className="mb-1.5 block text-sm font-semibold text-slate-700">E-mail do destinatário</label><input id="email-destinatario" type="email" required readOnly value={destinatario.email} className={campo+" bg-slate-50"}/><p className="mt-1 text-xs text-slate-500">O endereço é obtido do cadastro. Altere os dados do estudante para corrigir um e-mail.</p></div>
   <div><label htmlFor="email-assunto" className="mb-1.5 block text-sm font-semibold text-slate-700">Assunto</label><input id="email-assunto" required maxLength={200} value={assunto} onChange={e=>setAssunto(e.target.value)} className={campo}/></div>
   <div><label htmlFor="email-mensagem" className="mb-1.5 block text-sm font-semibold text-slate-700">Mensagem</label><textarea id="email-mensagem" required rows={8} maxLength={10000} value={mensagem} onChange={e=>setMensagem(e.target.value)} className={campo+" w-full resize-y leading-relaxed"}/></div>
  </fieldset>{erro&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}</form>
 </Modal>;
}
