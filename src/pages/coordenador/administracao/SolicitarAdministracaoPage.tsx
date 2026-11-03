import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { solicitacoesAcessoService } from '../../../services/solicitacoesAcessoService';
import type { SolicitacaoAcesso } from '../../../types/auth';
import { mensagemErro } from '../../../services/apiError';
import { notificationService } from '../../../services/notificationService';
import { alertaPadrao } from '../../../services/alertaPadrao';
import { RequestStatus } from '../../../components/notifications/accessRequestPresentation';
import { dataPedido } from '../../../components/notifications/accessRequestDate';
import ResourceIcon from '../../../components/icons/ResourceIcon';
import Button from '../../../components/common/Button';
import LoadingState from '../../../components/common/LoadingState';
export default function SolicitarAdministracaoPage() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<SolicitacaoAcesso[]>([]);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  const enviando = useRef(false);
  useEffect(() => {
    const c = new AbortController();
    solicitacoesAcessoService.minhas(c.signal).then(p => { if (!c.signal.aborted) { setPedidos(p.filter(s => s.tipo === 'ADMINISTRACAO')); setErro(''); } }).catch(e => { if (!c.signal.aborted) { const mensagem = mensagemErro(e); setErro(mensagem); void notificationService.error(mensagem); } }).finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
  }, [versao]);
  const pendente = pedidos.find(p => p.status === 'PENDENTE');
  const aprovado = usuario?.root || usuario?.administracaoAprovada;
  async function solicitar() {
    if (enviando.current || pendente || aprovado || carregando || erro) return;
    enviando.current = true; setOcupado(true); setErro('');
    try {
      const confirmacao = await alertaPadrao({ titleText: 'Solicitar acesso administrativo?', text: 'Seu pedido será enviado ao administrador geral para análise. O envio não libera acesso automaticamente.', icon: 'question', showCancelButton: true, confirmButtonText: 'Enviar solicitação' });
      if (!confirmacao.isConfirmed) return;
      const p = await solicitacoesAcessoService.solicitarAdministracao();
      setPedidos(atuais => [p, ...atuais.filter(a => a.id !== p.id)]);
      window.dispatchEvent(new Event('portal:access-requests-changed'));
      await alertaPadrao({ titleText: 'Solicitação registrada', text: `Protocolo nº ${p.id}. Acompanhe a análise nesta página.`, icon: 'success' });
    } catch (e) { const mensagem = mensagemErro(e); setErro(mensagem); await alertaPadrao({ titleText: 'Não foi possível enviar a solicitação', text: mensagem, icon: 'error' }); }
    finally { enviando.current = false; setOcupado(false); }
  }
  return <main className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-green-800">Gestão de acesso</p><h1 className="mt-2 text-2xl font-bold text-primary">Solicitar acesso administrativo</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Acompanhe a autorização para atuar na administração do portal. Cada pedido é analisado pelo administrador geral (root).</p></div><Button variant="secondary" disabled={ocupado || carregando} onClick={() => { setCarregando(true); setVersao(v => v + 1); }}>Atualizar situação</Button></header>
    <section className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-sm"><div className="flex items-start gap-4 border-b border-slate-100 bg-gradient-to-br from-green-50 to-white p-6"><span className="rounded-2xl bg-white p-3 text-green-800 ring-1 ring-green-100"><ResourceIcon name="shield" className="h-7 w-7" /></span><div><h2 className="text-lg font-bold text-slate-800">Autorização administrativa</h2><p className="mt-1 text-sm leading-6 text-slate-600">O acesso permite atuar em áreas como permissões, auditorias e análise de cadastros, conforme as autorizações da sua conta.</p></div></div><div className="grid gap-6 p-6 md:grid-cols-2"><div><h3 className="text-sm font-bold text-slate-800">Como funciona</h3><ol className="mt-4 space-y-4">{['Envie a solicitação com sua conta institucional.', 'O administrador geral analisa o pedido em até 48 horas.', 'Consulte aqui a situação e o parecer da análise.'].map((texto, i) => <li key={texto} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-800">{i + 1}</span>{texto}</li>)}</ol></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conta solicitante</p><p className="mt-2 font-bold text-slate-800">{usuario?.nome}</p><p className="mt-1 break-all text-sm text-slate-500">{usuario?.email}</p>{carregando ? <LoadingState compact label="Consultando autorização..." /> : <div role="status" className="mt-5 space-y-3">{aprovado ? <p className="rounded-lg bg-green-100 p-3 text-sm font-semibold text-green-900">Seu acesso administrativo está autorizado.</p> : pendente ? <><RequestStatus pedido={pendente} /><p className="text-sm leading-6 text-slate-600">Protocolo nº {pendente.id}. Prazo de análise: {dataPedido(pendente.prazoAnalise)}. Você pode acompanhar o pedido nesta página.</p></> : <><p className="text-sm leading-6 text-slate-600">Envie seu pedido para iniciar a análise da autorização.</p><Button disabled={ocupado || !!erro} onClick={() => void solicitar()}>{ocupado ? 'Enviando solicitação...' : 'Solicitar autorização administrativa'}</Button></>}</div>}</div></div></section>
    {erro && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{erro} <button type="button" disabled={ocupado || carregando} onClick={() => { setCarregando(true); setVersao(v => v + 1); }} className="min-h-11 font-semibold underline">Tentar novamente</button></div>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-800">Histórico das suas solicitações</h2><p className="mt-1 text-xs text-slate-500">Protocolos e decisões sobre o acesso administrativo.</p></div>{!carregando && !erro && !pedidos.length && <p className="p-6 text-sm text-slate-500">Você ainda não enviou uma solicitação de acesso administrativo.</p>}<div className="divide-y divide-slate-100">{[...pedidos].sort((a,b) => Date.parse(b.criadaEm) - Date.parse(a.criadaEm)).map(p => <article key={p.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-800">Protocolo nº {p.id}</h3><RequestStatus pedido={p} /></div><p className="mt-3 text-xs text-slate-500">Solicitado em {dataPedido(p.criadaEm)}{p.analisadaEm && ` · Analisado em ${dataPedido(p.analisadaEm)}`}</p>{p.motivo && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700"><strong>Parecer da análise: </strong>{p.motivo}</p>}</article>)}</div></section>
  </main>;
}
