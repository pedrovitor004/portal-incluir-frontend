import { camposRelatorio } from "../../config/relatorios";
import type { BaseRelatorio, CampoRelatorio, EstudanteRelatorio, FiltrosRelatorio, LinhaRelatorio, ModeloRelatorio, RelatorioInstitucional } from "../../types/relatorio";
export function filtrarEstudantes(base: BaseRelatorio, filtros: FiltrosRelatorio): EstudanteRelatorio[] {
  return base.estudantes.filter(e => (!filtros.curso || e.curso === filtros.curso) && (!filtros.ingresso || e.ingresso === filtros.ingresso) && (!filtros.situacao || (filtros.situacao === "Concluído" ? e.concluido : e.situacao === filtros.situacao)) && (!filtros.documento || (filtros.documento === "pei" ? e.pei : filtros.documento === "plano" ? e.planoAcao : !e.pei && !e.planoAcao)));
}
export function consolidar(estudantes: EstudanteRelatorio[]): LinhaRelatorio[] {
  const cursos = new Map<string, LinhaRelatorio>();
  for (const e of estudantes) {
    const linha = cursos.get(e.curso) || { curso: e.curso, total: 0, ativos: 0, inativos: 0, concluidos: 0, comPei: 0, comPlano: 0 };
    linha.total++; if (e.situacao === "Ativo") linha.ativos++; if (e.situacao === "Inativo") linha.inativos++; if (e.concluido) linha.concluidos++;
    if (e.pei) linha.comPei++; if (e.planoAcao) linha.comPlano++;
    cursos.set(e.curso, linha);
  }
  return [...cursos.values()].sort((a,b) => a.curso.localeCompare(b.curso, "pt-BR"));
}
export function montarRelatorio(base: BaseRelatorio, filtros: FiltrosRelatorio, campos: CampoRelatorio[], modelo: ModeloRelatorio, titulo: string): RelatorioInstitucional {
  const selecionados = camposRelatorio.filter(c => campos.includes(c.id)).map(c => c.id);
  if (!selecionados.length) throw new Error("Selecione ao menos um indicador.");
  const estudantes = filtrarEstudantes(base, filtros);
  return { titulo: titulo.trim().slice(0, 120) || "Relatório institucional de acompanhamento discente", modelo, campos: selecionados, filtros: { ...filtros }, linhas: consolidar(estudantes), total: { ...(consolidar(estudantes.map(e => ({ ...e, curso: "Total" })))[0] || { total: 0, ativos: 0, inativos: 0, concluidos: 0, comPei: 0, comPlano: 0 }), curso: "Total" }, consultadoEm: base.consultadoEm, demonstracoesExcluidas: base.demonstracoesExcluidas };
}
export function tabelaExportacao(relatorio: RelatorioInstitucional) {
  const campos = camposRelatorio.filter(c => relatorio.campos.includes(c.id));
  return { cabecalho: ["Curso", ...campos.map(c => c.titulo)], linhas: [...relatorio.linhas, relatorio.total].map(l => [l.curso, ...campos.map(c => l[c.id])]) };
}
export function descreverFiltros(f: FiltrosRelatorio) {
  return `Curso: ${f.curso || "Todos"} | Ingresso: ${f.ingresso || "Todos"} | Situação: ${f.situacao || "Todas"} | Documento: ${{ pei: "Com PEI", plano: "Com plano de ação", sem: "Sem PEI e plano não arquivados" }[f.documento] || "Todos"}`;
}
