import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { portalGridLocale, portalGridTheme } from "../../../../config/gridTheme";
import type { Documento } from "../../../../types/documento";
import type { AdaptacaoEstudante } from "../../../../types/perfilEstudante";
import { dataPerfil } from "../profilePresentation";
import { AuditIcon } from "../../auditorias/components/AuditVisuals";

ModuleRegistry.registerModules([AllCommunityModule]);
const padrao = { sortable: true, resizable: true, filter: "agTextColumnFilter", floatingFilter: true, minWidth: 150, flex: 1, cellDataType: false };
const locale = { ...portalGridLocale, noRowsToShow: "Nenhum registro encontrado para os filtros selecionados." };
function DetailsButton({ onClick, titulo }: { onClick: () => void; titulo: string }) { return <button type="button" onClick={onClick} aria-label={titulo} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-semibold text-green-800 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-green-700"><AuditIcon tipo="olho" className="h-4 w-4" />Ver detalhes</button>; }
export function StudentDocuments({ documentos, onView }: { documentos: Documento[]; onView: (documento: Documento) => void }) {
  const colunas = useMemo<ColDef<Documento>[]>(() => [
    { field: "nome", headerName: "Documento", minWidth: 200, cellRenderer: (p: ICellRendererParams<Documento>) => p.data ? <div className="flex h-full items-center gap-3"><span className={`rounded-xl p-2 ${p.data.tipo === "PEI" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}><AuditIcon tipo={p.data.tipo === "PEI" ? "documento" : "plano"} /></span><span className="font-semibold text-slate-700">{p.data.nome}</span></div> : null },
    { field: "periodo", headerName: "Período" },
    { field: "status", headerName: "Situação", cellRenderer: (p: ICellRendererParams<Documento>) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.data?.arquivado ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-800"}`}>{p.value}</span> },
    { field: "dataRegistro", headerName: "Registrado em", valueFormatter: p => dataPerfil(p.value), filter: "agTextColumnFilter", filterValueGetter: p => dataPerfil(p.data?.dataRegistro) },
    { colId: "acoes", headerName: "Detalhes", width: 160, minWidth: 160, maxWidth: 160, pinned: "right", sortable: false, filter: false, floatingFilter: false, cellRenderer: (p: ICellRendererParams<Documento>) => p.data ? <DetailsButton titulo={`Ver ${p.data.nome}, período ${p.data.periodo}`} onClick={() => onView(p.data!)} /> : null },
  ], [onView]);
  return <div className="portal-data-grid h-[500px]"><AgGridReact<Documento> theme={portalGridTheme} rowData={documentos} columnDefs={colunas} defaultColDef={padrao} getRowId={p => p.data.chave} localeText={locale} pagination paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]} enableCellTextSelection onRowClicked={e => { if (e.data && !(e.event?.target instanceof Element && e.event.target.closest("button"))) onView(e.data); }} /></div>;
}
export function StudentAdaptations({ adaptacoes, onView }: { adaptacoes: AdaptacaoEstudante[]; onView: (adaptacao: AdaptacaoEstudante) => void }) {
  const colunas = useMemo<ColDef<AdaptacaoEstudante>[]>(() => [
    { field: "componenteCurricular", headerName: "Componente curricular", minWidth: 230, flex: 1.5, tooltipField: "componenteCurricular" },
    { field: "professorNome", headerName: "Professor(a)", minWidth: 180 },
    { field: "semestreAno", headerName: "Período", minWidth: 140 },
    { colId: "situacao", headerName: "Situação", valueGetter: p => p.data?.arquivado ? "Arquivada" : "Em acompanhamento", cellRenderer: (p: ICellRendererParams<AdaptacaoEstudante>) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.data?.arquivado ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-800"}`}>{p.value}</span> },
    { field: "dataAtualizacao", headerName: "Atualizada em", valueFormatter: p => dataPerfil(p.value), filterValueGetter: p => dataPerfil(p.data?.dataAtualizacao) },
    { colId: "acoes", headerName: "Detalhes", width: 160, minWidth: 160, maxWidth: 160, pinned: "right", sortable: false, filter: false, floatingFilter: false, cellRenderer: (p: ICellRendererParams<AdaptacaoEstudante>) => p.data ? <DetailsButton titulo={`Ver adaptação de ${p.data.componenteCurricular}`} onClick={() => onView(p.data!)} /> : null },
  ], [onView]);
  return <div className="portal-data-grid h-[500px]"><AgGridReact<AdaptacaoEstudante> theme={portalGridTheme} rowData={adaptacoes} columnDefs={colunas} defaultColDef={padrao} getRowId={p => String(p.data.id)} localeText={locale} pagination paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]} enableCellTextSelection onRowClicked={e => { if (e.data && !(e.event?.target instanceof Element && e.event.target.closest("button"))) onView(e.data); }} /></div>;
}
