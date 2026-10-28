import { useEffect,useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { solicitacoesAcessoService } from '../../../services/solicitacoesAcessoService';
import type { SolicitacaoAcesso } from '../../../types/auth';
import { mensagemErro } from '../../../services/apiError';
import Button from '../../../components/common/Button';
export default function SolicitarAdministracaoPage() {
  const {usuario}=useAuth(); const [pedidos,setPedidos]=useState<SolicitacaoAcesso[]>([]); const [erro,setErro]=useState(''); const [ocupado,setOcupado]=useState(false);
  useEffect(()=>{ const c=new AbortController();solicitacoesAcessoService.minhas(c.signal).then(p=>{if(!c.signal.aborted)setPedidos(p);}).catch(e=>{if(!c.signal.aborted)setErro(mensagemErro(e));});return()=>c.abort();},[]);
  async function solicitar(){if(ocupado)return;setOcupado(true);setErro('');try{const p=await solicitacoesAcessoService.solicitarAdministracao();setPedidos(atuais=>[...atuais,p]);}catch(e){setErro(mensagemErro(e));}finally{setOcupado(false);}}
  const pendente=pedidos.some(p=>p.status==='PENDENTE');
  return <main className="mx-auto max-w-3xl space-y-6"><header><h1 className="text-2xl font-bold text-primary">Solicitar acesso administrativo</h1><p className="mt-2 text-sm leading-relaxed text-slate-600">O acesso a permissões, auditorias e análise de cadastros depende da aprovação do root, administrador geral.</p></header><section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">{usuario?.root || usuario?.administracaoAprovada ? <p className="text-sm text-green-800">Seu acesso administrativo já está aprovado.</p> : <><p className="text-sm text-slate-600">Envie o pedido para análise em até 48 horas. Seu perfil permanece como coordenador.</p><Button disabled={ocupado || pendente} onClick={()=>void solicitar()}>{pendente ? 'Solicitação aguardando análise do root' : ocupado ? 'Enviando...' : 'Solicitar acesso ao root'}</Button></>}{erro && <p role="alert" className="text-sm text-red-800">{erro}</p>}</section>{pedidos.map(p=><article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 text-sm"><p className="font-semibold">Protocolo {p.id} · {p.status==='PENDENTE' ? 'Aguardando análise' : p.status==='APROVADA' ? 'Aprovado' : 'Recusado'}</p><p className="mt-2 text-slate-600">Solicitado em {new Date(p.criadaEm).toLocaleString('pt-BR')}. {p.motivo}</p></article>)}</main>;
}
