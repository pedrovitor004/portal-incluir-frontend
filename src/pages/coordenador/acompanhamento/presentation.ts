import type { AdaptacaoPedagogicaResponse } from "../../../types/adaptacaoPedagogica";
export const campoGestao = "mt-1.5 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 sm:text-sm focus:outline-2 focus:outline-primary disabled:bg-slate-50";
export const dataGestao = (data: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${data}T12:00:00Z`));

export function professoresComPeas(registros: AdaptacaoPedagogicaResponse[]) {
  return [...new Map(registros.map(p => [p.professorId, p.professorNome])).entries()].sort((a,b) => a[1].localeCompare(b[1]) || a[0] - b[0]);
}
export function filtrarPeasCoordenador(registros: AdaptacaoPedagogicaResponse[], professorId: string, situacao: string, busca: string) {
  const normalizar = (valor: string) => valor.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  return registros.filter(p => (!professorId || p.professorId === Number(professorId))
    && (situacao === "TODOS" || p.arquivado === (situacao === "ARQUIVADO"))
    && normalizar([p.estudanteNome, p.estudanteMatricula, p.estudanteCurso, p.professorNome, p.componenteCurricular, p.semestreAno].join(" ")).includes(normalizar(busca)))
    .sort((a,b) => (b.dataCriacao ?? "").localeCompare(a.dataCriacao ?? "") || b.id - a.id);
}
