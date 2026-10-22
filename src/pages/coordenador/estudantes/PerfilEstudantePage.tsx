import StudentDocumentGeneration from "./components/StudentDocumentGeneration";
import StudentProfessionals from "./components/StudentProfessionals";
import { useEffect, useRef, useState } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { accessProfiles, canAccess } from "../../../config/access";
import { colorThemes } from "../../../config/uiThemes";
import { perfilEstudanteService } from "../../../services/perfilEstudanteService";
import { getOverlayToolsHost } from "../../../services/overlayTools";
import { notificationService } from "../../../services/notificationService";
import type { AdaptacaoEstudante, DadosPerfilEstudante } from "../../../types/perfilEstudante";
import type { Documento } from "../../../types/documento";
import type { RegistroAuditoria } from "../../../types/auditoria";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import LoadingState from "../../../components/common/LoadingState";
import { DiagnosisInformation, PersonalInformation, ProfileFields, ProfileSection } from "./components/StudentInformation";
import { StudentAdaptations, StudentDocuments } from "./components/StudentRecords";
import DocumentDetails from "../documentos/components/DocumentDetails";
import AuditoriasTable from "../auditorias/components/AuditoriasTable";
import AuditDetails from "../auditorias/components/AuditDetails";
import { AuditIcon } from "../auditorias/components/AuditVisuals";
import { dataPerfil } from "./profilePresentation";

