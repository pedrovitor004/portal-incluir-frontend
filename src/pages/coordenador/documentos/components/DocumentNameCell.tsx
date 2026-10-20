import { tiposDocumento } from "../../../../config/documentos";
import type { Documento } from "../../../../types/documento";

export default function DocumentNameCell({ documento }: { documento: Documento }) {
  const tipo = tiposDocumento.find(t => t.tipo === documento.tipo);
  return <div className="flex h-full min-w-0 items-center gap-3">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 ${tipo?.cor}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5"><path d={tipo?.icone} /></svg>
    </span>
    <span className="min-w-0 leading-tight"><span className="block truncate font-semibold text-slate-800">{documento.nome}</span><span className="mt-1 block truncate text-xs text-slate-500">Período {documento.periodo}</span></span>
  </div>;
}
