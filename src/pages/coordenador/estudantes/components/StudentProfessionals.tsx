import { useEffect, useRef, useState, type FormEvent } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { portalGridLocale, portalGridTheme } from "../../../../config/gridTheme";
import { accessProfiles, canAccess } from "../../../../config/access";
import { atendimentos, necessidades } from "../../../../config/estudanteFormOptions";
import { useAuth } from "../../../../hooks/useAuth";
import { vinculosEstudanteService, type VinculoEstudante, type ProfissionalEstudante } from "../../../../services/vinculosEstudanteService";
import { mensagemErro } from "../../../../services/apiError";
import { confirmarUsuario } from "../../../../services/usuarioConfirmation";
import { notificationService } from "../../../../services/notificationService";
import type { EstudanteResponse } from "../../../../types/estudante";
import Button from "../../../../components/common/Button";
import Modal from "../../../../components/common/Modal";
import LoadingState from "../../../../components/common/LoadingState";
import { UsersIcon } from "../../../../components/icons/AppIcons";
import RefreshIcon from "../../../../components/icons/RefreshIcon";
ModuleRegistry.registerModules([AllCommunityModule]);
type Acao = { tipo: "associar"; profissional: ProfissionalEstudante } | { tipo: "encerrar"; vinculo: VinculoEstudante };
const padrao: ColDef = { sortable: true, resizable: true, filter: "agTextColumnFilter", floatingFilter: true, cellDataType: false, wrapText: true, autoHeight: true, cellStyle: { lineHeight: "1.5", paddingTop: "14px", paddingBottom: "14px" } };
function data(valor: string | null) { return valor ? new Date(valor).toLocaleString("pt-BR") : "—"; }

