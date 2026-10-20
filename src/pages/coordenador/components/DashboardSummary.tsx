import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { colorThemes, type ColorTheme } from "../../../config/uiThemes";
import type { DashboardCoordenadorData } from "../../../types/dashboard";

type StatCard = {
  title: string;
  tone: ColorTheme;
  metric: Exclude<keyof DashboardCoordenadorData, "estudantesRecentes">;
  borderColor: string;
  accent: string;
  iconPath: string;
};

const statCards: StatCard[] = [
  {
    title: "Estudantes ativos na instituição",
    metric: "estudantesAtivos",
    tone: "green",
    borderColor: "border-l-primary",
    accent: "bg-emerald-50 text-primary",
    iconPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  },
  {
    title: "Professores ativos",
    metric: "professoresAtivos",
    tone: "amber",
    borderColor: "border-l-amber-500",
    accent: "bg-amber-50 text-amber-600",
    iconPath: "M3 3h18v12h-6M7 15H3V3M7 21v-2a4 4 0 0 1 8 0v2M11 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M16 7h2M16 10h2",
  },
  {
    title: "Meus PEIs ativos",
    metric: "planosAtivos",
    tone: "blue",
    borderColor: "border-l-sky-500",
    accent: "bg-sky-50 text-sky-600",
    iconPath: "M14 3H5v18h14V8ZM14 3v5h5M9 13h6M9 17h4",
  },
  {
    title: "Meus PEIs arquivados",
    metric: "planosArquivados",
    tone: "red",
    borderColor: "border-l-red-500",
    accent: "bg-red-50 text-red-500",
    iconPath: "M3 3h18v5H3zM5 8v13h14V8M9 12h6",
  },
];


type Props = {
  dados: DashboardCoordenadorData | null;
  erro: string;
  carregando: boolean;
  onRetry: () => void;
};

export default function DashboardSummary({ dados, erro, carregando, onRetry }: Props) {
  const [selected, setSelected] = useState<StatCard | null>(null);
  const explanations = {
    estudantesAtivos: "Estudantes com cadastro ativo na instituição, que podem receber acompanhamento da equipe.",
    professoresAtivos: "Professores com cadastro ativo para participar do acompanhamento acadêmico dos estudantes.",
    planosAtivos: "Planos Educacionais Individualizados (PEIs) ativos. Eles organizam objetivos e adaptações para apoiar a aprendizagem de cada estudante.",
    planosArquivados: "Planos Educacionais Individualizados guardados no histórico. Eles não fazem parte dos planos ativos.",
  };
  const cards = statCards.map(card => ({
    ...card,
    value: dados ? String(dados[card.metric]) : "—",
  }));

  return (
    <>


      {erro && <div role="alert" className="text-sm text-red-700">{erro} <button className="underline" onClick={onRetry}>Tentar novamente</button></div>}
      {carregando && <p role="status">Carregando dashboard...</p>}
      {/* Indicadores */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores do sistema"
      >
        {cards.map((card) => (
          <button
            type="button"
            style={colorThemes[card.tone]}
            onClick={() => setSelected(card)}
            aria-haspopup="dialog"
            aria-label={`${card.title}: ${card.value}. Ver detalhes`}
            key={card.title}
            className={`group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#dce5dc] border-l-4 bg-white p-5 text-left shadow-[0_4px_20px_rgba(24,91,50,0.05)] transition duration-200 hover:-translate-y-1 hover:bg-[#fbfefb] hover:shadow-[0_12px_28px_-10px_rgba(24,91,50,0.22)] active:translate-y-0 active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-main)] motion-reduce:transform-none sm:p-6 ${card.borderColor}`}
          >
            <span className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none ${card.accent}`}>
              <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={card.iconPath} />
              </svg>
            </span>
            <span aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 ${card.accent}`} />
            <span className="block min-h-10 text-sm font-semibold leading-snug text-slate-700">
              {card.title}
            </span>

            <span className="mt-3 block text-3xl font-semibold leading-none tracking-tight text-[#26332b] tabular-nums sm:text-4xl">
              {card.value}
            </span>
            <span className="mt-5 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-[var(--accent-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-main)] transition-colors group-hover:bg-[var(--accent-main)] group-hover:text-white group-focus-visible:bg-[var(--accent-main)] group-focus-visible:text-white">Ver detalhes <svg aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          </button>
        ))}
      </section>
      <Modal tone={selected?.tone} open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? "Detalhes"} description="Entenda o que este indicador mostra." icon={selected ? <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={selected.iconPath} /></svg> : undefined}>
        {selected && <>
          <div className={`mb-6 flex items-center gap-5 rounded-2xl p-6 ${selected.accent}`}>
            <span className="text-5xl font-bold tracking-tight tabular-nums">{dados ? dados[selected.metric] : "—"}</span>
            <span className="font-semibold text-slate-700">{dados ? "Total informado no painel" : "Total ainda não disponível"}</span>
          </div>
          <h3 className="mb-2 font-bold text-[var(--accent-main)]">O que significa?</h3>
          <p className="text-slate-600">{explanations[selected.metric]}</p>
          {!dados ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-slate-600">{carregando ? "Estamos carregando as informações. Aguarde um momento." : "Não foi possível carregar este total. Feche esta janela e use Tentar novamente no painel."}</p>
            : <p className="mt-4 rounded-lg bg-slate-50 p-4 text-slate-600">{dados[selected.metric] === 0 ? "Nenhum registro foi contabilizado neste indicador." : "Este indicador apresenta um total. A lista completa de registros ainda não está disponível neste painel."}</p>}
        </>}
      </Modal>

    </>
  );
}
