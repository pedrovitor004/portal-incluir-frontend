import { portalGridTheme, portalGridLocale } from "../../../../config/gridTheme";
import type { AcaoDocumento } from "../../../../config/documentActions";
import LoadingState from "../../../../components/common/LoadingState";
import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type TextFilterModel, type GridApi, type ColDef, type ICellRendererParams } from "ag-grid-community";
import type { Documento, FiltroDocumento } from "../../../../types/documento";
import { formatarDataDocumento, nomeTipoDocumento } from "../../../../config/documentos";
import DocumentActions from "./DocumentActions";
import DocumentNameCell from "./DocumentNameCell";

ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef: ColDef<Documento> = { sortable: true, resizable: true, filter: "agTextColumnFilter", floatingFilter: true, cellDataType: false, minWidth: 130, flex: 1 };

type Props = { filtroSolicitado: { tipo: FiltroDocumento; limpar: boolean }; onTipoFiltrado: (tipo: FiltroDocumento) => void; documentos: Documento[]; carregando: boolean; onView: (doc: Documento) => void; onEdit: (doc: Documento) => void; onAction: (doc: Documento, acao: AcaoDocumento) => void; onFilter: (quantidade: number) => void; bloqueado: boolean };

export default function DocumentsTable({ filtroSolicitado, onTipoFiltrado, documentos, carregando, onView, onEdit, onAction, onFilter, bloqueado }: Props) {
  const [api, setApi] = useState<GridApi<Documento> | null>(null);
  useEffect(() => {
    if (!api || api.isDestroyed()) return;
    const modelo = filtroSolicitado.limpar ? {} : { ...api.getFilterModel() };
    if (filtroSolicitado.tipo === "TODOS") delete modelo.tipo;
    else modelo.tipo = { filterType: "text", type: "equals", filter: nomeTipoDocumento[filtroSolicitado.tipo] };
    api.setFilterModel(Object.keys(modelo).length ? modelo : null);
    api.paginationGoToFirstPage();
  }, [api, filtroSolicitado]);
  const columns = useMemo<ColDef<Documento>[]>(() => [
    { field: "nome", headerName: "Documento", minWidth: 220, flex: 1.4, tooltipField: "nome", cellRenderer: (p: ICellRendererParams<Documento>) => p.data ? <DocumentNameCell documento={p.data} /> : null },
    { field: "tipo", headerName: "Tipo", minWidth: 145, valueFormatter: p => p.value ? nomeTipoDocumento[p.value as Documento["tipo"]] : "", filterValueGetter: p => p.data ? nomeTipoDocumento[p.data.tipo] : "" },
    { field: "estudanteNome", headerName: "Estudante", minWidth: 210, flex: 1.7, tooltipField: "estudanteNome" },
    { field: "estudanteMatricula", headerName: "Matrícula", minWidth: 150 },
    { field: "dataRegistro", headerName: "Data de registro", minWidth: 165, sort: "desc", valueFormatter: p => formatarDataDocumento(p.value), filter: "agDateColumnFilter",
      filterParams: { comparator: (filtro: Date, value: string | null) => {
        if (!value) return -1;
        const data = new Date(`${value.slice(0, 10)}T00:00:00`);
        return data.getTime() === filtro.getTime() ? 0 : data < filtro ? -1 : 1;
      } } },
    { field: "status", headerName: "Status", minWidth: 155, cellRenderer: (p: ICellRendererParams<Documento>) => {
      const cor = p.data?.arquivado ? "bg-slate-100 text-slate-600" : p.data?.assinado ? "bg-sky-50 text-sky-800" : p.value === "Ativo" ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800";
      return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cor}`}>{p.value}</span>;
    } },
    { colId: "acoes", headerName: "Ações", pinned: "right", width: 208, minWidth: 208, maxWidth: 208, flex: 0, filter: false, floatingFilter: false, sortable: false, resizable: false,
      cellRenderer: (p: ICellRendererParams<Documento>) => p.data ? <DocumentActions documento={p.data} onView={onView} onEdit={onEdit} onAction={onAction} bloqueado={bloqueado} /> : null },
  ], [onView, onEdit, onAction, bloqueado]);
  return <div className="portal-data-grid h-[540px] min-h-80 w-full">
    <AgGridReact<Documento>
      loadingOverlayComponent={() => <LoadingState compact label="Carregando documentos..." />}
      theme={portalGridTheme} rowData={documentos} columnDefs={columns} defaultColDef={defaultColDef}
      getRowId={p => p.data.chave} loading={carregando} pagination paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]}
      onGridReady={e => setApi(e.api)}
      onFilterChanged={e => {
        onFilter(e.api.getDisplayedRowCount());
        const modelo = e.api.getColumnFilterModel<TextFilterModel>("tipo");
        const tipo = Object.entries(nomeTipoDocumento).find(([, nome]) => (modelo?.type === "equals" || modelo?.type === "contains") && modelo.filter === nome)?.[0] as FiltroDocumento | undefined;
        onTipoFiltrado(tipo ?? "TODOS");
        e.api.paginationGoToFirstPage();
      }} onRowDataUpdated={e => onFilter(e.api.getDisplayedRowCount())}
      localeText={{ ...portalGridLocale, noRowsToShow: "Nenhum documento para exibir.", loadingOoo: "Carregando documentos..." }}
    />
  </div>;
}
