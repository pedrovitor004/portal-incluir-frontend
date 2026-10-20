import ReportConfiguration from "./components/ReportConfiguration";
import { confirmarRelatorio } from "../../../services/reportConfirmation";
import ReportIcon from "./components/ReportIcon";
import Button from "../../../components/common/Button";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRelatorios } from "../../../hooks/useRelatorios";
import { filtrosIniciais, modelosRelatorio, notaMetodologica, referenciasRelatorio } from "../../../config/relatorios";
import type { CampoRelatorio, ModeloRelatorio } from "../../../types/relatorio";
import { montarRelatorio } from "../../../services/relatorios/relatorioModel";
import { relatoriosService } from "../../../services/relatorios/relatoriosService";
import { mensagemErro } from "../../../services/apiError";
import { notificationService } from "../../../services/notificationService";
import LoadingState from "../../../components/common/LoadingState";
import ReportFilters from "./components/ReportFilters";
import ReportCharts from "./components/ReportCharts";
import Modal from "../../../components/common/Modal";
import ReportPreview from "./components/ReportPreview";
export default function RelatoriosPage() {
  const { base, setBase, erro, carregando, recarregar } = useRelatorios();
  const [visualizacao, setVisualizacao] = useState<"tabela" | "graficos">("tabela");
  const [configurando, setConfigurando] = useState(false);
  const [confirmandoAtualizacao, setConfirmandoAtualizacao] = useState(false);
  const [sobre, setSobre] = useState(false);
  const [modelo, setModelo] = useState<ModeloRelatorio>("panorama");
  const [campos, setCampos] = useState<CampoRelatorio[]>(modelosRelatorio[0].campos);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [titulo, setTitulo] = useState("Estudantes por curso");
  const [exportando, setExportando] = useState<"pdf" | "xlsx" | null>(null);
  const [erroExportacao, setErroExportacao] = useState("");
  const exportacao = useRef<AbortController | null>(null);
  useEffect(() => { document.title = "Relatórios | Portal Incluir"; return () => exportacao.current?.abort(); }, []);
  const relatorio = useMemo(() => base && campos.length ? montarRelatorio(base, filtros, campos, modelo, titulo) : null, [base, filtros, campos, modelo, titulo]);
  const bloqueado = carregando || !!exportando || confirmandoAtualizacao;
  async function atualizarDados() {
    if (bloqueado) return;
    setConfirmandoAtualizacao(true);
    try { if (await confirmarRelatorio("atualizar")) recarregar(); }
    finally { setConfirmandoAtualizacao(false); }
  }
  async function gerar(formato: "pdf" | "xlsx") {
    if (exportacao.current || !relatorio?.linhas.length) return;
    const controller = new AbortController(); exportacao.current = controller; setExportando(formato); setErroExportacao("");
    try {
      const atualizada = await relatoriosService.consultar(controller.signal);
      if (controller.signal.aborted) return;
      setBase(atualizada);
      const atual = montarRelatorio(atualizada, filtros, campos, modelo, titulo);
      if (!atual.linhas.length) { setErroExportacao("A consulta atualizada não encontrou estudantes neste recorte. Revise os filtros."); return; }
      const { exportarRelatorio } = await import("../../../services/relatorios/exportarRelatorio");
      if (controller.signal.aborted) return;
      await exportarRelatorio(atual, formato);
      if (!controller.signal.aborted) notificationService.success("Relatório gerado com os dados da nova consulta.");
    } catch (error) { if (!controller.signal.aborted) setErroExportacao(mensagemErro(error)); }
    finally { exportacao.current = null; if (!controller.signal.aborted) setExportando(null); }
  }
  function selecionarModelo(id: ModeloRelatorio) {
    setModelo(id); setCampos(modelosRelatorio.find(m => m.id === id)!.campos);
    setTitulo(id === "panorama" ? "Estudantes por curso" : "Estudantes com documentos");
  }
  return <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-6">
    <header><h1 data-page-title className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">Relatórios</h1><p className="mt-1 text-sm text-slate-500">Consulte os dados dos estudantes e gere relatórios para a coordenação.</p></header>
    <ReportFilters base={base} filtros={filtros} onChange={setFiltros} modelo={modelo} onModelo={selecionarModelo} disabled={bloqueado || !base} />
    {erro && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800"><p>Não foi possível carregar os dados. {erro}</p><button onClick={() => void atualizarDados()} className="mt-2 min-h-10 font-semibold underline">Tentar novamente</button></div>}
    {erroExportacao && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{erroExportacao}</p>}
    <section aria-label="Gerar relatório" className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-[0_4px_20px_rgba(24,91,50,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-base font-semibold text-slate-800">{modelo === "panorama" ? "Estudantes por curso" : "Estudantes com documentos"}</h2><span aria-live="polite" className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">{carregando ? "Carregando..." : `${relatorio?.linhas.length || 0} curso(s)`}</span></div><p className="mt-1 text-xs text-slate-500">{base ? `Atualizado em ${new Date(base.consultadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : "Carregando dados..."}</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={bloqueado || !base} onClick={() => setConfigurando(true)} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 17h16M8 4v6m8 4v6" strokeLinecap="round" /></svg>}>Configurar relatório</Button>
          <Button disabled={bloqueado || !relatorio?.linhas.length} onClick={() => void gerar("pdf")} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M12 11v7m-3-3 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>}>Exportar PDF</Button>
          <Button variant="soft" disabled={bloqueado || !relatorio?.linhas.length} onClick={() => void gerar("xlsx")} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 3h16v18H4zM4 9h16M4 15h16M10 9v12" strokeLinejoin="round" /></svg>}>Exportar Excel</Button>
          <Button variant="secondary" iconOnly disabled={bloqueado} onClick={() => void atualizarDados()} title="Atualizar dados" aria-label="Atualizar dados" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
        </div>
      </div>
      <div role="group" aria-label="Visualização do relatório" className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
        <Button variant={visualizacao === "tabela" ? "soft" : "secondary"} aria-pressed={visualizacao === "tabela"} onClick={() => setVisualizacao("tabela")} icon={<ReportIcon name="tabela" />}>Tabela</Button>
        <Button variant={visualizacao === "graficos" ? "soft" : "secondary"} aria-pressed={visualizacao === "graficos"} onClick={() => setVisualizacao("graficos")} icon={<ReportIcon name="grafico" />}>Gráficos</Button>
        <span className="ml-auto text-xs text-slate-500">Consolidado por curso</span>
      </div>
      {visualizacao === "tabela" ? <ReportPreview relatorio={relatorio} campos={campos} carregando={carregando} /> : carregando ? <LoadingState label="Atualizando gráficos..." /> : base && <ReportCharts base={base} filtros={filtros} onChange={setFiltros} disabled={!!exportando} onVerTabela={() => setVisualizacao("tabela")} />}

      {exportando && <LoadingState compact label={`Preparando ${exportando === "pdf" ? "PDF" : "Excel"} com os dados atualizados...`} />}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>Totais por curso. A relação individual de estudantes ainda não está disponível.</span><button onClick={() => setSobre(true)} className="min-h-8 font-medium text-green-800 hover:underline">Sobre os dados</button></div>
    </section>
    {configurando && <ReportConfiguration modelo={modelo} inicial={{ titulo, campos, documento: filtros.documento }} onClose={() => setConfigurando(false)} onApply={valor => {
      setTitulo(valor.titulo); setCampos(valor.campos); setFiltros({ ...filtros, documento: valor.documento }); setConfigurando(false);
    }} />}
    <Modal open={sobre} onClose={() => setSobre(false)} title="Sobre os dados" description="Entenda as informações apresentadas no relatório.">
      <p className="text-slate-600">Os totais consideram os estudantes cadastrados no Portal Incluir. Ter um documento não arquivado não significa que o atendimento já foi realizado.</p><p className="mt-3 text-slate-600">O filtro de ingresso seleciona o período em que o estudante entrou na instituição. A exportação consulta os dados novamente.</p><p className="mt-3 text-slate-600">Informações de identificação e dados clínicos não estão disponíveis nesta etapa. A liberação depende do controle de acesso no servidor.</p>
      <details className="mt-5 border-t border-slate-100 pt-4"><summary className="cursor-pointer font-semibold text-green-800">Critérios de contagem e referências</summary><p className="mt-3 text-xs leading-relaxed text-slate-500">{notaMetodologica}</p>{!!base?.demonstracoesExcluidas && <p className="mt-3 text-xs text-slate-500">{base.demonstracoesExcluidas} documento(s) de demonstração desconsiderado(s).</p>}<ul className="mt-3 space-y-2">{referenciasRelatorio.map(ref => <li key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer" className="text-xs text-green-800 underline">{ref.titulo}</a></li>)}</ul></details>
    </Modal>
  </div>;
}
