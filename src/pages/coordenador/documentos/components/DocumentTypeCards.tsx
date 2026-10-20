import { tiposDocumento } from "../../../../config/documentos";
import type { ConsultaDocumentos, FiltroDocumento } from "../../../../types/documento";
import { colorThemes, type ColorTheme } from "../../../../config/uiThemes";

const estilos: Record<FiltroDocumento, { tom: ColorTheme; borda: string; icone: string }> = {
  TODOS: { tom: "green", borda: "border-l-primary", icone: "bg-emerald-50 text-primary" },
  PEI: { tom: "blue", borda: "border-l-sky-500", icone: "bg-sky-50 text-sky-600" },
  ANAMNESE: { tom: "green", borda: "border-l-primary", icone: "bg-emerald-50 text-primary" },
  PLANO_ACAO: { tom: "amber", borda: "border-l-amber-500", icone: "bg-amber-50 text-amber-600" },
  RAI: { tom: "red", borda: "border-l-red-500", icone: "bg-red-50 text-red-500" },
};

type Props = { selecionado: FiltroDocumento; onSelect: (tipo: FiltroDocumento) => void; consulta: ConsultaDocumentos | null };

export default function DocumentTypeCards({ selecionado, onSelect, consulta }: Props) {
  return <section aria-label="Filtrar documentos por tipo" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
    {tiposDocumento.map(card => {
      const ativo = selecionado === card.tipo;
      const suportado = card.tipo === "TODOS" || card.tipo === "PEI" || card.tipo === "PLANO_ACAO";
      const disponivel = consulta && (card.tipo === "TODOS" ? consulta.tiposDisponiveis.length > 0 : consulta.tiposDisponiveis.includes(card.tipo));
      const quantidade = disponivel ? consulta.documentos.filter(d => card.tipo === "TODOS" || d.tipo === card.tipo).length : null;
      const estilo = estilos[card.tipo];
      return <button key={card.tipo} type="button" aria-label={`Filtrar: ${card.titulo}`} aria-pressed={ativo} onClick={() => onSelect(card.tipo)}
        style={colorThemes[estilo.tom]}
        className={`group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#dce5dc] border-l-4 bg-white p-5 text-left shadow-[0_4px_20px_rgba(24,91,50,0.05)] transition duration-200 hover:-translate-y-1 hover:bg-[#fbfefb] hover:shadow-[0_12px_28px_-10px_rgba(24,91,50,0.22)] active:translate-y-0 active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-main)] motion-reduce:transform-none sm:p-6 ${estilo.borda} ${ativo ? "ring-2 ring-[var(--accent-ring)]" : ""}`}>
        <span className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none ${estilo.icone}`}>
          <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={card.icone} /></svg>
        </span>
        <span aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 ${estilo.icone}`} />
        <span className="block min-h-10 text-sm font-semibold leading-snug text-slate-700">{card.titulo}</span>
        <span className="mt-3 block text-3xl font-semibold leading-none tracking-tight text-[#26332b] tabular-nums sm:text-4xl">{!consulta && suportado ? <span aria-label="Carregando total" className="inline-block h-8 w-12 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" /> : quantidade ?? "—"}</span>
        <span className="mt-2 min-h-8 text-xs leading-relaxed text-slate-500">{card.descricao}</span>
        {(!suportado || (consulta && !disponivel)) && <span className="mt-1 text-xs text-slate-500">{!suportado ? "Consulta em breve" : "Consulta indisponível"}</span>}
        <span className={`mt-5 flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors group-hover:bg-[var(--accent-main)] group-hover:text-white group-focus-visible:bg-[var(--accent-main)] group-focus-visible:text-white ${ativo ? "bg-[var(--accent-main)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent-main)]"}`}>
          {ativo ? "Filtro ativo" : "Filtrar documentos"}
          <svg aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={ativo ? "m5 12 4 4L19 6" : "M5 12h14m-6-6 6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </button>;
    })}
  </section>;
}
