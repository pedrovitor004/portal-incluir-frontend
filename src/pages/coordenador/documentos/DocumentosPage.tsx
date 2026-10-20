import Button from "../../../components/common/Button";
import { acoesDocumento, type AcaoDocumento } from "../../../config/documentActions";
import { confirmarAcaoDocumento } from "../../../services/documentConfirmation";
import LoadingState from "../../../components/common/LoadingState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useDocumentos } from "../../../hooks/useDocumentos";
import type { Documento, FiltroDocumento } from "../../../types/documento";
import { nomeTipoDocumento } from "../../../config/documentos";
import { documentosService } from "../../../services/documentosService";
import { mensagemErro } from "../../../services/apiError";
import { notificationService } from "../../../services/notificationService";
import Modal from "../../../components/common/Modal";
import DocumentTypeCards from "./components/DocumentTypeCards";
import DocumentsTable from "./components/DocumentsTable";
import DocumentDetails from "./components/DocumentDetails";


type Acao = { tipo: "visualizar" | AcaoDocumento; documento: Documento } | null;

export default function DocumentosPage() {
  useEffect(() => { document.title = "Documentos | Portal Incluir"; }, []);
  const { consulta, carregando, recarregar, remover, atualizar } = useDocumentos();
  const [filtro, setFiltro] = useState<FiltroDocumento>("TODOS");
  const [filtroSolicitado, setFiltroSolicitado] = useState<{ tipo: FiltroDocumento; limpar: boolean }>({ tipo: "TODOS", limpar: false });
  const [visiveis, setVisiveis] = useState(0);
  const [acao, setAcao] = useState<Acao>(null);
  const [executando, setExecutando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const operacaoPendente = useRef(false);
  const navigate = useNavigate();
  const documentos = useMemo(() => consulta?.documentos ?? [], [consulta]);
  const visualizar = useCallback((documento: Documento) => setAcao({ tipo: "visualizar", documento }), []);
  const pedirAcao = useCallback((documento: Documento, tipo: AcaoDocumento) => { setErroAcao(""); setAcao({ tipo, documento }); }, []);
  const editar = useCallback((documento: Documento) => {
    const destinos = { PEI: "pei", ANAMNESE: "anamnese", PLANO_ACAO: "plano-acao", RAI: "rai" };
    navigate(`/coordenador/${destinos[documento.tipo]}/${documento.id}/editar`);
  }, [navigate]);
  async function executarAcao() {
    if (!acao || acao.tipo === "visualizar" || operacaoPendente.current) return;
    const { tipo, documento } = acao;
    operacaoPendente.current = true; setExecutando(true); setConfirmando(true); setErroAcao("");
    try {
      if (!await confirmarAcaoDocumento(tipo, documento)) return;
      setConfirmando(false);
      const atualizado = await documentosService.executar(documento, tipo);
      if (atualizado) atualizar(atualizado); else remover(documento.chave);
      setAcao(null); notificationService.success(acoesDocumento[tipo].sucesso);
    } catch (error) { setErroAcao(mensagemErro(error)); }
    finally { operacaoPendente.current = false; setExecutando(false); setConfirmando(false); }
  }
  const configAcao = acao && acao.tipo !== "visualizar" ? acoesDocumento[acao.tipo] : null;
  const pendente = filtro === "ANAMNESE" || filtro === "RAI";
  const falhas = consulta?.falhas.filter(f => filtro === "TODOS" || f.tipo === filtro) ?? [];
  const vazio = pendente ? `A consulta de ${filtro === "RAI" ? "RAIs" : "anamneses"} estará disponível em breve.` : falhas.length ? "Não foi possível consultar os documentos deste tipo." : "Nenhum documento encontrado para os filtros selecionados.";

  return <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-6">
    <header><h1 data-page-title className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">Documentos</h1><p className="mt-1 text-sm text-slate-500">Consulte os registros de acompanhamento dos estudantes e encontre cada documento por tipo.</p></header>
    {carregando && <LoadingState compact label="Carregando dados da página de documentos..." />}
    <DocumentTypeCards selecionado={filtro} onSelect={tipo => { setFiltro(tipo); setFiltroSolicitado({ tipo, limpar: false }); }} consulta={consulta} />
    {falhas.length > 0 && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div><p className="font-semibold">Alguns documentos não puderam ser consultados.</p>{falhas.map(f => <p key={f.tipo} className="mt-1">{nomeTipoDocumento[f.tipo]}: {f.mensagem}</p>)}</div>
      <button type="button" className="min-h-10 rounded-lg border border-amber-300 bg-white px-4 font-semibold focus-visible:outline-2 focus-visible:outline-amber-700" onClick={recarregar}>Tentar novamente</button>
    </div>}
    {pendente && <p role="status" className="text-sm text-slate-600">{vazio}</p>}
    <section aria-labelledby="lista-documentos-titulo" className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-[0_4px_20px_rgba(24,91,50,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div><h2 id="lista-documentos-titulo" className="text-base font-semibold text-slate-800">{filtro === "TODOS" ? "Todos os documentos" : nomeTipoDocumento[filtro]}</h2><p className="mt-1 text-xs text-slate-500">Use os filtros nos cabeçalhos para buscar por estudante, matrícula, data ou status.</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={carregando || executando} onClick={() => { setFiltro("TODOS"); setFiltroSolicitado({ tipo: "TODOS", limpar: true }); }} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16l-6 7v5l-4 4v-9L4 4ZM16 16l5 5m0-5-5 5" /></svg>}>Limpar filtros</Button>
        <span aria-live="polite" className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">{carregando ? "Carregando..." : `${visiveis} documento(s)`}</span>
        </div>
      </div>
      <DocumentsTable filtroSolicitado={filtroSolicitado} onTipoFiltrado={setFiltro} documentos={documentos} carregando={carregando} onView={visualizar} onEdit={editar} onAction={pedirAcao} onFilter={setVisiveis} bloqueado={executando || carregando} />
    </section>
    <Modal open={acao !== null} onClose={() => { if (!executando) setAcao(null); }} busy={executando} size={configAcao ? "default" : "wide"} tone={configAcao?.tom || "blue"}
      icon={configAcao ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><path d={configAcao.icone} /></svg> : undefined}
      title={configAcao?.titulo || acao?.documento.nome || "Documento"}
      description={configAcao ? "Confira os dados do documento antes de continuar." : "Informações registradas no acompanhamento do estudante."}>
      {acao?.tipo === "visualizar" && <DocumentDetails documento={acao.documento} />}
      {acao && configAcao && <div className="space-y-5">
        <div className="rounded-xl bg-[var(--accent-soft)] p-4"><p className="font-semibold text-[var(--accent-main)]">{acao.documento.nome}</p><p className="mt-1 text-slate-700">{acao.documento.estudanteNome}</p><p className="mt-1 text-xs text-slate-500">Matrícula: {acao.documento.estudanteMatricula} · {acao.documento.periodo}</p></div>
        <p className="text-slate-600">{configAcao.descricao}</p>
        {erroAcao && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{erroAcao}</p>}
        {executando && <LoadingState compact label={confirmando ? "Aguardando confirmação..." : configAcao.progresso} />}
        <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={executando} onClick={() => setAcao(null)} className="min-h-11 rounded-xl border border-slate-300 px-4 font-semibold disabled:opacity-50">Cancelar</button><button type="button" disabled={executando} onClick={() => void executarAcao()} className="min-h-11 rounded-xl bg-[var(--accent-main)] px-4 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-main)]">{executando ? "Aguarde..." : `Continuar para ${configAcao.botao.toLowerCase()}`}</button></div>
      </div>}
    </Modal>
  </div>;
}
