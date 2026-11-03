import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type GridApi, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { portalGridTheme, portalGridLocale } from "../../../../config/gridTheme";
import { accessProfiles } from "../../../../config/access";
import { podeDecidirAcesso } from "../../../../services/solicitacoesAcessoService";
import { RequestStatus, RequestType } from "../../../../components/notifications/accessRequestPresentation";
import { dataPedido } from "../../../../components/notifications/accessRequestDate";
import ResourceIcon from "../../../../components/icons/ResourceIcon";
import LoadingState from "../../../../components/common/LoadingState";
import type { SolicitacaoAcesso, Usuario } from "../../../../types/auth";

ModuleRegistry.registerModules([AllCommunityModule]);
const defaultColDef: ColDef<SolicitacaoAcesso> = { sortable: true, resizable: true, filter: "agTextColumnFilter", floatingFilter: true, cellDataType: false, minWidth: 150, flex: 1 };
const status = { PENDENTE: "Aguardando análise", APROVADA: "Aprovada", RECUSADA: "Recusada" };
type Props = { pedidos: SolicitacaoAcesso[]; usuario: Usuario | null; carregando: boolean; ocupado: boolean; onOpen: (pedido: SolicitacaoAcesso) => void; onCount: (total: number) => void; limpar: number };

export default function AccessRequestsTable({ pedidos, usuario, carregando, ocupado, onOpen, onCount, limpar }: Props) {
  const [api, setApi] = useState<GridApi<SolicitacaoAcesso> | null>(null);
  useEffect(() => {
    if (!api || api.isDestroyed() || !limpar) return;
    api.setFilterModel(null);
    api.paginationGoToFirstPage();
  }, [api, limpar]);
  const columns = useMemo<ColDef<SolicitacaoAcesso>[]>(() => [
    { field: "id", headerName: "Protocolo", minWidth: 120, width: 120, flex: 0, filter: "agNumberColumnFilter", valueFormatter: p => `#${p.value}` },
    { field: "nome", headerName: "Solicitante", minWidth: 250, flex: 1.7, tooltipField: "nome", cellRenderer: (p: ICellRendererParams<SolicitacaoAcesso>) => p.data ? <div className="flex h-full min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-800"><ResourceIcon name="students" className="h-4 w-4" /></span><span className="truncate font-semibold text-slate-700">{p.data.nome}</span></div> : null },
    { field: "email", headerName: "E-mail", minWidth: 240, tooltipField: "email" },
    { field: "tipo", headerName: "Tipo de solicitação", minWidth: 220, filterValueGetter: p => p.data?.tipo === "ADMINISTRACAO" ? "Acesso administrador" : "Cadastro no portal", cellRenderer: (p: ICellRendererParams<SolicitacaoAcesso>) => p.data ? <RequestType pedido={p.data} /> : null },
    { field: "perfil", headerName: "Perfil solicitado", minWidth: 200, valueFormatter: p => p.data ? accessProfiles[p.data.perfil].label : "", filterValueGetter: p => p.data ? accessProfiles[p.data.perfil].label : "" },
    { field: "status", headerName: "Situação", minWidth: 210, filterValueGetter: p => p.data ? `${status[p.data.status]}${p.data.status === "PENDENTE" && p.data.atrasada ? " Prazo ultrapassado" : ""}` : "", cellRenderer: (p: ICellRendererParams<SolicitacaoAcesso>) => p.data ? <RequestStatus pedido={p.data} /> : null },
    { field: "criadaEm", headerName: "Solicitada em", minWidth: 185, valueFormatter: p => dataPedido(p.value), filterValueGetter: p => p.data ? dataPedido(p.data.criadaEm) : "" },
    { field: "prazoAnalise", headerName: "Prazo de análise", minWidth: 185, valueFormatter: p => dataPedido(p.value), filterValueGetter: p => p.data ? dataPedido(p.data.prazoAnalise) : "" },
    { colId: "acoes", headerName: "Ações", pinned: "right", minWidth: 100, maxWidth: 100, width: 100, flex: 0, sortable: false, resizable: false, filter: false, floatingFilter: false,
      cellRenderer: (p: ICellRendererParams<SolicitacaoAcesso>) => {
        if (!p.data) return null;
        const pedido = p.data;
        const analisar = podeDecidirAcesso(usuario, pedido);
        const label = analisar ? "Analisar solicitação" : pedido.status === "PENDENTE" ? "Ver solicitação" : "Ver decisão";
        return <div className="flex h-full items-center"><button type="button" disabled={ocupado || carregando} aria-label={`${label} de ${pedido.nome}, protocolo ${pedido.id}`} title={label} onClick={() => onOpen(pedido)} className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transform-none ${analisar ? "bg-green-50 text-green-800 ring-green-100 hover:bg-green-100" : "bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-100"}`}>
          {analisar ? <ResourceIcon name="shield" className="h-4 w-4" /> : <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>}
        </button></div>;
      } },
  ], [usuario, ocupado, carregando, onOpen]);
  return <div className="portal-data-grid h-[540px] min-h-80 w-full"><AgGridReact<SolicitacaoAcesso>
    onGridReady={e => { setApi(e.api); onCount(e.api.getDisplayedRowCount()); }} theme={portalGridTheme} localeText={{ ...portalGridLocale, noRowsToShow: "Nenhuma solicitação para os filtros selecionados." }}
    rowData={pedidos} columnDefs={columns} defaultColDef={defaultColDef} getRowId={p => String(p.data.id)}
    loading={carregando} loadingOverlayComponent={() => <LoadingState compact label="Consultando solicitações..." />}
    tooltipShowDelay={300} enableCellTextSelection ensureDomOrder
    pagination paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]}
    onFilterChanged={e => { onCount(e.api.getDisplayedRowCount()); e.api.paginationGoToFirstPage(); }} onRowDataUpdated={e => onCount(e.api.getDisplayedRowCount())}
  /></div>;
}
