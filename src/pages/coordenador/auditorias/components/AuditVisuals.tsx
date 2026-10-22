import type { OperacaoAuditoria } from "../../../../types/auditoria";
import { coresOperacao, operacoes } from "../auditPresentation";
const caminhos: Record<string, string> = {
  usuario: "M20 21v-2a6 6 0 0 0-12 0v2M18 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M3 8v6m-3-3h6",
  estudante: "m2 9 10-6 10 6-10 6ZM6 12v6c4 3 8 3 12 0v-6M22 9v8",
  professor: "M3 3h18v12h-5M7 15H3V3M7 21v-2a4 4 0 0 1 8 0v2M11 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M16 7h2M16 10h2",
  equipe: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-4",
  escudo: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6",
  plano: "M9 4H5v17h14V4h-4M9 3h6v3H9ZM8 11l1 1 2-2M13 11h3M8 16l1 1 2-2M13 16h3",
  documento: "M14 3H5v18h14V8ZM14 3v5h5M9 13h6M9 17h4",
  adaptacao: "M4 4h6v6H4ZM14 14h6v6h-6ZM14 4h6v6h-6ZM4 14h6v6H4M7 7h0M17 17h0",
  tabela: "M4 4h16v16H4ZM4 10h16M10 10v10",
  atualizar: "M20 7v5h-5M4 17v-5h5M5.5 8a7 7 0 0 1 11.5-3L20 8M4 16l3 3a7 7 0 0 0 11.5-3",
  relogio: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2",
  historico: "M3 4v5h5M4 8a9 9 0 1 1-1 8M12 7v5l3 2",
  atividade: "M3 12h4l3-7 4 14 3-7h4",
  olho: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  fechar: "m6 6 12 12M18 6 6 18",
  filtro: "M4 5h16l-6 7v6l-4 2v-8ZM17 17l5 5m0-5-5 5",
  seta: "M5 12h14m-5-5 5 5-5 5",
};
export function AuditIcon({ tipo, className = "h-5 w-5" }: { tipo: string; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={caminhos[tipo] ?? caminhos.tabela} /></svg>;
}
export function OperacaoBadge({ operacao }: { operacao: OperacaoAuditoria }) {
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold leading-none ring-1 ring-inset ${coresOperacao[operacao]}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{operacoes[operacao]}</span>;
}
