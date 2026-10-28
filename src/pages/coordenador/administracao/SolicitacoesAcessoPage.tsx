import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import { solicitacoesAcessoService, podeAnalisarAcesso } from '../../../services/solicitacoesAcessoService';
import type { SolicitacaoAcesso } from '../../../types/auth';
import { accessProfiles } from '../../../config/access';
import { alertaPadrao as alertaFluxo } from '../../../services/alertaPadrao';
import { mensagemErro } from '../../../services/apiError';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import LoadingState from '../../../components/common/LoadingState';
const nomes: Record<string,string> = { nome:'Nome completo', email:'E-mail', matricula:'Matrícula', telefone:'Telefone', dataNascimento:'Data de nascimento', setor:'Setor', cargo:'Cargo', disciplina:'Disciplina', cursosAtuacao:'Cursos de atuação', areaAtuacao:'Área de atuação' };
export default function SolicitacoesAcessoPage() {
  const { usuario } = useAuth(); const [params,setParams] = useSearchParams();
  const [dados,setDados] = useState<SolicitacaoAcesso[]>([]); const [erro,setErro] = useState('');
  const [carregando,setCarregando] = useState(true); const [ocupado,setOcupado] = useState(false);
  const [versao,setVersao] = useState(0); const [motivo,setMotivo] = useState(''); const pendente = useRef(false);
  const selecionada = dados.find(s => s.id === Number(params.get('pedido')));
  const pode = podeAnalisarAcesso(usuario);
  useEffect(() => {
    if (!pode) return;
    const c = new AbortController();
    solicitacoesAcessoService.listar(true,c.signal).then(lista => { if (!c.signal.aborted) { setDados(lista); setErro(''); } }).catch(e => { if (!c.signal.aborted) setErro(mensagemErro(e)); }).finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
  },[pode,versao]);
  async function decidir(aprovar: boolean) {
    if (!selecionada || pendente.current) return;
    const administrativo=selecionada.tipo==='ADMINISTRACAO';
    pendente.current=true; setOcupado(true); setErro('');
    try {
      const r=await alertaFluxo({titleText:aprovar ? (administrativo ? 'Aprovar acesso administrativo?' : 'Aprovar cadastro?') : 'Recusar pedido?',text:`${selecionada.nome}. ${aprovar ? (administrativo ? 'O acesso administrativo será liberado para este coordenador.' : 'A conta será criada e o solicitante poderá entrar com a senha informada no pedido.') : 'O acesso solicitado não será liberado.'}`,icon:'warning',showCancelButton:true,confirmButtonText:aprovar ? 'Aprovar e liberar acesso' : 'Recusar pedido',...(aprovar ? {} : {confirmButtonColor:'#b91c1c'})});
      if (!r.isConfirmed) return;
      const atual=await solicitacoesAcessoService.decidir(selecionada.id,aprovar,motivo.trim() || undefined);
      setDados(lista=>lista.map(s=>s.id===atual.id ? atual : s));setParams({});
      window.dispatchEvent(new Event('portal:access-requests-changed'));
      await alertaFluxo({titleText:aprovar ? 'Acesso aprovado' : 'Pedido recusado',text:aprovar ? (administrativo ? 'O acesso administrativo foi liberado.' : 'A conta foi criada. O solicitante pode entrar no portal.') : 'O pedido foi recusado e o acesso solicitado permanece bloqueado.',icon:'success'});
    } catch(e) {setErro(mensagemErro(e));} finally {pendente.current=false;setOcupado(false);}
  }
  if (!pode) return <p role="alert">Você não tem acesso à análise de solicitações.</p>;
  return <main className="mx-auto max-w-6xl space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-primary">Solicitações de acesso</h1><p className="mt-2 text-sm text-slate-500">Analise cada pedido em até 48 horas. O acesso depende de aprovação, inclusive para coordenadores.</p></div><Button variant="secondary" disabled={ocupado || carregando} onClick={() => setVersao(v=>v+1)}>Atualizar</Button></header>
    {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
    {carregando ? <LoadingState label="Consultando solicitações..." /> : <section className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">{!dados.length && <p className="p-6 text-sm text-slate-500">Nenhuma solicitação de cadastro recebida.</p>}{dados.map(s=><article key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-semibold text-slate-800">{s.nome} · {s.tipo==='ADMINISTRACAO' ? 'Acesso administrativo' : accessProfiles[s.perfil].label}</h2><p className="mt-1 text-sm text-slate-500">{s.email} · Protocolo {s.id}</p><p className="mt-2 text-xs text-slate-600">{s.status==='PENDENTE' ? 'Aguardando análise' : s.status==='APROVADA' ? 'Aprovada' : 'Recusada'} · Solicitada em {new Date(s.criadaEm).toLocaleString('pt-BR')}</p>{s.atrasada && <p className="mt-2 text-sm font-semibold text-amber-800">Solicitação feita há {s.diasPendente} dias · Prazo de 48 horas ultrapassado</p>}</div><Button variant="secondary" disabled={ocupado} onClick={()=>{setMotivo('');setParams({pedido:String(s.id)});}}>{s.status==='PENDENTE' ? 'Analisar solicitação' : 'Ver decisão'}</Button></article>)}</section>}
    <Modal open={!!selecionada} onClose={()=>{if(!ocupado)setParams({});}} busy={ocupado} title="Analisar solicitação de cadastro" size="wide">{selecionada && <div className="space-y-5"><p className="text-sm font-semibold text-slate-800">Perfil solicitado: {accessProfiles[selecionada.perfil].label}</p><dl className="grid gap-4 sm:grid-cols-2">{Object.entries(selecionada.dados ?? {}).filter(([k,v])=>nomes[k] && v!=null && v!=='').map(([k,v])=><div key={k}><dt className="text-xs font-medium text-slate-500">{nomes[k]}</dt><dd className="mt-1 break-words text-sm text-slate-800">{Array.isArray(v) ? v.join(', ') : String(v)}</dd></div>)}</dl>{selecionada.status==='PENDENTE' ? <><label className="block text-sm font-semibold text-slate-700">Observação da análise (opcional)<textarea value={motivo} maxLength={1000} onChange={e=>setMotivo(e.target.value)} disabled={ocupado} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label><div className="flex flex-wrap justify-end gap-3"><Button variant="secondary" disabled={ocupado} onClick={()=>void decidir(false)}>Recusar</Button><Button disabled={ocupado} onClick={()=>void decidir(true)}>{ocupado ? 'Processando...' : 'Aprovar cadastro'}</Button></div></> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{selecionada.status==='APROVADA' ? 'Cadastro aprovado.' : 'Cadastro recusado.'} {selecionada.motivo}</p>}{erro && <p role="alert" className="text-sm text-red-800">{erro}</p>}</div>}</Modal>
  </main>;
}
