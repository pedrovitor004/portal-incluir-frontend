import type { SolicitacaoAcesso } from '../../types/auth';
const statusPedido = { PENDENTE: 'Aguardando análise', APROVADA: 'Aprovada', RECUSADA: 'Recusada' };
export function RequestType({ pedido }: { pedido: Pick<SolicitacaoAcesso, 'tipo'> }) {
  const administrativo = pedido.tipo === 'ADMINISTRACAO';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${administrativo ? 'bg-violet-50 text-violet-800 ring-violet-200' : 'bg-green-50 text-green-800 ring-green-200'}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d={administrativo ? 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3ZM8 12l3 3 5-6' : 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM20 8v6M17 11h6'} /></svg>{administrativo ? 'Acesso administrador' : 'Cadastro no portal'}</span>;
}
export function RequestStatus({ pedido }: { pedido: SolicitacaoAcesso }) {
  const atrasada = pedido.status === 'PENDENTE' && pedido.atrasada;
  const cor = pedido.status === 'APROVADA' ? 'bg-green-50 text-green-800 ring-green-200' : pedido.status === 'RECUSADA' ? 'bg-red-50 text-red-800 ring-red-200' : atrasada ? 'bg-amber-50 text-amber-900 ring-amber-200' : 'bg-sky-50 text-sky-800 ring-sky-200';
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${cor}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{atrasada ? 'Prazo ultrapassado' : statusPedido[pedido.status]}</span>;
}
