import Button from "../../../../components/common/Button";
import type { BaseRelatorio, FiltrosRelatorio, ModeloRelatorio } from "../../../../types/relatorio";
import { filtrosIniciais } from "../../../../config/relatorios";
type Props = { base: BaseRelatorio | null; filtros: FiltrosRelatorio; onChange: (f: FiltrosRelatorio) => void; modelo: ModeloRelatorio; onModelo: (m: ModeloRelatorio) => void; disabled: boolean };
const input = "mt-1.5 min-h-11 w-full rounded-xl border border-[#dce5dc] bg-white px-3 py-2.5 text-sm font-normal text-slate-700 focus:outline-2 focus:outline-primary";
export default function ReportFilters({ base, filtros, onChange, modelo, onModelo, disabled }: Props) {
  return <section aria-label="Filtros do relatório" className="rounded-2xl border border-[#dce5dc] bg-white p-5">
    <fieldset disabled={disabled} className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1.5fr_1fr_1fr_auto] disabled:opacity-60"><legend className="sr-only">Selecionar relatório e filtros</legend>
      <label className="text-xs font-semibold text-slate-600">Relatório<select value={modelo} onChange={e => onModelo(e.target.value as ModeloRelatorio)} className={input}><option value="panorama">Estudantes por curso</option><option value="documentacao">Estudantes com documentos</option></select></label>
      <label className="text-xs font-semibold text-slate-600">Curso<select value={filtros.curso} onChange={e => onChange({ ...filtros, curso: e.target.value })} className={input}><option value="">Todos os cursos</option>{[...new Set(base?.estudantes.map(e => e.curso))].sort().map(c => <option key={c}>{c}</option>)}</select></label>
      <label className="text-xs font-semibold text-slate-600">Ingresso<select value={filtros.ingresso} onChange={e => onChange({ ...filtros, ingresso: e.target.value })} className={input}><option value="">Todos os períodos</option>{[...new Set(base?.estudantes.map(e => e.ingresso))].sort().reverse().map(c => <option key={c}>{c}</option>)}</select></label>
      <label className="text-xs font-semibold text-slate-600">Situação<select value={filtros.situacao} onChange={e => onChange({ ...filtros, situacao: e.target.value })} className={input}><option value="">Todas</option>{["Ativo", "Inativo", "Concluído"].map(c => <option key={c}>{c}</option>)}</select></label>
      <Button variant="secondary" onClick={() => onChange(filtrosIniciais)} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16l-6 7v5l-4 4v-9L4 4Zm12 12 5 5m0-5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>}>Limpar filtros</Button>
    </fieldset>
    {filtros.documento && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">Documento:</span><button type="button" disabled={disabled} onClick={() => onChange({ ...filtros, documento: "" })} className="rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-800" aria-label="Remover filtro de documento">{{ pei: "Com PEI", plano: "Com plano de ação", sem: "Sem PEI e plano não arquivados" }[filtros.documento]} <span aria-hidden="true">×</span></button></div>}

  </section>;
}
