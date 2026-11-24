import ResourceIcon from '../../../components/icons/ResourceIcon';
import { RequestStatus, RequestType } from '../../../components/notifications/accessRequestPresentation';
import { dataPedido } from '../../../components/notifications/accessRequestDate';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import { solicitacoesAcessoService, podeAnalisarAcesso, podeDecidirAcesso } from '../../../services/solicitacoesAcessoService';
import type { SolicitacaoAcesso } from '../../../types/auth';
import { accessProfiles } from '../../../config/access';
import { alertaPadrao as alertaFluxo } from '../../../services/alertaPadrao';
import { notificationService } from '../../../services/notificationService';
import { mensagemErro } from '../../../services/apiError';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import AccessRequestsTable from './components/AccessRequestsTable';
const nomes: Record<string,string> = { nome:'Nome completo', email:'E-mail', matricula:'Matrícula', telefone:'Telefone', dataNascimento:'Data de nascimento', setor:'Setor', cargo:'Cargo', disciplina:'Disciplina', cursosAtuacao:'Cursos de atuação', areaAtuacao:'Área de atuação' };
export default function SolicitacoesAcessoPage() {
  const { usuario } = useAuth(); const [params,setParams] = useSearchParams();
  const [dados,setDados] = useState<SolicitacaoAcesso[]>([]); const [erro,setErro] = useState('');
  const [carregando,setCarregando] = useState(true); const [ocupado,setOcupado] = useState(false);
  const [versao,setVersao] = useState(0); const [motivo,setMotivo] = useState(''); const pendente = useRef(false);
  const [visiveis, setVisiveis] = useState(0);
  const [limpar, setLimpar] = useState(0);
  const abrirPedido = useCallback((pedido: SolicitacaoAcesso) => { setMotivo(''); setParams({ pedido: String(pedido.id) }); }, [setParams]);
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState('TODAS');
  const [tipo, setTipo] = useState('TODOS');
  const filtrados = useMemo(() => dados.filter(s => (situacao === 'TODAS' || s.status === situacao) && (tipo === 'TODOS' || s.tipo === tipo) && `${s.nome} ${s.email} ${s.id}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))).sort((a,b) => Number(b.status === 'PENDENTE' && b.atrasada) - Number(a.status === 'PENDENTE' && a.atrasada) || Date.parse(b.criadaEm) - Date.parse(a.criadaEm)), [dados, situacao, tipo, busca]);
  const selecionada = dados.find(s => s.id === Number(params.get('pedido')));
  const pode = podeAnalisarAcesso(usuario);
  useEffect(() => {
    if (!pode) return;
    const c = new AbortController();
    solicitacoesAcessoService.listar(true,c.signal).then(lista => { if (!c.signal.aborted) { setDados(lista); setErro(''); } }).catch(e => { if (!c.signal.aborted) { const mensagem = mensagemErro(e); setErro(mensagem); void notificationService.error(mensagem); } }).finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
  },[pode,versao]);
  async function decidir(aprovar: boolean) {
    if (!selecionada || pendente.current || !podeDecidirAcesso(usuario, selecionada)) return;
    const administrativo=selecionada.tipo==='ADMINISTRACAO';
    pendente.current=true; setOcupado(true); setErro('');
    try {
      const r=await alertaFluxo({titleText:aprovar ? (administrativo ? 'Aprovar acesso administrativo?' : 'Aprovar cadastro?') : 'Recusar pedido?',text:`${selecionada.nome}. ${aprovar ? (administrativo ? 'O acesso administrativo será liberado para este coordenador.' : 'A conta será criada e o solicitante poderá entrar com a senha informada no pedido.') : 'O acesso solicitado não será liberado.'}`,icon:'warning',showCancelButton:true,confirmButtonText:aprovar ? 'Aprovar e liberar acesso' : 'Recusar pedido',...(aprovar ? {} : {confirmButtonColor:'#b91c1c'})});
      if (!r.isConfirmed) return;
      if (!podeDecidirAcesso(usuario, selecionada)) return;
      const atual=await solicitacoesAcessoService.decidir(selecionada.id,aprovar,motivo.trim() || undefined);
      setDados(lista=>lista.map(s=>s.id===atual.id ? atual : s));setParams({});
      window.dispatchEvent(new Event('portal:access-requests-changed'));
      await alertaFluxo({titleText:aprovar ? 'Acesso aprovado' : 'Pedido recusado',text:aprovar ? (administrativo ? 'O acesso administrativo foi liberado.' : 'A conta foi criada. O solicitante pode entrar no portal.') : 'O pedido foi recusado e o acesso solicitado permanece bloqueado.',icon:'success'});
    } catch(e) { const mensagem = mensagemErro(e); setErro(mensagem); await alertaFluxo({ titleText: 'Não foi possível registrar a decisão', text: mensagem, icon: 'error', confirmButtonText: 'Voltar para a solicitação' }); } finally {pendente.current=false;setOcupado(false);}
  }
  if (!pode) return <p role="alert">Você não tem acesso à análise de solicitações.</p>;
  return <main className="mx-auto w-full max-w-[1600px] space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><h1 data-page-title className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">Solicitações de acesso</h1><p className="mt-2 text-sm text-slate-500">Analise cada pedido em até 48 horas. O acesso depende de aprovação, inclusive para coordenadores.</p></div><Button variant="secondary" disabled={ocupado || carregando} onClick={() => { setCarregando(true); setVersao(v=>v+1); }} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 2M4 17l2 2a7 7 0 0 0 12-2" /></svg>}>Atualizar</Button></header>
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumo das solicitações">{[
      { titulo: 'Aguardando análise', descricao: 'Pedidos que precisam de uma decisão', valor: dados.filter(s => s.status === 'PENDENTE').length, icone: 'students' as const, borda: 'border-l-sky-500', cor: 'bg-sky-50 text-sky-700' },
      { titulo: 'Prazo ultrapassado', descricao: 'Pendentes há mais de 48 horas', valor: dados.filter(s => s.status === 'PENDENTE' && s.atrasada).length, icone: 'bell' as const, borda: 'border-l-amber-500', cor: 'bg-amber-50 text-amber-700' },
      { titulo: 'Decisões registradas', descricao: 'Pedidos aprovados ou recusados', valor: dados.filter(s => s.status !== 'PENDENTE').length, icone: 'shield' as const, borda: 'border-l-primary', cor: 'bg-green-50 text-green-800' },
    ].map(item => <div key={item.titulo} className={`relative overflow-hidden rounded-2xl border border-[#dce5dc] border-l-4 bg-white p-5 shadow-[0_4px_20px_rgba(24,91,50,0.05)] sm:p-6 ${item.borda}`}>
      <div className="flex items-start justify-between gap-4"><span className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-black/5 ${item.cor}`}><ResourceIcon name={item.icone} className="h-7 w-7" /></span><span className="text-4xl font-semibold tracking-tight text-[#26332b] tabular-nums">{carregando ? <span aria-label="Carregando total" className="inline-block h-9 w-12 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" /> : item.valor}</span></div>
      <h2 className="mt-5 text-sm font-semibold text-slate-700">{item.titulo}</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">{item.descricao}</p>
    </div>)}</section>
    <section className="rounded-2xl border border-[#dce5dc] bg-white shadow-[0_4px_20px_rgba(24,91,50,0.04)] p-5"><div className="flex items-center gap-3"><ResourceIcon name="shield" /><h2 className="font-semibold text-slate-800">Central de análise de acesso</h2></div><p className="mt-2 text-sm leading-relaxed text-slate-600">Confira a identificação e o perfil solicitado antes de decidir. Pedidos de cadastro criam uma conta; pedidos administrativos ampliam o acesso de uma conta existente.</p><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="text-xs font-semibold text-slate-600">Buscar solicitante<input type="search" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Nome, e-mail ou protocolo" className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal" /></label><label className="text-xs font-semibold text-slate-600">Situação<select value={situacao} onChange={e=>setSituacao(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal"><option value="PENDENTE">Aguardando análise</option><option value="APROVADA">Aprovadas</option><option value="RECUSADA">Recusadas</option><option value="TODAS">Todas as situações</option></select></label><label className="text-xs font-semibold text-slate-600">Tipo de solicitação<select value={tipo} onChange={e=>setTipo(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal"><option value="TODOS">Todos os tipos</option><option value="CADASTRO">Cadastro no portal</option><option value="ADMINISTRACAO">Acesso administrativo</option></select></label></div></section>
    {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
    <section aria-labelledby="solicitacoes-titulo" className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-[0_4px_20px_rgba(24,91,50,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-800"><ResourceIcon name="shield" /></span><div><h2 id="solicitacoes-titulo" className="text-base font-semibold text-slate-800">Solicitações recebidas</h2><p className="mt-1 text-xs text-slate-500">Filtre pelos cabeçalhos e abra um pedido para consultar ou analisar.</p></div></div>
        <div className="flex flex-wrap items-center gap-3"><Button variant="secondary" disabled={carregando || ocupado} onClick={() => { setBusca(''); setSituacao('TODAS'); setTipo('TODOS'); setLimpar(v => v + 1); }} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16l-6 7v5l-4 4v-9L4 4ZM16 16l5 5m0-5-5 5" /></svg>}>Limpar filtros</Button><span aria-live="polite" className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">{carregando ? 'Carregando...' : `${visiveis} solicitação(ões)`}</span></div>
      </div>
      <AccessRequestsTable pedidos={filtrados} usuario={usuario} carregando={carregando} ocupado={ocupado} onOpen={abrirPedido} onCount={setVisiveis} limpar={limpar} />
    </section>
    <Modal open={!!selecionada} onClose={()=>{if(!ocupado)setParams({});}} busy={ocupado} title={selecionada?.tipo === 'ADMINISTRACAO' ? 'Analisar acesso administrativo' : 'Analisar solicitação de cadastro'} description={selecionada ? "Protocolo nº " + selecionada.id + " · Recebido em " + dataPedido(selecionada.criadaEm) : undefined} icon={<ResourceIcon name="shield" className="h-7 w-7" />} size="wide">{selecionada && <div className="space-y-5"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap gap-2"><RequestType pedido={selecionada} /><RequestStatus pedido={selecionada} /></div><p className="mt-3 font-bold text-slate-900">{selecionada.nome}</p><p className="mt-1 break-all text-sm text-slate-600">{selecionada.email}</p><p className="mt-3 text-xs text-slate-500">Prazo de análise: {dataPedido(selecionada.prazoAnalise)}</p></div><p className="text-sm font-semibold text-slate-800">Perfil solicitado: {accessProfiles[selecionada.perfil].label}</p><dl className="grid gap-4 sm:grid-cols-2">{Object.entries(selecionada.dados ?? {}).filter(([k,v])=>nomes[k] && v!=null && v!=='').map(([k,v])=><div key={k}><dt className="text-xs font-medium text-slate-500">{nomes[k]}</dt><dd className="mt-1 break-words text-sm text-slate-800">{Array.isArray(v) ? v.join(', ') : String(v)}</dd></div>)}</dl>{selecionada.status==='PENDENTE' ? podeDecidirAcesso(usuario, selecionada) ? <><label className="block text-sm font-semibold text-slate-700">Parecer da análise (opcional)<textarea value={motivo} maxLength={1000} onChange={e=>setMotivo(e.target.value)} disabled={ocupado} placeholder="Registre os critérios da decisão ou uma orientação ao solicitante." className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label><div className="flex flex-wrap justify-end gap-3"><Button variant="secondary" disabled={ocupado} onClick={()=>void decidir(false)}>Recusar</Button><Button disabled={ocupado} onClick={()=>void decidir(true)}>{ocupado ? 'Processando...' : selecionada.tipo === 'ADMINISTRACAO' ? 'Aprovar acesso administrativo' : 'Aprovar cadastro'}</Button></div></> : <p role="status" className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-900">Somente o administrador geral (root) pode decidir sobre o acesso administrativo.</p> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{selecionada.status==='APROVADA' ? 'Solicitação aprovada.' : 'Solicitação recusada.'} {selecionada.motivo}</p>}{erro && <p role="alert" className="text-sm text-red-800">{erro}</p>}</div>}</Modal>
  </main>;
}
