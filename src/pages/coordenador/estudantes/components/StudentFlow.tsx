import { useEffect, useState } from "react";
import FlowTimeline from "./FlowTimeline";
import { useAuth } from "../../../../hooks/useAuth";
import { accessProfiles, canAccess } from "../../../../config/access";
import { fluxoEstudanteService, type FluxoEstudante, type EtapaFluxo } from "../../../../services/fluxoEstudanteService";
import { encaminharEtapa } from "../../../../services/fluxoEstudanteAlerts";
import { mensagemErroFluxo } from "../../../../services/fluxoEstudanteError";
import Button from "../../../../components/common/Button";

export default function StudentFlow({ estudanteId, atual, planoStatus, peiRegistrado, somenteLeitura = false, onRetry }: {
  estudanteId?: number; atual: "anamnese" | "plano" | "pei" | "rai" | "perfil"; planoStatus?: string; peiRegistrado?: boolean; somenteLeitura?: boolean; onRetry?: () => void;
}) {
  const { usuario } = useAuth();
  const base = accessProfiles[usuario?.perfil ?? "COORDENADOR"].basePath;
  const gestao = !!usuario && canAccess(usuario, "estudantes.vincular");
  const [fluxoConsultado, setFluxo] = useState<FluxoEstudante | null>(null);
  const fluxo = fluxoConsultado?.estudanteId === estudanteId ? fluxoConsultado : null;
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    if (!estudanteId) return;
    const controller = new AbortController();
    fluxoEstudanteService.consultar(estudanteId, controller.signal).then(d => { if (!controller.signal.aborted) { setFluxo(d); setErro(""); } }).catch(e => { if (!controller.signal.aborted) setErro(mensagemErroFluxo(e)); });
    return () => controller.abort();
  }, [estudanteId, gestao, tentativa]);
  async function atribuir(etapa: EtapaFluxo) {
    if (!estudanteId || ocupado) return;
    setOcupado(true); setErro("");
    try { if (await encaminharEtapa(estudanteId, etapa, base)) setTentativa(v => v + 1); }
    catch (e) { setErro(mensagemErroFluxo(e)); }
    finally { setOcupado(false); }
  }
  const statusPlano = planoStatus ?? fluxo?.planoStatus;
  const temPei = peiRegistrado ?? fluxo?.peiRegistrado;
  const etapas = [
    { id: "anamnese", titulo: "Anamnese e cadastro inicial", etapa: "ANAMNESE" as const, estado: fluxo ? ({ PENDENTE: "Pendente", RASCUNHO: "Rascunho", CONCLUIDA: "Concluída" }[fluxo.anamneseStatus]) : estudanteId ? "A verificar" : "Pendente", href: estudanteId ? `${base}/anamnese?estudanteId=${estudanteId}` : undefined },
    { id: "plano", titulo: "Plano de ação", etapa: "PLANO_ACAO" as const, estado: statusPlano === "ASSINADO" ? "Concluído · Assinado" : statusPlano === "RASCUNHO" ? "Rascunho" : estudanteId && !fluxo ? "Não consultado" : "Pendente", href: estudanteId ? `${base}/plano-acao?estudanteId=${estudanteId}` : undefined },
    { id: "pei", titulo: "PEI", etapa: "PEI" as const, estado: temPei ? "Registrado" : estudanteId && !fluxo ? "Não consultado" : "Pendente", href: estudanteId ? `${base}/estudantes/${estudanteId}/etapas/pei` : undefined },
    { id: "rai", titulo: "RAI", estado: "Acumulativo", href: estudanteId ? `${base}/estudantes/${estudanteId}/etapas/rai` : undefined },
  ];
  return <section aria-label="Etapas do acompanhamento" className="rounded-2xl border border-green-100 bg-white p-4 sm:p-5">
    <h2 className="font-semibold text-primary">Acompanhamento do estudante</h2>
    <p className="mt-1 text-xs leading-5 text-slate-500">Salve cada etapa para continuar depois. As etapas podem ser acessadas sem concluir as anteriores.</p>
    <div className="mt-5"><FlowTimeline atual={atual} passos={etapas.map(etapa => ({ ...etapa, resumo: etapa.estado, concluido: etapa.id === "anamnese" ? fluxo?.anamneseStatus === "CONCLUIDA" : etapa.id === "plano" ? statusPlano === "ASSINADO" : etapa.id === "pei" ? temPei : false }))} /></div>
    {estudanteId && fluxo && <details className="mt-4 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-sm font-semibold text-green-800">Responsáveis por etapa</summary><p className="mt-3 text-xs text-slate-500">O encaminhamento considera os dados já salvos. Salve alterações do formulário antes de atribuir uma tarefa.</p><div className="mt-4 grid gap-4 sm:grid-cols-3">{etapas.filter(etapa => etapa.etapa).map(etapa => <div key={etapa.id}><p className="text-sm text-slate-600">{etapa.titulo}: {fluxo.responsaveis[etapa.etapa!]?.nome ?? "Coordenação"}</p>{gestao && <Button variant="secondary" className="mt-2" disabled={ocupado || somenteLeitura} onClick={() => void atribuir(etapa.etapa!)}>Encaminhar tarefa</Button>}</div>)}</div></details>}
    {erro && <div role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><p>{erro}</p><Button variant="secondary" className="mt-3" onClick={() => onRetry ? onRetry() : setTentativa(v => v + 1)}>Consultar andamento novamente</Button></div>}
  </section>;
}