export default function StudentProfessionals({ estudante }: { estudante: EstudanteResponse }) {
  const { usuario } = useAuth();
  const gestao = !!usuario && ["COORDENADOR", "ADMINISTRADOR"].includes(usuario.perfil) && canAccess(usuario, "estudantes.vincular");
  const podeAlterar = gestao && !estudante.concluido;
  const [vinculos, setVinculos] = useState<VinculoEstudante[] | null>(null);
  const [candidatos, setCandidatos] = useState<ProfissionalEstudante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroCandidatos, setErroCandidatos] = useState("");
  const [versao, setVersao] = useState(0);
  const [escolhendo, setEscolhendo] = useState(false);
  const [acao, setAcao] = useState<Acao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const pendente = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([vinculosEstudanteService.listar(estudante.id, controller.signal), gestao ? vinculosEstudanteService.candidatos(estudante.id, controller.signal) : Promise.resolve([])]).then(([atuais, disponiveis]) => {
      if (controller.signal.aborted) return;
      if (atuais.status === "fulfilled") setVinculos(atuais.value); else setErro(mensagemErro(atuais.reason));
      if (disponiveis.status === "fulfilled") setCandidatos(disponiveis.value); else setErroCandidatos(mensagemErro(disponiveis.reason));
      setCarregando(false);
    });
    return () => controller.abort();
  }, [estudante.id, gestao, versao]);
  const abrir = (selecionada: Acao) => { setAcao(selecionada); setMotivo(""); setErroAcao(""); };
  async function atualizar() {
    if (pendente.current) return;
    pendente.current = true; setOcupado(true);
    try { if (await confirmarUsuario("Atualizar profissionais do estudante?", "Os vínculos e os cadastros profissionais serão consultados novamente.")) { setErro(""); setErroCandidatos(""); setCarregando(true); setVersao(v => v + 1); } }
    finally { pendente.current = false; setOcupado(false); }
  }
  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (!acao || pendente.current || !podeAlterar) return;
    if (!motivo.trim()) { setErroAcao("Descreva o motivo e as orientações para este acompanhamento."); return; }
    const selecionada = acao;
    const profissional = selecionada.tipo === "associar" ? selecionada.profissional : selecionada.vinculo.profissional;
    pendente.current = true; setOcupado(true); setErroAcao("");
    try {
      if (!await confirmarUsuario(selecionada.tipo === "associar" ? "Associar profissional ao estudante?" : "Encerrar vínculo de acompanhamento?", selecionada.tipo === "associar" ? `${profissional.nome} acompanhará ${estudante.nomeCompleto} e poderá consultar os registros permitidos para seu perfil. ${profissional.perfil === "PROFESSOR" && !profissional.mesmoCurso ? "O curso informado pelo professor é diferente ou ainda não foi cadastrado. Confira se ele participará deste acompanhamento. " : ""}O vínculo e seu motivo ficarão registrados no histórico.` : `${profissional.nome} deixará de ter acesso aos registros de ${estudante.nomeCompleto} por este vínculo. O histórico será preservado.`, selecionada.tipo === "encerrar")) return;
      const atualizado = selecionada.tipo === "associar" ? await vinculosEstudanteService.associar(estudante.id, profissional.usuarioId!, motivo.trim()) : await vinculosEstudanteService.encerrar(estudante.id, selecionada.vinculo, motivo.trim());
      setVinculos(atuais => [...(atuais ?? []).filter(v => v.id !== atualizado.id), atualizado].sort((a, b) => Number(b.ativo) - Number(a.ativo) || b.dataInicio.localeCompare(a.dataInicio)));
      setCandidatos(atuais => atuais.map(p => p.usuarioId === profissional.usuarioId ? { ...p, vinculado: atualizado.ativo } : p));
      setAcao(null); notificationService.success(selecionada.tipo === "associar" ? "Profissional associado ao estudante." : "Vínculo de acompanhamento encerrado.");
    } catch (error) { setErroAcao(mensagemErro(error)); }
    finally { pendente.current = false; setOcupado(false); }
  }
  const colunas: ColDef<VinculoEstudante>[] = [
    { headerName: "Profissional", minWidth: 240, flex: 1.4, valueGetter: p => p.data?.profissional.nome, cellRenderer: ({ data: v }: ICellRendererParams<VinculoEstudante>) => v && <div className="leading-relaxed"><p className="font-semibold text-slate-800">{v.profissional.nome}</p><p className="mt-1 text-xs text-slate-500">{accessProfiles[v.profissional.perfil].label} · {v.profissional.areaAtuacao}</p>{!v.profissional.ativo && <p className="mt-1 text-xs text-amber-700">Conta de acesso indisponível</p>}</div> },
    { headerName: "Curso / disciplina", minWidth: 230, flex: 1.2, valueGetter: p => p.data?.profissional.perfil === "PROFESSOR" ? [...p.data.profissional.cursosAtuacao, p.data.profissional.disciplina].filter(Boolean).join(" · ") || "Curso ainda não informado" : p.data?.profissional.setor },
    { headerName: "Início do vínculo", minWidth: 160, valueGetter: p => data(p.data?.dataInicio ?? null) },
    { headerName: "Motivo do acompanhamento", minWidth: 220, flex: 1, field: "motivo" },
    { headerName: "Situação", minWidth: 150, valueGetter: p => p.data?.ativo ? "Ativo" : "Encerrado", cellRenderer: ({ data: v }: ICellRendererParams<VinculoEstudante>) => v && <div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${v.ativo ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}`}>{v.ativo ? "Ativo" : "Encerrado"}</span>{!v.ativo && <p className="mt-2 text-xs text-slate-500">{data(v.dataEncerramento)}<br />{v.motivoEncerramento}</p>}</div> },
    ...(gestao ? [{ headerName: "Ação", width: 135, pinned: "right" as const, filter: false, floatingFilter: false, sortable: false, cellRenderer: ({ data: v }: ICellRendererParams<VinculoEstudante>) => v?.ativo ? <button type="button" disabled={!podeAlterar || carregando || ocupado} onClick={() => abrir({ tipo: "encerrar", vinculo: v })} className="min-h-9 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-800 disabled:opacity-40">Encerrar vínculo</button> : <span className="text-xs text-slate-400">Histórico</span> }] : []),
  ];
  const colunasCandidatos: ColDef<ProfissionalEstudante>[] = [
    { field: "nome", headerName: "Profissional", minWidth: 230, flex: 1.2 },
    { headerName: "Perfil", minWidth: 180, valueGetter: p => p.data && accessProfiles[p.data.perfil].label },
    { field: "areaAtuacao", headerName: "Área de atuação", minWidth: 210, flex: 1 },
    { field: "setor", headerName: "Setor", minWidth: 150 },
    { headerName: "Curso / disciplina", minWidth: 250, flex: 1.3, valueGetter: p => [...(p.data?.cursosAtuacao ?? []), p.data?.disciplina].filter(Boolean).join(" · ") || "Não informado" },
    { headerName: "Curso do estudante", minWidth: 170, valueGetter: p => p.data?.perfil !== "PROFESSOR" ? "Não se aplica" : p.data.mesmoCurso ? "Mesmo curso" : "Outro curso / a revisar" },
    { headerName: "Ação", width: 130, pinned: "right", filter: false, floatingFilter: false, sortable: false, cellRenderer: ({ data: p }: ICellRendererParams<ProfissionalEstudante>) => p && <button type="button" disabled={p.vinculado || ocupado || !estudante.ativo} onClick={() => abrir({ tipo: "associar", profissional: p })} className="min-h-9 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-semibold text-green-800 disabled:opacity-40">{p.vinculado ? "Já associado" : "Associar"}</button> },
  ];
  const necessidadesDeclaradas = necessidades.filter(n => estudante.necessidadesEspecificas?.includes(n.value));
  const atendimentosDeclarados = atendimentos.filter(a => estudante.atendimentosCampus?.includes(a.value));
  return <div className="space-y-5">
    <section className="rounded-2xl border border-[#dce5dc] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700"><UsersIcon className="h-6 w-6" /></span><div><h2 className="font-bold text-slate-800">Profissionais do acompanhamento</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">A coordenação organiza quem acompanha este estudante. O curso e a área ajudam na escolha; o vínculo confirmado define o acesso aos registros.</p></div></div><div className="flex flex-wrap gap-2"><Button variant="secondary" icon={<RefreshIcon />} disabled={carregando || ocupado} onClick={() => void atualizar()}>Atualizar</Button>{gestao && <Button disabled={!podeAlterar || !estudante.ativo || carregando || ocupado} icon={<UsersIcon />} onClick={() => setEscolhendo(aberto => !aberto)}>{escolhendo ? "Recolher profissionais" : "Associar profissional"}</Button>}</div></div>
      {gestao && usuario && canAccess(usuario, "sensivel.consultar") && <div className="mt-5 rounded-xl border border-green-100 bg-green-50/40 p-4"><p className="text-xs font-semibold text-green-900">Referências da identificação inicial e anamnese</p><p className="mt-1 text-xs text-slate-500">Curso: {estudante.curso}. Revise os registros e confirme a participação de cada profissional.</p><div className="mt-3 flex flex-wrap gap-2">{[...necessidadesDeclaradas, ...atendimentosDeclarados].map(item => <span key={item.value} className="rounded-lg border border-green-100 bg-white px-2.5 py-1.5 text-xs text-green-800">{item.label}</span>)}</div>{!necessidadesDeclaradas.length && !atendimentosDeclarados.length && <p className="mt-2 text-xs text-slate-500">Nenhuma necessidade ou atendimento específico informado nesses campos.</p>}</div>}
      {!estudante.ativo && <p className="mt-4 text-xs text-amber-800">{estudante.concluido ? "Acompanhamento concluído: vínculos disponíveis apenas para consulta." : "Estudante inativo: ative o cadastro antes de associar profissionais."}</p>}
    </section>
    {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
    {escolhendo && gestao && <section className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white"><div className="p-5"><h3 className="font-semibold text-slate-800">Escolha um profissional</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Use os filtros das colunas para localizar a área, o curso ou a pessoa. Professores do mesmo curso aparecem primeiro. Informe o motivo ao associar.</p>{erroCandidatos && <p role="alert" className="mt-3 text-sm text-amber-800">{erroCandidatos}</p>}</div><div className="h-[420px]"><AgGridReact<ProfissionalEstudante> theme={portalGridTheme} rowData={candidatos} columnDefs={colunasCandidatos} defaultColDef={padrao} getRowId={p => String(p.data.usuarioId)} loading={carregando} loadingOverlayComponent={() => <LoadingState compact />} localeText={{ ...portalGridLocale, noRowsToShow: erroCandidatos ? "Não foi possível consultar os profissionais." : "Nenhum profissional ativo encontrado." }} /></div></section>}
    <section className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white"><div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5"><h3 className="font-semibold text-slate-800">Vínculos atuais e anteriores</h3><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">{vinculos === null ? "—" : `${vinculos.filter(v => v.ativo).length} ativo(s)`}</span></div><AgGridReact<VinculoEstudante> theme={portalGridTheme} domLayout="autoHeight" rowData={vinculos ?? []} columnDefs={colunas} defaultColDef={padrao} getRowId={p => String(p.data.id)} loading={carregando} loadingOverlayComponent={() => <LoadingState compact />} localeText={{ ...portalGridLocale, noRowsToShow: erro ? "Não foi possível consultar os vínculos." : "Nenhum profissional associado a este estudante." }} pagination paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]} /></section>
    {acao && <Modal open busy={ocupado} onClose={() => setAcao(null)} size="wide" title={acao.tipo === "associar" ? "Associar profissional" : "Encerrar vínculo"} description={`${acao.tipo === "associar" ? acao.profissional.nome : acao.vinculo.profissional.nome} · ${estudante.nomeCompleto}`} icon={<UsersIcon className="h-7 w-7" />} footer={<div className="flex gap-3"><Button variant="secondary" disabled={ocupado} onClick={() => setAcao(null)}>Cancelar</Button><Button form="salvar-vinculo" type="submit" disabled={ocupado}>{ocupado ? "Aguarde..." : acao.tipo === "associar" ? "Confirmar associação" : "Encerrar vínculo"}</Button></div>}><form id="salvar-vinculo" onSubmit={event => void salvar(event)}><label className="block text-sm font-semibold text-slate-700">{acao.tipo === "associar" ? "Motivo e orientações ao profissional" : "Motivo do encerramento"} *<textarea required disabled={ocupado} maxLength={1000} rows={5} value={motivo} onChange={event => setMotivo(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-green-100" /></label><p className="mt-2 text-xs text-slate-500">{motivo.length}/1000 caracteres. As informações ficarão registradas no histórico do acompanhamento.</p>{erroAcao && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{erroAcao}</p>}</form></Modal>}
  </div>;
}
