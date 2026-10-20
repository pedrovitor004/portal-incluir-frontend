import { ClipboardIcon, StudentsIcon } from "../../../components/icons/AppIcons";
import { colorThemes } from "../../../config/uiThemes";

const cards = [
  { titulo: 'Estudantes acompanhados', descricao: 'Acompanhe os estudantes no contexto da sua atuação profissional.', Icon: StudentsIcon, tom: 'green' },
  { titulo: 'Atendimentos', descricao: 'Organize os registros de acompanhamento dos estudantes.', Icon: ClipboardIcon, tom: 'amber' },
] as const;

export default function DashboardSummary() {
  return <section aria-label="Áreas de atuação" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map(({ titulo, descricao, Icon, tom }) => <article key={titulo} style={colorThemes[tom]} className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dce5dc] border-l-4 border-l-[var(--accent-main)] bg-white p-5 shadow-[0_4px_20px_rgba(24,91,50,0.05)] sm:p-6">
      <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--accent-soft)] opacity-60" />
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-main)] shadow-sm ring-1 ring-black/5"><Icon className="h-9 w-9" /></span>
      <h2 className="min-h-10 text-sm font-semibold leading-snug text-slate-700">{titulo}</h2>
      <p className="mb-5 mt-2 flex-1 text-sm leading-relaxed text-slate-500">{descricao}</p>
      <span className="rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-xs font-semibold text-[var(--accent-main)]">Em breve</span>
    </article>)}
  </section>;
}
