const caminhos = {
  geral: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  ATIVIDADE: "M9 5H5v16h14V5h-4M9 3h6v4H9zM8 12l2 2 5-5M8 18h8",
  PROVA: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5",
  MATERIAL_APOIO: "M12 5v16M3 3c4 0 6 0 9 2 3-2 5-2 9-2v16c-4 0-6 0-9 2-3-2-5-2-9-2z",
  OUTRO: "M3 7V4h6l2 3h10v13H3z",
  adicionar: "M12 5v14M5 12h14",
  atualizar: "M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2",
  visualizar: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  editar: "m16 3 5 5-12 12-6 1 1-6L16 3ZM14 5l5 5",
  excluir: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  limpar: "M4 4h16l-6 7v5l-4 4v-9L4 4M17 17l4 4m0-4-4 4",
};

export default function ConteudoIcone({ nome }: { nome: keyof typeof caminhos }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><path d={caminhos[nome]} /></svg>;
}
