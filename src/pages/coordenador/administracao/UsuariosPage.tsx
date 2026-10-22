import RefreshIcon from "../../../components/icons/RefreshIcon";
import { colorThemes } from "../../../config/uiThemes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { accessProfiles, canAccess } from "../../../config/access";
import { portalGridLocale, portalGridTheme } from "../../../config/gridTheme";
import { useAuth } from "../../../hooks/useAuth";
import { usuariosService, type UsuarioGerenciado } from "../../../services/usuariosService";
import { mensagemErro } from "../../../services/apiError";
import { notificationService } from "../../../services/notificationService";
import { confirmarUsuario } from "../../../services/usuarioConfirmation";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import { UsersIcon, ShieldIcon } from "../../../components/icons/AppIcons";
import UsuarioEditor from "./UsuarioEditor";
ModuleRegistry.registerModules([AllCommunityModule]);
export default function UsuariosPage() {
  const { usuario, atualizarDadosPerfil } = useAuth(); const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioGerenciado[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [erro, setErro] = useState(""); const [editando, setEditando] = useState<UsuarioGerenciado | null>(null); const [versao, setVersao] = useState(0);
  const pendente = useRef(false);
  const grid = useRef<AgGridReact<UsuarioGerenciado>>(null);
  const [situacaoSelecionada, setSituacaoSelecionada] = useState("todas");
  const ativos = usuarios.filter(conta => conta.ativo).length;
  const resumo = [
    { id: "todas", titulo: "Contas cadastradas", valor: usuarios.length, descricao: "Todas as pessoas com conta no portal", tom: "blue" as const, borda: "border-l-sky-500", icone: "bg-sky-50 text-sky-600", caminho: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", pessoas: true },
    { id: "Ativo", titulo: "Usuários ativos", valor: ativos, descricao: "Contas habilitadas para acessar o sistema", tom: "green" as const, borda: "border-l-primary", icone: "bg-emerald-50 text-primary", caminho: "m8 12 3 3 5-6", pessoas: false },
    { id: "Inativo", titulo: "Usuários inativos", valor: usuarios.length - ativos, descricao: "Contas com acesso suspenso e dados preservados", tom: "amber" as const, borda: "border-l-amber-500", icone: "bg-amber-50 text-amber-600", caminho: "M10 8v8M14 8v8", pessoas: false },
  ];
  async function filtrarSituacao(situacao: string) {
    const api = grid.current?.api;
    if (!api) return;
    await api.setColumnFilterModel("situacao", situacao === "todas" ? null : { filterType: "text", type: "equals", filter: situacao });
    api.onFilterChanged(); api.paginationGoToFirstPage();
  }
  useEffect(() => { document.title = "Usuários | Portal Incluir"; const controller = new AbortController(); usuariosService.listar(controller.signal).then(lista => { if (!controller.signal.aborted) setUsuarios(lista); }).catch(error => { if (!controller.signal.aborted) setErro(mensagemErro(error)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [versao]);
  const gerenciar = !loading && !erro && !!usuario && canAccess(usuario, "usuarios.gerenciar");
  const permissoes = !!usuario && canAccess(usuario, "permissoes");
  const atualizar = useCallback((atual: UsuarioGerenciado) => { setUsuarios(lista => lista.map(item => item.id === atual.id ? atual : item)); atualizarDadosPerfil(atual.perfil, atual.perfilId, { nome: atual.nome, email: atual.email }); }, [atualizarDadosPerfil]);
  const acao = useCallback(async (alvo: UsuarioGerenciado, tipo: "situacao" | "excluir") => {
    if (pendente.current) return; pendente.current = true; setBusy(true);
    try {
      const excluir = tipo === "excluir";
      const titulo = excluir ? "Excluir conta de acesso?" : alvo.ativo ? "Inativar usuário?" : "Ativar usuário?";
      const efeito = excluir ? "A conta de acesso será excluída e a pessoa não poderá mais entrar. Os registros profissionais vinculados ao histórico serão preservados. Esta ação não pode ser desfeita." : alvo.ativo ? "A pessoa perderá o acesso ao sistema, inclusive em sessões abertas. Os dados e registros serão preservados." : "A pessoa poderá voltar a entrar no sistema com suas permissões atuais.";
      if (!await confirmarUsuario(titulo, `${alvo.nome} · ${alvo.email}. ${efeito}`, excluir || alvo.ativo)) return;
      if (excluir) { await usuariosService.excluir(alvo.id); setUsuarios(lista => lista.filter(item => item.id !== alvo.id)); } else atualizar(await usuariosService.situacao(alvo.id, !alvo.ativo));
      notificationService.success(excluir ? "Conta de acesso excluída." : "Situação do usuário atualizada.");
    } catch (error) { notificationService.error(mensagemErro(error)); } finally { pendente.current = false; setBusy(false); }
  }, [atualizar]);
  const cols = useMemo<ColDef<UsuarioGerenciado>[]>(() => [
    { field: "nome", headerName: "Usuário", minWidth: 260, flex: 1.5, tooltipField: "nome", cellRenderer: ({ data }: ICellRendererParams<UsuarioGerenciado>) => data && <div className="flex min-h-[76px] items-center gap-3 py-3 leading-normal"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"><UsersIcon /></span><div className="min-w-0 whitespace-normal [overflow-wrap:anywhere]"><p className="font-semibold leading-5 text-slate-800">{data.nome}</p><p className="mt-1 text-xs leading-5 text-slate-500">Matrícula {data.dados.matricula || "não informada"}</p></div></div> },
    { field: "email", headerName: "E-mail de login", minWidth: 230, flex: 1.2 },
    { field: "perfil", headerName: "Perfil", minWidth: 190, valueGetter: p => p.data ? accessProfiles[p.data.perfil].label : "" },
    { colId: "setor", headerName: "Setor", minWidth: 140, valueGetter: p => p.data?.dados.setor || "Não informado" },
    { colId: "situacao", headerName: "Situação", minWidth: 120, valueGetter: p => p.data?.ativo ? "Ativo" : "Inativo", cellRenderer: (p: ICellRendererParams<UsuarioGerenciado>) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.data?.ativo ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}`}>{p.value}</span> },
    { colId: "acoes", headerName: "Ações", width: gerenciar ? 270 : 150, pinned: "right", minWidth: gerenciar ? 270 : 150, resizable: false, filter: false, floatingFilter: false, sortable: false, cellRenderer: ({ data }: ICellRendererParams<UsuarioGerenciado>) => data && <div className="flex h-full items-center gap-1.5">{gerenciar && <><button type="button" disabled={busy} onClick={() => setEditando(data)} className="rounded-lg border border-green-100 px-2.5 py-2 text-xs font-semibold text-green-800 hover:bg-green-50 disabled:opacity-40" title={`Editar dados de ${data.nome}`}>Editar</button><button type="button" disabled={busy || data.id === usuario?.id} onClick={() => void acao(data, "situacao")} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40">{data.ativo ? "Inativar" : "Ativar"}</button><button type="button" disabled={busy || data.id === usuario?.id} onClick={() => void acao(data, "excluir")} className="rounded-lg border border-red-100 px-2.5 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40">Excluir</button></>}{permissoes && <button type="button" disabled={busy} aria-label={`Permissões de ${data.nome}`} title="Ver permissões" onClick={() => navigate(`${accessProfiles[usuario!.perfil].basePath}/administracao/permissoes?usuario=${data.id}`)} className="rounded-lg border border-green-100 p-2 text-green-700 hover:bg-green-50"><ShieldIcon /></button>}</div> },
  ], [gerenciar, permissoes, busy, usuario, acao, navigate]);
  async function recarregar() { if (pendente.current) return; pendente.current = true; setBusy(true); try { if (await confirmarUsuario("Atualizar lista de usuários?", "A lista será consultada novamente para mostrar as informações mais recentes.")) { setLoading(true); setErro(""); setVersao(v => v + 1); } } finally { pendente.current = false; setBusy(false); } }
  return <div className="mx-auto max-w-[1600px] space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-primary">Usuários</h1><p className="mt-2 text-sm text-slate-500">Visão geral das contas, perfis e acessos ao Portal Incluir.</p></div><Button variant="secondary" icon={<RefreshIcon />} disabled={loading || busy} onClick={() => void recarregar()}>Atualizar</Button></header>
    <section aria-label="Indicadores de usuários" className="grid gap-4 sm:grid-cols-3">
      {resumo.map(card => {
        const selecionado = situacaoSelecionada === card.id;
        return <button key={card.id} type="button" disabled={loading} onClick={() => void filtrarSituacao(card.id)} aria-pressed={selecionado} style={colorThemes[card.tom]}
          className={`group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#dce5dc] border-l-4 bg-white p-5 text-left shadow-[0_4px_20px_rgba(24,91,50,0.05)] transition duration-200 hover:-translate-y-1 hover:bg-[#fbfefb] hover:shadow-[0_12px_28px_-10px_rgba(24,91,50,0.22)] active:translate-y-0 active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-main)] disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transform-none sm:p-6 ${card.borda} ${selecionado ? "ring-2 ring-[var(--accent-ring)]" : ""}`}>
          <span className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none ${card.icone}`}>
            <svg aria-hidden="true" className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={card.caminho} />{card.pessoas ? <circle cx="9" cy="7" r="4" /> : <circle cx="12" cy="12" r="9" />}</svg>
          </span>
          <span aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 ${card.icone}`} />
          <span className="block min-h-10 text-sm font-semibold leading-snug text-slate-700">{card.titulo}</span>
          <span className="mt-3 block text-3xl font-semibold leading-none tracking-tight text-[#26332b] tabular-nums sm:text-4xl">{loading ? "?" : card.valor}</span>
          <span className="mt-2 min-h-8 text-xs leading-relaxed text-slate-500">{card.descricao}</span>
          <span className={`mt-5 flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors group-hover:bg-[var(--accent-main)] group-hover:text-white group-focus-visible:bg-[var(--accent-main)] group-focus-visible:text-white ${selecionado ? "bg-[var(--accent-main)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent-main)]"}`}>
            {selecionado ? "Filtro ativo" : card.id === "todas" ? "Ver todas as contas" : card.id === "Ativo" ? "Ver contas ativas" : "Ver contas inativas"}
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={selecionado ? "m5 12 4 4L19 6" : "M5 12h14m-6-6 6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </button>;
      })}
    </section>
    {erro && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erro}<button className="ml-3 underline" onClick={() => { setLoading(true); setErro(""); setVersao(v => v + 1); }}>Tentar novamente</button></div>}
    <section className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white"><div className="border-b border-[#dce5dc] px-5 py-4"><h2 className="font-semibold text-slate-800">Todas as contas</h2><p className="mt-1 text-xs text-slate-500">Use os filtros das colunas para localizar uma pessoa. As ações disponíveis respeitam suas permissões.</p></div><div className="min-w-0"><AgGridReact<UsuarioGerenciado> ref={grid} theme={portalGridTheme} domLayout="autoHeight" rowData={usuarios} onFilterChanged={({ api }) => { const filtro = api.getFilterModel().situacao; setSituacaoSelecionada(filtro?.type === "equals" && ["Ativo", "Inativo"].includes(filtro.filter) ? filtro.filter : "todas"); }} columnDefs={cols} defaultColDef={{ sortable: true, resizable: true, filter: "agTextColumnFilter", floatingFilter: true, cellDataType: false, wrapText: true, autoHeight: true, tooltipValueGetter: p => p.value == null ? "" : String(p.value), cellRenderer: (p: ICellRendererParams<UsuarioGerenciado>) => <div className="flex min-h-[76px] items-center py-3 leading-relaxed whitespace-normal [overflow-wrap:anywhere]">{p.value}</div> }} localeText={{ ...portalGridLocale, noRowsToShow: "Nenhum usuário encontrado." }} getRowId={p => String(p.data.id)} loading={loading} loadingOverlayComponent={() => <LoadingState compact />} pagination paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]} /></div></section>
    {editando && <UsuarioEditor key={editando.id} usuario={editando} onClose={() => setEditando(null)} onSave={atual => { atualizar(atual); setEditando(null); }} />}
  </div>;
}
