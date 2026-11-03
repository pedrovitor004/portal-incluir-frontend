import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { accessProfiles, canAccess } from "../../../config/access";
import { oferecerEncaminhamento, encaminharEtapa } from "../../../services/fluxoEstudanteAlerts";
import { estudantesService } from "../../../services/estudantesService";
import { http } from "../../../services/http";
import { mapearDocumento, type PlanoResponse } from "../../../services/documentosService";
import { mensagemErro } from "../../../services/apiError";
import type { EstudanteResponse } from "../../../types/estudante";
import type { Documento } from "../../../types/documento";
import StudentFlow from "./components/StudentFlow";
import StudentExport from "./components/StudentExport";
import DocumentDetails from "../documentos/components/DocumentDetails";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import Modal from "../../../components/common/Modal";
import PeiForm from "./components/PeiForm";
import { planoEducacionalService } from "../../../services/planoEducacionalService";
import type { PlanoEducacionalResponse } from "../../../types/planoEducacional";

function documentoPei(pei: PlanoEducacionalResponse) {
  return mapearDocumento({ ...pei, dataCriacao: pei.dataCriacao ?? undefined, dataAtualizacao: pei.dataAtualizacao ?? undefined }, "PEI");
}

export default function EtapaDocumentoPage() {
  const { id, etapa } = useParams();
  return <Conteudo key={`${id}-${etapa}`} id={Number(id)} etapa={etapa === "rai" ? "rai" : "pei"} />;
}
function Conteudo({ id, etapa }: { id: number; etapa: "pei" | "rai" }) {
  const { usuario } = useAuth();
  const base = accessProfiles[usuario?.perfil ?? "COORDENADOR"].basePath;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const peiId = params.get("peiId");
  const coordenador = usuario?.perfil === "COORDENADOR";
  const podeEditar = coordenador && canAccess(usuario, "pei.editar");
  const formularioAberto = etapa === "pei" && coordenador && (peiId !== null || params.get("novo") === "1");
  const [versaoPei, setVersaoPei] = useState(0);
  const [salvandoPei, setSalvandoPei] = useState(false);
  const [encaminhando, setEncaminhando] = useState(false);
  const podeAtribuir = !!usuario && ["COORDENADOR", "ADMINISTRADOR"].includes(usuario.perfil) && canAccess(usuario, "estudantes.vincular");
  const [estudante, setEstudante] = useState<EstudanteResponse | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [selecionado, setSelecionado] = useState<Documento | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  function fecharFormulario() {
    const proximos = new URLSearchParams(params);
    proximos.delete("peiId"); proximos.delete("novo"); setParams(proximos, { replace: true });
  }
  function abrirFormulario(documento?: Documento) {
    const proximos = new URLSearchParams(params);
    proximos.delete("peiId"); proximos.delete("novo");
    if (documento) proximos.set("peiId", String(documento.id)); else proximos.set("novo", "1");
    setParams(proximos);
  }
  function salvo(pei: PlanoEducacionalResponse) {
    const documento = documentoPei(pei);
    setDocumentos(atuais => [...atuais.filter(d => d.id !== documento.id), documento]);
    setSelecionado(null);
    setVersaoPei(v => v + 1);
    fecharFormulario();
  }
  async function avancar() {
    if (encaminhando || carregando || erro || !estudante) return;
    setEncaminhando(true);
    try {
      if (!documentos.some(d => !d.arquivado)) {
        if (!await oferecerEncaminhamento(["Registrar um PEI para este estudante"], podeAtribuir && !estudante.concluido && estudante.ativo)) return;
        if (!await encaminharEtapa(id, "PEI", base)) return;
      }
      navigate(`${base}/estudantes/${id}/etapas/rai`);
    } finally { setEncaminhando(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Estudante inválido");
        const cadastro = await estudantesService.buscarPorId(id);
        if (controller.signal.aborted) return;
        setEstudante(cadastro);
        if (etapa === "pei") {
          if (coordenador) {
            const peis = await planoEducacionalService.listarPorEstudante(id, controller.signal);
            if (!controller.signal.aborted) setDocumentos(peis.filter(p => p.estudanteId === id).map(documentoPei));
          } else {
            const resposta = await http.get<PlanoResponse[]>(`/planos-educacionais/estudante/${id}`, { signal: controller.signal });
            if (!controller.signal.aborted) setDocumentos(resposta.data.filter(p => p.estudanteId === id).map(p => mapearDocumento(p, "PEI")));
          }
        }
      } catch (e) { if (!controller.signal.aborted) setErro(mensagemErro(e)); }
      finally { if (!controller.signal.aborted) setCarregando(false); }
    }
    void carregar(); return () => controller.abort();
  }, [id, etapa, coordenador]);
  return <main className="mx-auto max-w-[1100px] space-y-6 pb-10">
    <header><Link to={`${base}/estudantes/${id}`} className="text-sm font-semibold text-green-800 hover:underline">← Voltar ao perfil do estudante</Link><h1 className="mt-4 text-2xl font-bold text-primary">{etapa === "pei" ? "Plano Educacional Individualizado" : "Relatório de Acompanhamento Individual"}</h1>{estudante && <p className="mt-2 text-sm text-slate-600">{estudante.nomeCompleto} · Matrícula {estudante.matricula}</p>}</header>
    <StudentFlow key={versaoPei} estudanteId={id} atual={etapa} peiRegistrado={etapa === "pei" && !carregando && !erro ? documentos.some(d => !d.arquivado) : undefined} somenteLeitura={estudante?.concluido} />
    {carregando && <LoadingState label="Carregando os registros desta etapa..." />}
    {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
    {!carregando && estudante && etapa === "pei" && <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold text-slate-800">PEIs do estudante</h2>{podeEditar && <Button disabled={salvandoPei || !!erro || estudante.concluido} onClick={() => abrirFormulario()}>Novo PEI</Button>}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{coordenador ? "Consulte os registros ou selecione um PEI para edição. Cada documento é salvo individualmente." : "O formulário desta etapa está em desenvolvimento. Os PEIs já registrados podem ser consultados abaixo."}</p>
      <div className="mt-5 divide-y divide-slate-100">{documentos.map(d => <div key={d.chave} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="text-sm font-semibold text-slate-800">PEI · {d.periodo}{coordenador && ` · Registro ${d.id}`}</p><p className="mt-1 text-xs text-slate-500">{d.status}</p></div><div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => setSelecionado(d)}>Consultar PEI</Button>{podeEditar && <Button variant="secondary" disabled={salvandoPei || !!erro || d.arquivado || estudante.concluido} onClick={() => abrirFormulario(d)}>Editar PEI</Button>}</div></div>)}</div>
      {!documentos.length && !erro && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Nenhum PEI registrado para este estudante.</p>}
    </section>}
    {!carregando && !erro && estudante && formularioAberto && <PeiForm key={`${id}-${usuario?.id}-${peiId ?? "novo"}`} estudante={estudante} peiId={peiId} onSaved={salvo} onCancel={fecharFormulario} onBusyChange={setSalvandoPei} />}
    {!carregando && estudante && etapa === "rai" && <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"><div><h2 className="font-semibold text-slate-800">Emitir relatório acumulativo</h2><p className="mt-2 text-sm leading-6 text-slate-500">O RAI reúne a anamnese, os planos de ação, os PEIs e as adaptações salvas até a emissão. Você pode gerar uma nova versão conforme o acompanhamento avançar.</p></div><StudentExport estudanteId={id} tipo="rai" /></section>}
    <div className="flex flex-wrap justify-between gap-3"><Link to={`${base}/${etapa === "pei" ? `plano-acao?estudanteId=${id}` : `estudantes/${id}/etapas/pei`}`} onClick={event => { if (salvandoPei) event.preventDefault(); }} aria-disabled={salvandoPei || undefined} className="text-sm font-semibold text-green-800 hover:underline">← {etapa === "pei" ? "Plano de ação" : "PEI"}</Link>{etapa === "pei" && <Button disabled={salvandoPei || encaminhando || carregando || !!erro} onClick={() => void avancar()}>{encaminhando ? "Encaminhando..." : "Continuar para RAI →"}</Button>}</div>
    <Modal open={selecionado !== null} onClose={() => setSelecionado(null)} title="PEI do estudante" size="wide">{selecionado && <DocumentDetails documento={selecionado} />}</Modal>
  </main>;
}
