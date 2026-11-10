import type { ConteudoAcademicoResponse, TipoConteudoAcademico } from "../../../types/conteudoAcademico";

export const tiposConteudo: Record<TipoConteudoAcademico, string> = {
  PROVA: "Prova", ATIVIDADE: "Atividade", MATERIAL_APOIO: "Material de apoio", OUTRO: "Outro",
};

export const campoConteudo = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export function filtrarConteudos(materiais: ConteudoAcademicoResponse[], busca: string, tipo: string, componente: string) {
  const termo = normalizar(busca.trim());
  return materiais.filter(m => (!tipo || m.tipo === tipo) && (!componente || m.componenteCurricular === componente)
    && normalizar([m.titulo, m.descricao, m.componenteCurricular, m.estudanteNome, m.estudanteMatricula].filter(Boolean).join(" ")).includes(termo));
}

export function ordenarPorCadastro(materiais: ConteudoAcademicoResponse[]) {
  return [...materiais].sort((a, b) => (Date.parse(b.dataCriacao) || 0) - (Date.parse(a.dataCriacao) || 0) || b.id - a.id);
}

export function tamanhoArquivo(bytes: number | null) {
  if (bytes === null) return "Tamanho não informado";
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

export function linkSeguro(link: string | null): string | undefined {
  if (!link) return;
  try {
    const url = new URL(link);
    if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch { /* Um link invalido nao deve ser apresentado como navegavel. */ }
}

export const coresConteudo = {
  ATIVIDADE: "bg-green-50 text-green-800",
  PROVA: "bg-amber-50 text-amber-800",
  MATERIAL_APOIO: "bg-sky-50 text-sky-800",
  OUTRO: "bg-slate-100 text-slate-700",
};
