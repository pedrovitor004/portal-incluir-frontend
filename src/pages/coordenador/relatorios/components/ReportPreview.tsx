import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import type { CampoRelatorio, LinhaRelatorio, RelatorioInstitucional } from "../../../../types/relatorio";
import { camposRelatorio } from "../../../../config/relatorios";
import { portalGridLocale, portalGridTheme } from "../../../../config/gridTheme";
import LoadingState from "../../../../components/common/LoadingState";
ModuleRegistry.registerModules([AllCommunityModule]);
const colunaPadrao: ColDef<LinhaRelatorio> = { sortable: true, resizable: true, minWidth: 125, flex: 1, filter: false };
export default function ReportPreview({ relatorio, campos, carregando = false }: { relatorio: RelatorioInstitucional | null; campos: CampoRelatorio[]; carregando?: boolean }) {
  const columns = useMemo<ColDef<LinhaRelatorio>[]>(() => [
    { field: "curso", headerName: "Curso", minWidth: 260, flex: 2.5, tooltipField: "curso", comparator: (a: string, b: string) => a.localeCompare(b, "pt-BR") },
    ...camposRelatorio.filter(c => campos.includes(c.id)).map(c => ({ field: c.id, headerName: c.titulo, headerClass: "ag-right-aligned-header", cellClass: "ag-right-aligned-cell", valueFormatter: ({ value }: { value: number }) => typeof value === "number" ? value.toLocaleString("pt-BR") : "—" })),
  ], [campos]);
  const totais = useMemo(() => relatorio?.linhas.length ? [relatorio.total] : [], [relatorio]);
  if (!campos.length) return <p role="status" className="p-8 text-center text-sm text-slate-500">Escolha as informações em Configurar relatório.</p>;
  return <div className="portal-data-grid h-[440px] min-h-80 w-full" aria-label="Indicadores do relatório por curso">
    <AgGridReact<LinhaRelatorio>
      theme={portalGridTheme} columnDefs={columns} defaultColDef={colunaPadrao}
      rowData={relatorio?.linhas ?? []} pinnedBottomRowData={totais} loading={carregando}
      getRowId={p => p.rowPinned ? "__total_relatorio" : p.data.curso} pagination paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]}
      getRowStyle={p => p.node.rowPinned ? { backgroundColor: "#e8f5e9", color: "#205e2b", fontWeight: "600" } : undefined}
      loadingOverlayComponent={() => <LoadingState compact label="Carregando relatório..." />}
      localeText={{ ...portalGridLocale, noRowsToShow: "Nenhum estudante encontrado para os filtros selecionados.", loadingOoo: "Carregando relatório..." }}
    />
  </div>;
}
