import { AuditIcon, OperacaoBadge } from "./AuditVisuals";
import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type GridApi, type ICellRendererParams } from "ag-grid-community";
import { portalGridLocale, portalGridTheme } from "../../../../config/gridTheme";
import LoadingState from "../../../../components/common/LoadingState";
import Button from "../../../../components/common/Button";
import type { FiltroRapidoAuditoria, RegistroAuditoria } from "../../../../types/auditoria";
import { areaAuditoria, identidadeAuditoria, operacoes } from "../auditPresentation";

ModuleRegistry.registerModules([AllCommunityModule]);
const defaultColDef: ColDef<RegistroAuditoria> = { sortable: true, resizable: true, cellDataType: false, filter: "agTextColumnFilter", floatingFilter: true, filterParams: { debounceMs: 250 }, minWidth: 140, flex: 1 };
type Props = { registros: RegistroAuditoria[]; carregando: boolean; confirmando: boolean; onView: (registro: RegistroAuditoria) => void; onRefresh: () => void; filtroRapido: FiltroRapidoAuditoria | null };
export default function AuditoriasTable({ registros, carregando, confirmando, onView, onRefresh, filtroRapido }: Props) {
  const [api, setApi] = useState<GridApi<RegistroAuditoria> | null>(null);
  const [visiveis, setVisiveis] = useState(0);
  const [filtrado, setFiltrado] = useState(false);
  useEffect(() => {
    if (!api || api.isDestroyed() || !filtroRapido) return;
    const hoje = new Date();
    const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")} 00:00:00`;
    api.setFilterModel(filtroRapido.tipo === "hoje" ? { data: { filterType: "date", type: "equals", dateFrom: data } } : filtroRapido.tipo === "area" && filtroRapido.tabela ? { tabela: { filterType: "text", type: "equals", filter: areaAuditoria(filtroRapido.tabela).nome } } : null);
    api.paginationGoToFirstPage();
  }, [api, filtroRapido]);
  const columns = useMemo<ColDef<RegistroAuditoria>[]>(() => [
    { field: "data", headerName: "Data e hora", minWidth: 180, filter: "agDateColumnFilter", comparator: (a: string, b: string) => Date.parse(a) - Date.parse(b), filterParams: { comparator: (filtro: Date, value: string) => { const data = new Date(value); data.setHours(0, 0, 0, 0); return data.getTime() - filtro.getTime(); }, browserDatePicker: true, inRangeInclusive: true }, cellRenderer: (p: ICellRendererParams<RegistroAuditoria>) => p.data ? <div className="flex h-full flex-col justify-center gap-1 leading-tight"><span className="font-medium text-slate-700">{new Date(p.data.data).toLocaleDateString("pt-BR")}</span><span className="text-xs text-slate-400">{new Date(p.data.data).toLocaleTimeString("pt-BR")}</span></div> : null },
    { field: "tabela", headerName: "Área auditada", minWidth: 250, flex: 1.6, valueFormatter: p => p.value ? areaAuditoria(p.value).nome : "", filterValueGetter: p => p.data ? areaAuditoria(p.data.tabela).nome : "", cellRenderer: (p: ICellRendererParams<RegistroAuditoria>) => {
      if (!p.data) return null;
      const area = areaAuditoria(p.data.tabela);
      return <div className="flex h-full items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${area.cor}`}><AuditIcon tipo={area.icone} className="h-[18px] w-[18px]" /></span><div className="min-w-0 leading-tight"><p className="truncate font-semibold text-slate-700">{area.nome}</p><p className="mt-1 truncate text-[11px] text-slate-400">Histórico de {area.nome.toLocaleLowerCase("pt-BR")}</p></div></div>;
    }, tooltipValueGetter: p => p.data ? areaAuditoria(p.data.tabela).nome : "" },
    { colId: "registro", headerName: "Registro", minWidth: 160, flex: 1.1, valueGetter: p => p.data ? identidadeAuditoria(p.data) : "", tooltipValueGetter: p => p.value, cellClass: "font-medium text-slate-600" },
    { field: "operacao", headerName: "Operação", minWidth: 160, valueFormatter: p => operacoes[p.value as RegistroAuditoria["operacao"]] ?? "", filterValueGetter: p => p.data ? operacoes[p.data.operacao] : "", cellRenderer: (p: ICellRendererParams<RegistroAuditoria>) => p.data ? <OperacaoBadge operacao={p.data.operacao} /> : null },
    { field: "revisao", headerName: "Revisão", minWidth: 130, flex: .7, filter: "agNumberColumnFilter", valueFormatter: p => `#${p.value}`, cellClass: "font-semibold text-slate-500" },
    { colId: "acoes", headerName: "Detalhes", pinned: "right", width: 154, minWidth: 154, maxWidth: 154, flex: 0, filter: false, floatingFilter: false, sortable: false, resizable: false, cellRenderer: (p: ICellRendererParams<RegistroAuditoria>) => {
      const registro = p.data;
      return registro ? <button type="button" disabled={carregando} onClick={() => onView(registro)} aria-label={`Ver detalhes da revisão ${registro.revisao}, ${areaAuditoria(registro.tabela).nome}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-semibold leading-normal text-green-800 transition hover:border-green-300 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:opacity-50"><AuditIcon tipo="olho" className="h-4 w-4" />Ver detalhes</button> : null;
    } },
  ], [carregando, onView]);
  return <section aria-label="Registros de auditoria" aria-busy={carregando} className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-[0_4px_20px_rgba(24,91,50,0.04)]">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3"><span className="hidden h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-primary sm:flex"><AuditIcon tipo="historico" /></span><div><h2 className="text-base font-semibold text-slate-800">Histórico de auditorias</h2><p className="mt-1 text-xs text-slate-500">Use os filtros das colunas para explorar os registros do sistema.</p></div></div>
      <div className="flex flex-wrap items-center gap-2"><span aria-live="polite" className="mr-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">{carregando ? "Consultando..." : `${visiveis.toLocaleString("pt-BR")} ${filtrado ? "de " + registros.length.toLocaleString("pt-BR") + " " : ""}registro(s)`}</span><Button variant="secondary" disabled={carregando || !filtrado} icon={<AuditIcon tipo="filtro" />} onClick={() => { api?.setFilterModel(null); }}>Limpar filtros</Button><Button variant="secondary" disabled={carregando || confirmando} onClick={onRefresh} icon={<AuditIcon tipo="atualizar" className={carregando ? "animate-spin motion-reduce:animate-none" : ""} />}>{carregando ? "Atualizando..." : "Atualizar"}</Button></div>
    </div>
    <div id="auditorias-historico" className="portal-data-grid [&_.ag-row]:cursor-pointer h-[620px] min-h-80 w-full">
      <AgGridReact<RegistroAuditoria> theme={portalGridTheme} rowData={registros} columnDefs={columns} defaultColDef={defaultColDef}
        getRowId={p => JSON.stringify([p.data.tabela, p.data.revisao, Object.entries(p.data.identidade).sort(([a], [b]) => a.localeCompare(b))])}
        loading={carregando} loadingOverlayComponent={() => <LoadingState compact label="Consultando histórico de auditorias..." />}
        onGridReady={e => setApi(e.api)} onModelUpdated={e => { setVisiveis(e.api.getDisplayedRowCount()); setFiltrado(e.api.isAnyFilterPresent()); }}
        onFilterChanged={e => e.api.paginationGoToFirstPage()}
        onRowClicked={e => { if (e.data && !carregando && !(e.event?.target instanceof Element && e.event.target.closest("button"))) onView(e.data); }}
        onCellKeyDown={e => { const evento = e.event as KeyboardEvent | undefined; if (evento?.key === "Enter" && "colDef" in e && e.colDef.colId !== "acoes" && e.data && !carregando) { evento.preventDefault(); onView(e.data); } }}
        pagination paginationPageSize={20} paginationPageSizeSelector={[10, 20, 50, 100]}
        tooltipShowDelay={300} enableCellTextSelection ensureDomOrder
        localeText={{ ...portalGridLocale, noRowsToShow: "Nenhum registro encontrado para os filtros selecionados.", loadingOoo: "Consultando auditorias..." }} />
    </div>
  </section>;
}
