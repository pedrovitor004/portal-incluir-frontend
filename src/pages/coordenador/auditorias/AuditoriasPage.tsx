import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AuditoriasTable from "./components/AuditoriasTable";
import AuditSummary from "./components/AuditSummary";
import AuditDetails from "./components/AuditDetails";
import Button from "../../../components/common/Button";
import { AuditIcon } from "./components/AuditVisuals";
import { auditoriasService } from "../../../services/auditoriasService";
import { confirmarAtualizacaoAuditorias } from "../../../services/auditConfirmation";
import { notificationService } from "../../../services/notificationService";
import { mensagemErro } from "../../../services/apiError";
import type { ConsultaAuditoria, FiltroRapidoAuditoria, RegistroAuditoria } from "../../../types/auditoria";

export default function AuditoriasPage() {
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapidoAuditoria | null>(null);
  function filtrar(tipo: FiltroRapidoAuditoria["tipo"], tabela?: string) { setFiltroRapido(atual => ({ tipo, tabela, versao: (atual?.versao ?? 0) + 1 })); document.getElementById("auditorias-historico")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" }); }
  const [versao, setVersao] = useState(0);
  const [dados, setDados] = useState<ConsultaAuditoria | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const [erro, setErro] = useState("");
  const [selecionado, setSelecionado] = useState<RegistroAuditoria | null>(null);
  const operacaoPendente = useRef(false);
  useEffect(() => { document.title = "Auditorias | Portal Incluir"; }, []);
  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;
    auditoriasService.listarHistorico(controller.signal)
      .then(resultado => {
        if (!ativo) return;
        setDados(resultado); setAtualizadoEm(new Date());
        if (versao > 0) notificationService.success("Auditorias atualizadas com sucesso!");
      })
      .catch(error => { if (ativo && !axios.isCancel(error)) setErro(axios.isAxiosError(error) && error.response?.status === 401 ? "Sua sessão expirou. Entre novamente para consultar as auditorias." : mensagemErro(error)); })
      .finally(() => { if (ativo) { setCarregando(false); operacaoPendente.current = false; } });
    return () => { ativo = false; controller.abort(); };
  }, [versao]);
  async function atualizar() {
    if (operacaoPendente.current || carregando) return;
    operacaoPendente.current = true; setConfirmando(true);
    try {
      if (!await confirmarAtualizacaoAuditorias()) { operacaoPendente.current = false; return; }
      setCarregando(true); setErro(""); setVersao(atual => atual + 1);
    } catch { operacaoPendente.current = false; notificationService.error("Não foi possível iniciar a atualização. Tente novamente."); }
    finally { setConfirmando(false); }
  }
  return <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 data-page-title className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">Auditorias</h1><p className="mt-1.5 text-sm text-slate-500">Acompanhe as movimentações e consulte o histórico de alterações do Portal Incluir.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-[#dce5dc] bg-white px-3 py-2 text-xs font-medium text-slate-500"><AuditIcon tipo="escudo" className="h-4 w-4 text-green-700" />Consulta da coordenação</span></header>
    <AuditSummary registros={dados?.registros ?? []} carregando={carregando} disponivel={dados !== null} atualizadoEm={atualizadoEm} onFilter={filtrar} onView={setSelecionado} />
    {erro && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div><p className="font-semibold">Não foi possível atualizar o histórico.</p><p className="mt-1">{erro}</p>{dados && <p className="mt-1 text-xs">Os registros exibidos são da última consulta concluída.</p>}</div><Button variant="secondary" disabled={carregando || confirmando} onClick={() => void atualizar()} icon={<AuditIcon tipo="atualizar" />}>Tentar novamente</Button></div>}
    <AuditoriasTable filtroRapido={filtroRapido} registros={dados?.registros ?? []} carregando={carregando} confirmando={confirmando} onView={setSelecionado} onRefresh={() => void atualizar()} />
    {selecionado && <AuditDetails registro={selecionado} onClose={() => setSelecionado(null)} />}
  </div>;
}
