import { Link } from "react-router";
import { destinoNotificacao } from "../../services/notificacoesService";
import { nomesEtapas } from "../../services/notificacoesService";
import { accessProfiles } from "../../config/access";
import type { useNotificacoes } from "../../hooks/useNotificacoes";
export default function NotificationsList({ dados }: { dados: ReturnType<typeof useNotificacoes> }) {
  const { usuario, avisos, solicitacoes, erro, carregando, ler, atualizar } = dados;
  return <div className="max-h-[min(30rem,65dvh)] overflow-y-auto overscroll-contain">
    <div className="flex justify-end border-b border-slate-100 px-4"><button type="button" onClick={atualizar} className="min-h-11 text-xs font-semibold text-green-800">Atualizar notificações</button></div>
    {carregando && <p role="status" className="p-4 text-sm text-slate-500">Consultando notificações...</p>}
    {erro && <p role="alert" className="bg-amber-50 p-4 text-sm text-amber-900">{erro}</p>}
    {usuario && solicitacoes.length > 0 && <section className="border-b border-amber-200 bg-amber-50 p-4"><h3 className="text-sm font-semibold text-amber-950">Solicitações de acesso · {solicitacoes.length}</h3><ul className="mt-2 divide-y divide-amber-200">{solicitacoes.map(s=><li key={s.id} className="py-3"><p className="text-sm font-semibold text-slate-800">{s.nome} · {s.tipo === 'ADMINISTRACAO' ? 'Acesso administrativo' : 'Cadastro'}</p><p className="mt-1 text-xs text-slate-600">{s.atrasada ? `Solicitação feita há ${s.diasPendente} dias · Fora do prazo de 48 horas` : 'Aguardando análise em até 48 horas'}</p><Link to={`${accessProfiles[usuario.perfil].basePath}/administracao/solicitacoes?pedido=${s.id}`} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-green-800 underline">Clique para analisar</Link></li>)}</ul></section>}
    {!carregando && !erro && !avisos.length && !solicitacoes.length && <p className="p-5 text-sm text-slate-500">Nenhuma notificação disponível.</p>}
    <ul className="divide-y divide-slate-100">{avisos.map(n => <li key={n.id} className={`break-words p-4 ${n.lida ? "" : "bg-green-50/60"}`}>
      <p className="text-sm font-semibold text-slate-800">{!n.lida && <span className="mr-2 text-green-700">Nova ·</span>}{nomesEtapas[n.etapa]} · {n.estudanteNome}</p>
      <p className="mt-1 text-xs text-slate-500">Encaminhado por {n.remetente}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{n.mensagem}</p>
      <time dateTime={n.criadaEm} className="mt-2 block text-xs text-slate-500">{new Date(n.criadaEm).toLocaleString("pt-BR")}</time>
      <div className="mt-2 flex flex-wrap gap-4">{usuario && <Link to={destinoNotificacao(n, usuario.perfil)} onClick={() => { if (!n.lida) void ler(n.id); }} className="inline-flex min-h-11 items-center text-sm font-semibold text-green-800 underline">Abrir etapa</Link>}{!n.lida && <button type="button" onClick={() => void ler(n.id)} className="min-h-11 text-xs font-semibold text-slate-600">Marcar como lida</button>}</div>
    </li>)}</ul>
  </div>;
}
