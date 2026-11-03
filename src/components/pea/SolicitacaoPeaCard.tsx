import type { ReactNode } from "react";
import type { SolicitacaoPeaResponse } from "../../types/solicitacaoPea";
import { nomesSituacaoPea } from "../../services/solicitacaoPeaModel";
import Button from "../common/Button";
type Props = { solicitacao: SolicitacaoPeaResponse; onViewPea?: (id: number) => void; children?: ReactNode };
export default function SolicitacaoPeaCard({ solicitacao: s, onViewPea, children }: Props) {
  return <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{s.contexto}</h3><p className="mt-1 text-sm text-slate-600">{s.estudante.nome} · Matrícula {s.estudante.matricula}</p><p className="mt-1 text-xs text-slate-500">Solicitado por {s.solicitanteNome} · {new Date(s.criadaEm).toLocaleString("pt-BR")}</p></div><span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">{nomesSituacaoPea[s.situacao] ?? s.situacao}</span></header>
    <p className="whitespace-pre-wrap break-words text-sm text-slate-700"><strong>Orientações: </strong>{s.orientacoes || "Nenhuma orientação adicional."}</p>
    {s.motivoCancelamento && <p className="whitespace-pre-wrap text-sm text-slate-700"><strong>Motivo do cancelamento: </strong>{s.motivoCancelamento}</p>}
    <ul className="divide-y divide-slate-100" aria-label="Andamento individual">{s.destinatarios.map(d => <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{d.professorNome} · {d.setorNoEnvio}</p><p className="text-sm text-slate-600">{nomesSituacaoPea[d.situacao]}{d.respondidaEm ? ` · ${new Date(d.respondidaEm).toLocaleString("pt-BR")}` : ""}</p></div>{d.peaId !== null && onViewPea && <Button variant="secondary" onClick={() => onViewPea(d.peaId!)}>Consultar PEA entregue</Button>}</li>)}</ul>
    {children}
  </article>;
}
