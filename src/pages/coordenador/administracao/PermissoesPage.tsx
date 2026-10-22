import PermissionBadges from "./PermissionBadges";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { accessProfiles, canAccess, type Permission } from "../../../config/access";
import { permissionCatalog } from "../../../config/permissionCatalog";
import { portalGridLocale, portalGridTheme } from "../../../config/gridTheme";
import { useAuth } from "../../../hooks/useAuth";
import { usuariosService, type UsuarioGerenciado } from "../../../services/usuariosService";
import { mensagemErro } from "../../../services/apiError";
import { notificationService } from "../../../services/notificationService";
import { confirmarUsuario } from "../../../services/usuarioConfirmation";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import { ShieldIcon } from "../../../components/icons/AppIcons";
import RefreshIcon from "../../../components/icons/RefreshIcon";
ModuleRegistry.registerModules([AllCommunityModule]);
type Linha = typeof permissionCatalog[number] & { padrao: boolean; escolha: "padrao" | "permitir" | "bloquear"; liberado: boolean };
function resolver(conta: UsuarioGerenciado, ajustes: UsuarioGerenciado["ajustes"], codigo: Permission) { return ajustes[codigo] ?? conta.permissoesPadrao.includes(codigo); }
export default function PermissoesPage() {
  const { usuario } = useAuth(); const [search, setSearch] = useSearchParams();
  const [usuarios, setUsuarios] = useState<UsuarioGerenciado[]>([]); const [selecionado, setSelecionado] = useState(Number(search.get("usuario")) || 0); const [ajustes, setAjustes] = useState<UsuarioGerenciado["ajustes"]>({}); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [erro, setErro] = useState(""); const [versao, setVersao] = useState(0); const pendente = useRef(false);
  const grid = useRef<AgGridReact<Linha>>(null);
  const tabela = useRef<HTMLDivElement>(null);
  const selecaoInicial = useRef(Number(search.get("usuario")) || 0);
  const conta = usuarios.find(u => u.id === selecionado);
  const alterado = !!conta && JSON.stringify(Object.entries(ajustes).sort()) !== JSON.stringify(Object.entries(conta.ajustes).sort());
  const editar = !loading && !erro && !!usuario && canAccess(usuario, "permissoes.gerenciar") && conta?.id !== usuario.id;
  useEffect(() => { document.title = "Permissões | Portal Incluir"; const c = new AbortController(); usuariosService.listar(c.signal).then(lista => { if (c.signal.aborted) return; setUsuarios(lista); setAjustes({ ...lista.find(u => u.id === selecaoInicial.current)?.ajustes }); }).catch(error => { if (!c.signal.aborted) setErro(mensagemErro(error)); }).finally(() => { if (!c.signal.aborted) setLoading(false); }); return () => c.abort(); }, [versao]);
  useEffect(() => { if (!alterado) return; const avisar = (e: BeforeUnloadEvent) => { e.preventDefault(); }; window.addEventListener("beforeunload", avisar); return () => window.removeEventListener("beforeunload", avisar); }, [alterado]);
  async function escolher(id: number) {
    if (pendente.current) return; pendente.current = true;
    try { if (alterado && !await confirmarUsuario("Descartar alterações não salvas?", "As alterações desta pessoa ainda não foram salvas e serão descartadas.")) return;
      const alvo = usuarios.find(u => u.id === id); setSelecionado(id); setAjustes({ ...alvo?.ajustes }); setSearch(id ? { usuario: String(id) } : {}, { replace: true }); setErro("");
    } finally { pendente.current = false; }
  }
  function mudar(codigo: Permission, escolha: Linha["escolha"]) {
    if (!conta) return;
    setAjustes(atual => {
      const novo = { ...atual };
      if (escolha === "padrao") delete novo[codigo]; else novo[codigo] = escolha === "permitir";
      // Grant prerequisites together and show them as additional permissions.
      function liberarDependencias(c: Permission) { const dependencia = permissionCatalog.find(p => p.codigo === c)?.dependencia; if (dependencia && !resolver(conta!, novo, dependencia)) { novo[dependencia] = true; liberarDependencias(dependencia); } }
      if (resolver(conta, novo, codigo)) {
        liberarDependencias(codigo);
        if (codigo === "anamnese") novo["sensivel.consultar"] = true;
      }
      return novo;
    });
  }
  const linhas = useMemo<Linha[]>(() => conta ? permissionCatalog.map(p => ({ ...p, padrao: conta.permissoesPadrao.includes(p.codigo), escolha: ajustes[p.codigo] === undefined ? "padrao" : ajustes[p.codigo] ? "permitir" : "bloquear", liberado: resolver(conta, ajustes, p.codigo) })) : [], [conta, ajustes]);
  function mostrarPermissao(codigo: Permission) {
    const api = grid.current?.api;
    if (!api) return;
    const node = api.getRowNode(codigo);
    if (!node) return;
    api.setFilterModel(null);
    tabela.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    api.ensureNodeVisible(node, "middle");
    if (node.rowIndex !== null) api.setFocusedCell(node.rowIndex, "nome");
    api.flashCells({ rowNodes: [node] });
  }
  const dependenciasInvalidas = linhas.filter(p => p.liberado && p.dependencia && !resolver(conta!, ajustes, p.dependencia));
  const cols: ColDef<Linha>[] = [
    { field: "nome", headerName: "Permissão e finalidade", flex: 2, minWidth: 300, autoHeight: true, wrapText: true, cellRenderer: ({ data }: ICellRendererParams<Linha>) => data && <div className="py-4 leading-relaxed"><p className="font-semibold text-slate-800">{data.nome}</p><p className="mt-1 text-xs text-slate-500">{data.descricao}</p>{!data.disponivel && <p className="mt-1 text-[11px] font-medium text-amber-700">Tela do menu em preparação</p>}</div> },
    { field: "menu", headerName: "Ícone e local no menu", flex: 1.2, minWidth: 240, wrapText: true, autoHeight: true, cellRenderer: ({ data }: ICellRendererParams<Linha>) => data && <div className="flex items-center gap-3 py-4 leading-relaxed"><span className="shrink-0 rounded-lg bg-green-50 p-2.5 text-green-700"><data.icon className="h-5 w-5" /></span><span className="text-xs text-slate-600">{data.menu}</span></div> },
    { colId: "padrao", headerName: "Padrão do perfil", minWidth: 150, valueGetter: p => p.data?.padrao ? "Permitido" : "Não permitido" },
    { colId: "escolha", headerName: "Ajuste individual", minWidth: 190, filter: false, floatingFilter: false, sortable: false, cellRenderer: ({ data }: ICellRendererParams<Linha>) => data && <select aria-label={`Ajuste de ${data.nome}`} disabled={!editar || busy} value={data.escolha} onChange={event => mudar(data.codigo, event.target.value as Linha["escolha"])} className="my-4 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 disabled:opacity-60"><option value="padrao">Usar padrão do perfil</option><option value="permitir" disabled={!data.disponivel && !data.padrao}>Permitir</option><option value="bloquear">Bloquear</option></select> },
    { colId: "resultado", headerName: "Acesso resultante", minWidth: 160, valueGetter: p => p.data?.liberado ? "Permitido" : "Bloqueado", cellRenderer: (p: ICellRendererParams<Linha>) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.data?.liberado ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}`}>{p.value}</span> },
  ];
  async function salvar() {
    if (!conta || !editar || pendente.current || dependenciasInvalidas.length) return; pendente.current = true; setBusy(true); setErro("");
    try {
      const mudancas = permissionCatalog.filter(p => ajustes[p.codigo] !== conta.ajustes[p.codigo]).map(p => `${p.nome}: ${ajustes[p.codigo] === undefined ? "padrão do perfil" : ajustes[p.codigo] ? "permitir" : "bloquear"}`);
      if (!await confirmarUsuario("Salvar permissões individuais?", `${conta.nome}. ${mudancas.join("; ")}. As alterações valerão também para sessões já abertas; o menu será atualizado na próxima consulta da conta.`)) return;
      const atual = await usuariosService.permissoes(conta.id, ajustes); setUsuarios(lista => lista.map(u => u.id === atual.id ? atual : u)); setAjustes({ ...atual.ajustes }); notificationService.success("Permissões atualizadas.");
    } catch (error) { setErro(mensagemErro(error)); } finally { pendente.current = false; setBusy(false); }
  }
  async function atualizar() { if (pendente.current) return; pendente.current = true; setBusy(true); try { if (await confirmarUsuario("Atualizar permissões?", alterado ? "As alterações ainda não salvas serão descartadas. Deseja consultar os acessos novamente?" : "Os acessos serão consultados novamente para mostrar as informações mais recentes.")) { selecaoInicial.current = selecionado; setAjustes({}); setLoading(true); setErro(""); setVersao(v => v + 1); } } finally { pendente.current = false; setBusy(false); } }
  return <div className="mx-auto max-w-[1600px] space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-primary">Permissões</h1><p className="mt-2 text-sm text-slate-500">Defina o que cada pessoa pode consultar e fazer no Portal Incluir.</p></div><Button variant="secondary" icon={<RefreshIcon />} disabled={loading || busy} onClick={() => void atualizar()}>Atualizar</Button></header>
    <section className="grid gap-5 rounded-2xl border border-[#dce5dc] bg-white p-6 lg:grid-cols-[1fr_1.3fr]"><label className="text-sm font-semibold text-slate-700">Escolha um usuário<select disabled={loading || busy} value={selecionado} onChange={e => void escolher(Number(e.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal"><option value={0}>Selecione uma pessoa</option>{usuarios.map(u => <option key={u.id} value={u.id}>{u.nome} · {accessProfiles[u.perfil].label} · {u.email}{!u.ativo ? " · Inativo" : ""}</option>)}</select></label><div className="rounded-xl bg-green-50 p-4 text-sm leading-relaxed text-green-900"><p className="font-semibold">Como os acessos funcionam</p><p className="mt-1">O perfil define o acesso inicial. Use “Permitir” para liberar uma ação extra ou “Bloquear” para retirar um acesso. “Usar padrão do perfil” remove o ajuste individual. A pessoa mantém seu perfil original.</p><p className="mt-2 text-xs">Ao liberar uma ação, as consultas necessárias são liberadas junto. Revise todos os ajustes antes de salvar.</p></div></section>
    {loading && <LoadingState />}{erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erro}</p>}
    {conta && !loading ? <><section className="rounded-2xl border border-[#dce5dc] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-green-50 p-3 text-green-700"><ShieldIcon className="h-6 w-6" /></span><div><h2 className="font-semibold text-slate-800">{conta.nome}</h2><p className="mt-1 text-xs text-slate-500">{accessProfiles[conta.perfil].label} · {conta.ativo ? "Conta ativa" : "Conta inativa: acessos disponíveis apenas após ativação"}</p></div></div><div className="flex gap-6 text-sm"><span><strong className="text-green-700">{linhas.filter(p => p.liberado).length}</strong> permitidas</span><span><strong className="text-slate-700">{Object.keys(ajustes).length}</strong> ajustes individuais</span></div></div><PermissionBadges permissoes={linhas.filter(p => p.liberado).map(p => p.codigo)} previa={alterado} onSelect={mostrarPermissao} /></section>
      {conta.id === usuario?.id && <p className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">Você pode consultar seus acessos. Para alterar as permissões da sua própria conta, peça a outro responsável.</p>}
      {!!dependenciasInvalidas.length && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Para manter as ações selecionadas, libere também: {[...new Set(dependenciasInvalidas.map(p => permissionCatalog.find(item => item.codigo === p.dependencia)?.nome))].join(", ")}.</p>}
      <div ref={tabela} className="scroll-mt-4 overflow-hidden rounded-2xl border border-[#dce5dc] bg-white"><div className="h-[620px]"><AgGridReact<Linha> ref={grid} theme={portalGridTheme} rowData={linhas} columnDefs={cols} defaultColDef={{ sortable: true, resizable: true, filter: "agTextColumnFilter", floatingFilter: true, cellDataType: false }} localeText={{ ...portalGridLocale, noRowsToShow: "Nenhuma permissão encontrada." }} getRowId={p => p.data.codigo} /></div></div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce5dc] bg-white p-4"><p className="text-sm text-slate-500">{alterado ? "Há alterações aguardando confirmação." : "Nenhuma alteração pendente."}</p><div className="flex gap-3"><Button variant="secondary" disabled={!editar || busy || !Object.keys(ajustes).length} onClick={() => setAjustes({})}>Usar padrão em tudo</Button><Button disabled={!editar || busy || !alterado || !!dependenciasInvalidas.length} onClick={() => void salvar()}>{busy ? "Aguarde..." : "Salvar permissões"}</Button></div></div>
    </> : !loading && <div className="rounded-2xl border border-dashed border-green-200 bg-white p-12 text-center"><ShieldIcon className="mx-auto h-10 w-10 text-green-600" /><p className="mt-4 font-semibold text-slate-700">Selecione uma pessoa para consultar seus acessos</p><p className="mt-2 text-sm text-slate-500">As permissões e o local de cada ação no menu serão apresentados aqui.</p></div>}
  </div>;
}