type AbaPerfil = "plano" | "dados" | "diagnostico" | "adaptacoes" | "historico" | "documentos" | "profissionais";
const abas: { id: AbaPerfil; label: string; icone: string }[] = [
  { id: "plano", label: "Plano de ação", icone: "plano" }, { id: "dados", label: "Dados pessoais", icone: "usuario" },
  { id: "diagnostico", label: "Diagnóstico", icone: "atividade" }, { id: "adaptacoes", label: "Adaptações", icone: "adaptacao" },
  { id: "historico", label: "Histórico", icone: "historico" }, { id: "documentos", label: "Documentos", icone: "documento" },
  { id: "profissionais", label: "Profissionais", icone: "equipe" },
];
export default function PerfilEstudantePage() {
  const { id } = useParams<{ id: string }>();
  return <StudentProfile key={id} id={Number(id)} />;
}
function StudentProfile({ id }: { id: number }) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const basePath = accessProfiles[usuario?.perfil ?? "COORDENADOR"].basePath;
  const [dados, setDados] = useState<DadosPerfilEstudante | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>("plano");
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);
  const [gerarDocumento, setGerarDocumento] = useState(false);
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [adaptacao, setAdaptacao] = useState<AdaptacaoEstudante | null>(null);
  const [revisao, setRevisao] = useState<RegistroAuditoria | null>(null);
  const [filtroAdaptacao, setFiltroAdaptacao] = useState<number | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const pendente = useRef(false);
  useEffect(() => { document.title = `${dados?.estudante.nomeCompleto || "Perfil do estudante"} | Portal Incluir`; }, [dados?.estudante.nomeCompleto]);
  useEffect(() => {
    const controller = new AbortController(); let ativo = true;
    perfilEstudanteService.consultar(id, controller.signal).then(resposta => {
      if (!ativo) return;
      setDados(resposta); setAtualizadoEm(new Date());
      if (versao > 0) notificationService.success("Dados do estudante atualizados!");
    }).catch(error => { if (ativo && !axios.isCancel(error)) setErro(axios.isAxiosError(error) && error.response?.status === 410 ? "O prazo de consulta dos dados deste estudante já terminou." : "Não foi possível consultar os dados deste estudante. Confira sua conexão e tente novamente."); }).finally(() => { if (ativo) { setCarregando(false); pendente.current = false; } });
    return () => { ativo = false; controller.abort(); };
  }, [id, versao]);
  async function atualizar() {
    if (pendente.current || carregando) return;
    pendente.current = true; setConfirmando(true);
    try {
      const resposta = await Swal.fire({ target: getOverlayToolsHost(), titleText: "Atualizar os dados do estudante?", text: "As informações pessoais, os planos, as adaptações, o histórico e os documentos serão consultados novamente.", icon: "question", showCancelButton: true, confirmButtonText: "Sim, atualizar", cancelButtonText: "Cancelar", confirmButtonColor: colorThemes.green["--accent-main"], cancelButtonColor: "#64748b", focusCancel: true, allowOutsideClick: false, heightAuto: false });
      if (!resposta.isConfirmed) { pendente.current = false; return; }
      setErro(""); setCarregando(true); setVersao(v => v + 1);
    } catch { pendente.current = false; notificationService.error("Não foi possível atualizar os dados. Tente novamente."); }
    finally { setConfirmando(false); }
  }
  if (!dados) return <div className="space-y-4">{carregando ? <LoadingState label="Carregando o perfil e os registros do estudante..." /> : <><p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{erro}</p><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => navigate(`${basePath}/estudantes`)}>Voltar para estudantes</Button><Button disabled={confirmando} onClick={() => void atualizar()} icon={<AuditIcon tipo="atualizar" />}>Tentar novamente</Button></div></>}</div>;
  const estudante = dados.estudante;
  const nome = estudante.nomeCompleto || "Estudante";
  const iniciais = nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toLocaleUpperCase("pt-BR");
  const plano = dados.planos.find(p => !p.arquivado) ?? dados.planos[0];
  const historico = filtroAdaptacao === null ? dados.historico : dados.historico.filter(r => r.tabela === "adaptacoes_pedagogicas_aud" && String(r.identidade.id) === String(filtroAdaptacao));
  const contagens: Partial<Record<AbaPerfil, number>> = { adaptacoes: dados.falhas.adaptacoes ? undefined : dados.adaptacoes.length, historico: dados.falhas.historico ? undefined : dados.historico.length, documentos: dados.falhas.planos && dados.falhas.peis ? undefined : dados.documentos.length };
  const editar = () => navigate(`${basePath}/anamnese?estudanteId=${encodeURIComponent(String(id))}`);
  return <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><button type="button" onClick={() => navigate(`${basePath}/estudantes`)} className="mb-3 text-xs font-semibold text-green-800 hover:underline focus-visible:outline-2 focus-visible:outline-green-700">← Voltar para estudantes</button><h1 data-page-title className="text-2xl font-bold text-primary sm:text-[28px]">Perfil do estudante</h1><p className="mt-1 text-sm text-slate-500">Informações pessoais e registros do acompanhamento em um só lugar.</p></div><Button variant="secondary" disabled={carregando || confirmando} onClick={() => void atualizar()} icon={<AuditIcon tipo="atualizar" className={carregando ? "animate-spin motion-reduce:animate-none" : ""} />}>{carregando ? "Atualizando..." : "Atualizar dados"}</Button></header>
    <section aria-label="Identificação do estudante" className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#dce5dc] bg-white p-5 shadow-[0_4px_20px_rgba(24,91,50,0.04)] sm:p-6"><div className="flex min-w-0 items-center gap-4"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-xl font-bold text-green-800">{iniciais}</span><div className="min-w-0"><h2 className="break-words text-xl font-bold text-slate-800">{nome}</h2><p className="mt-1.5 text-sm text-slate-500">Matrícula {estudante.matricula || "não informada"} · {estudante.curso || "Curso não informado"}</p><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${estudante.concluido ? "bg-sky-50 text-sky-800" : estudante.ativo ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}`}>{estudante.concluido ? "Concluído · apenas consulta" : estudante.ativo ? "Ativo" : "Inativo"}</span><span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">Ingresso {estudante.periodoIngresso || "não informado"}</span></div></div></div><div className="flex flex-wrap gap-2"><Button disabled={!usuario || !canAccess(usuario, "estudantes.editar") || !canAccess(usuario, "anamnese") || estudante.concluido || carregando} onClick={editar} title={estudante.concluido ? "Acompanhamento concluído: dados disponíveis apenas para consulta" : "Editar os dados cadastrados"} icon={<AuditIcon tipo="usuario" />}>Editar dados</Button><Button disabled={!usuario || !canAccess(usuario, "documentos")} variant="secondary" onClick={() => setGerarDocumento(true)} icon={<AuditIcon tipo="documento" />}>Gerar documento</Button></div></section>
    {carregando && <LoadingState compact label="Atualizando as informações do estudante..." />}
    {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{erro} Os dados apresentados são da última consulta concluída.</p>}
    {Object.keys(dados.falhas).length > 0 && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Algumas informações não puderam ser consultadas.</p>{Object.entries(dados.falhas).map(([chave, texto]) => <p key={chave} className="mt-1">{texto}</p>)}<button type="button" disabled={carregando || confirmando} onClick={() => void atualizar()} className="mt-2 min-h-9 font-semibold underline disabled:opacity-50">Tentar consultar novamente</button></div>}
    <nav aria-label="Seções do perfil do estudante" className="grid grid-cols-2 gap-2 rounded-2xl border border-[#dce5dc] bg-white p-2 sm:grid-cols-3 xl:grid-cols-7">{abas.map(aba => <button key={aba.id} type="button" aria-pressed={abaAtiva === aba.id} aria-controls="conteudo-perfil-estudante" onClick={() => { setAbaAtiva(aba.id); if (aba.id === "historico") setFiltroAdaptacao(null); }} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-green-700 ${abaAtiva === aba.id ? "bg-green-50 text-green-800" : "text-slate-500 hover:bg-slate-50"}`}><AuditIcon tipo={aba.icone} className="h-4 w-4 shrink-0" />{aba.label}{contagens[aba.id] !== undefined && <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${abaAtiva === aba.id ? "bg-green-100" : "bg-slate-100"}`}>{contagens[aba.id]}</span>}</button>)}</nav>
    <div id="conteudo-perfil-estudante" className="space-y-5">
      {abaAtiva === "profissionais" && <StudentProfessionals estudante={estudante} />}
      {abaAtiva === "dados" && <PersonalInformation estudante={estudante} />}
      {abaAtiva === "diagnostico" && (usuario && canAccess(usuario, "sensivel.consultar") ? <DiagnosisInformation estudante={estudante} plano={plano} /> : <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Seu acesso não inclui as informações de saúde deste estudante.</p>)}
        {abaAtiva === "plano" && (
          <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <section className="min-h-[300px] rounded-xl border border-[#d9e2d9] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#25332b]">
                Resumo do plano de ação
              </h2>

              <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-[125px_1fr]">
                <span className="text-sm font-semibold text-slate-500">
                  Responsável
                </span>
                <span className="text-base text-slate-700">
                  {estudante.nomeResponsavel || "Não informado"}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  Contato
                </span>
                <span className="text-base text-slate-700">
                  {estudante.telefoneResponsavel || "Não informado"}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  Dificuldades
                </span>
                <span className="text-base leading-6 text-slate-700">
                  Ainda não há um plano de ação vinculado a este estudante.
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  Necessidades
                </span>
                <span className="text-base leading-6 text-slate-700">
                  {estudante.possuiNecessidadeEspecifica === true
                    ? estudante.necessidadesEspecificas?.join(", ") ||
                      "Necessidades específicas registradas"
                    : estudante.possuiNecessidadeEspecifica === false
                      ? "Nenhuma necessidade específica informada"
                      : "Não informado"}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  O que domina
                </span>
                <span className="text-base leading-6 text-slate-700">
                  Será preenchido a partir do plano de ação.
                </span>
              </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `${routes.planoAcaoCoordenador}?estudanteId=${encodeURIComponent(
                        String(estudante.id),
                      )}`,
                    )
                  }
                  className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-[#36a653] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#278944]"
                >
                  Cadastrar Plano de Ação
                </button>
            </section>

            <section className="min-h-[300px] rounded-xl border border-[#d9e2d9] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#25332b]">
                Linha do tempo
              </h2>

              <div className="mt-6 rounded-lg bg-[#f8faf7] p-5">
                <p className="text-base font-semibold text-slate-700">
                  Nenhuma atividade registrada
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Entrevistas, documentos, planos e adaptações poderão aparecer
                  aqui quando o histórico estiver integrado.
                </p>
              </div>
            </section>
          </div>
        )}
      {abaAtiva === "adaptacoes" && <section className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white"><div className="p-5"><h2 className="font-bold text-slate-800">Adaptações pedagógicas</h2><p className="mt-1 text-xs text-slate-500">Registros por componente curricular e professor, incluindo adaptações arquivadas. Abra um registro para consultar os detalhes.</p>{dados.falhas.adaptacoes && <p className="mt-2 text-sm text-amber-800">{dados.falhas.adaptacoes}</p>}</div>{!dados.falhas.adaptacoes && <StudentAdaptations adaptacoes={dados.adaptacoes} onView={setAdaptacao} />}</section>}
      {abaAtiva === "historico" && <>{filtroAdaptacao !== null && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-900"><span>Mostrando as alterações da adaptação selecionada.</span><button className="min-h-9 font-semibold underline" onClick={() => setFiltroAdaptacao(null)}>Ver todo o histórico do estudante</button></div>}{dados.falhas.historico ? <ProfileSection titulo="Histórico do estudante"><p className="text-sm text-slate-500">{dados.falhas.historico}</p></ProfileSection> : <AuditoriasTable registros={historico} carregando={carregando} confirmando={confirmando} onView={setRevisao} onRefresh={() => void atualizar()} filtroRapido={null} />}</>}
      {abaAtiva === "documentos" && <section className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white"><div className="p-5"><h2 className="font-bold text-slate-800">Documentos do estudante</h2><p className="mt-1 text-xs text-slate-500">Planos de Ação e PEIs registrados, incluindo documentos arquivados. Os dados da anamnese estão nas abas Dados pessoais e Diagnóstico.</p><p className="mt-2 text-xs text-slate-400">RAIs e comprovantes anexados ainda não podem ser consultados por esta página.</p></div>{!(dados.falhas.planos && dados.falhas.peis) && <StudentDocuments documentos={dados.documentos} onView={setDocumento} />}</section>}
    </div>
    {atualizadoEm && <p className="text-right text-[11px] text-slate-400">Última consulta: {atualizadoEm.toLocaleString("pt-BR")}</p>}
    <Modal open={documento !== null} onClose={() => setDocumento(null)} title={documento?.nome || "Documento"} description={documento ? `${nome} · ${documento.periodo}` : undefined} size="wide" icon={<AuditIcon tipo="documento" className="h-7 w-7" />}>{documento && <DocumentDetails documento={documento} />}</Modal>
    <Modal open={adaptacao !== null} onClose={() => setAdaptacao(null)} title={adaptacao?.componenteCurricular || "Adaptação pedagógica"} description={adaptacao ? `${adaptacao.professorNome || "Professor não informado"} · ${adaptacao.semestreAno || "Período não informado"}` : undefined} size="wide" icon={<AuditIcon tipo="adaptacao" className="h-7 w-7" />}>{adaptacao && <div className="space-y-5"><ProfileFields campos={[["Situação", adaptacao.arquivado ? "Arquivada" : "Em acompanhamento"], ["Registrada em", dataPerfil(adaptacao.dataCriacao, true)], ["Atualizada em", dataPerfil(adaptacao.dataAtualizacao, true)], ["Objetivo geral", adaptacao.objetivoGeral], ["Objetivos específicos", adaptacao.objetivosEspecificos], ["Conteúdos programáticos", adaptacao.conteudosProgramaticos], ["Metodologia", adaptacao.metodologia], ["Avaliação", adaptacao.avaliacao], ["Bibliografia básica", adaptacao.bibliografiaBasica], ["Bibliografia complementar", adaptacao.bibliografiaComplementar]]} /><Button variant="secondary" onClick={() => { setFiltroAdaptacao(adaptacao.id); setAdaptacao(null); setAbaAtiva("historico"); }} icon={<AuditIcon tipo="historico" />}>Ver alterações desta adaptação</Button></div>}</Modal>
    {gerarDocumento && <StudentDocumentGeneration dados={dados} onClose={() => setGerarDocumento(false)} />}
    {revisao && <AuditDetails registro={revisao} onClose={() => setRevisao(null)} />}
  </div>;
}
