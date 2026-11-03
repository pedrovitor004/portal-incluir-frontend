import type { ReactNode } from "react";
import { camposPea } from "../../services/cadastroPeaValidation";
import type { AdaptacaoPedagogicaConteudo } from "../../types/adaptacaoPedagogica";
type Props = { conteudo: AdaptacaoPedagogicaConteudo; onChange: (campo: keyof AdaptacaoPedagogicaConteudo, valor: string) => void; identificacao?: ReactNode };
const campoClass = "mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500";
export default function PeaFields({ conteudo, onChange, identificacao }: Props) {
  function campo(indice: number) {
    const c = camposPea[indice]; const id = `pea-${c.name}`;
    const props = { id, name: c.name, value: conteudo[c.name], required: true, maxLength: c.limite, "aria-describedby": `${id}-limite` };
    return <label key={c.name} className="block text-sm font-medium text-slate-700" htmlFor={id}>{c.label} *
      {indice < 2 ? <input {...props} className={campoClass} onChange={e => onChange(c.name, e.target.value)} />
        : <textarea {...props} className={`${campoClass} min-h-[120px] resize-y`} rows={5} onChange={e => onChange(c.name, e.target.value)} />}
      <span id={`${id}-limite`} className="mt-1 block text-xs font-normal text-slate-500">{conteudo[c.name].length}/{c.limite} caracteres</span>
    </label>;
  }
  return <>
    <section aria-labelledby="pea-identificacao" className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
      <h2 id="pea-identificacao" className="text-lg font-semibold text-slate-900">1. Identificação</h2>
      <div className="grid gap-4 sm:grid-cols-2">{identificacao}{campo(0)}{campo(1)}</div>
    </section>
    <section aria-labelledby="pea-conteudo" className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
      <h2 id="pea-conteudo" className="text-lg font-semibold text-slate-900">2. Planejamento pedagógico</h2>
      {camposPea.slice(2).map((_,indice) => campo(indice+2))}
    </section>
  </>;
}
