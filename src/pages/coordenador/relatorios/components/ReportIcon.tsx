const paths = {
  tabela: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18",
  grafico: "M3 3v18h18M7 16v-5m5 5V7m5 9v-5",
  curso: "m2 9 10-5 10 5-10 5L2 9Zm4 2v6l6 3 6-3v-6M22 9v7",
  situacao: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM16 11l2 2 4-4",
  filtro: "M4 4h16l-6 7v6l-4 3v-9L4 4Z",
  voltar: "M19 12H5m6-6-6 6 6 6",
  fechar: "m6 6 12 12M18 6 6 18",
  info: "M12 11v6m0-10v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  check: "m5 12 4 4L19 6",
};
export default function ReportIcon({ name, className = "h-4 w-4" }: { name: keyof typeof paths; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={paths[name]} /></svg>;
}
