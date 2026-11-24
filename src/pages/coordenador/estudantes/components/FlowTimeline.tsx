import { Link } from "react-router";

export type PassoTimeline = { id: string; titulo: string; resumo?: string; href?: string; concluido?: boolean };
export default function FlowTimeline({ passos, atual }: { passos: PassoTimeline[]; atual?: string }) {
  return <nav aria-label="Linha do tempo do cadastro" className="overflow-x-auto pb-2">
    <ol className="flex min-w-[520px] items-start py-3 sm:min-w-0">{passos.map((passo, i) => {
      const ativo = passo.id === atual;
      const circulo = <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] text-sm font-bold transition ${ativo ? "border-green-700 bg-green-700 text-white ring-4 ring-green-100" : passo.concluido ? "border-green-600 bg-green-50 text-green-800" : "border-slate-300 bg-white text-slate-500"}`}>{passo.concluido && !ativo ? "✓" : i + 1}</span>;
      return <li key={passo.id} className="relative flex min-w-0 flex-1 flex-col items-center px-2 text-center">
        {i < passos.length - 1 && <span aria-hidden="true" className={`absolute left-1/2 top-[18px] h-1 w-full ${passo.concluido ? "bg-green-500" : "bg-slate-200"}`} />}
        {passo.href ? <Link to={passo.href} aria-current={ativo ? "step" : undefined} className="group flex w-full flex-col items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700">{circulo}<span className={`mt-4 text-sm font-semibold group-hover:underline ${ativo ? "text-green-800" : "text-slate-700"}`}>{passo.titulo}</span></Link> : <><span aria-current={ativo ? "step" : undefined}>{circulo}</span><span className={`mt-4 text-sm font-semibold ${ativo ? "text-green-800" : "text-slate-600"}`}>{passo.titulo}</span></>}
        {passo.resumo && <span className="mt-1 max-w-40 text-xs leading-5 text-slate-500">{passo.resumo}</span>}
      </li>;
    })}</ol>
  </nav>;
}
