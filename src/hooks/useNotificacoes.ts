import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { notificacoesService, type NotificacaoFluxo } from "../services/notificacoesService";
import { solicitacoesAcessoService, podeAnalisarAcesso } from "../services/solicitacoesAcessoService";
import type { SolicitacaoAcesso } from "../types/auth";
import { mensagemErro } from "../services/apiError";
import axios from "axios";
import { detectarNovasOcorrencias } from "../services/ocorrenciaAlertModel";
export function useNotificacoes() {
  const { usuario } = useAuth(); const conta = usuario?.id; const analise=podeAnalisarAcesso(usuario);
  const [estado, setEstado] = useState<{ conta?: number; avisos: NotificacaoFluxo[]; alertas: NotificacaoFluxo[]; sonoros: number[]; solicitacoes: SolicitacaoAcesso[]; erro: string }>({ avisos: [], alertas: [], sonoros: [], solicitacoes: [], erro: "" });
  const vistas = useRef<{ conta?: number; ids: Set<number> | null }>({ ids: null });
  const [versao, setVersao] = useState(0);
  useEffect(() => {
    if (!conta) return;
    const controller = new AbortController(); let consultando = false; let indisponivel = false;
    async function carregar() {
      if (consultando || indisponivel) return; consultando = true;
      try {
        const [mensagens,pedidos]=await Promise.allSettled([notificacoesService.listar(controller.signal, true),analise ? solicitacoesAcessoService.listar(false,controller.signal, true) : Promise.resolve([])]);
        if (controller.signal.aborted) return;
        const erros=[mensagens,pedidos].filter((r): r is PromiseRejectedResult=>r.status==='rejected');
        indisponivel=erros.some(r=>axios.isAxiosError(r.reason) && r.reason.response?.status===404);
        let novas: NotificacaoFluxo[] = []; let iniciais: NotificacaoFluxo[] = [];
        if (mensagens.status === "fulfilled") { const resultado = detectarNovasOcorrencias(vistas.current.conta === conta ? vistas.current.ids : null, mensagens.value); vistas.current = { conta, ids: resultado.ids }; novas = resultado.novas; iniciais = resultado.iniciais; }
        setEstado(atual=>({ conta, alertas: [...novas, ...iniciais, ...(atual.conta === conta ? atual.alertas : [])].slice(0, 20), sonoros: [...novas.map(n => n.id), ...(atual.conta === conta ? atual.sonoros : [])].slice(0, 100), avisos:mensagens.status==='fulfilled' ? mensagens.value : atual.conta===conta ? atual.avisos : [], solicitacoes:pedidos.status==='fulfilled' ? pedidos.value : atual.conta===conta ? atual.solicitacoes : [], erro:indisponivel ? 'As notificações estão temporariamente indisponíveis. Tente atualizar a consulta em alguns instantes.' : erros.map(r=>mensagemErro(r.reason)).join(' ') }));
      } finally { consultando = false; }
    }
    void carregar();
    const intervalo = window.setInterval(() => { if (document.visibilityState === "visible") void carregar(); }, 5000);
    const atualizar = () => { if (document.visibilityState === "visible") void carregar(); };
    const alteradas=()=>{indisponivel=false;void carregar();};
    const sincronizar = (e: StorageEvent) => { if(e.key === "portal:ocorrencia-registrada") alteradas(); };
    window.addEventListener("storage",sincronizar);
    document.addEventListener("visibilitychange", atualizar); window.addEventListener('portal:access-requests-changed',alteradas); window.addEventListener('portal:notifications-changed',alteradas);
    return () => { window.removeEventListener("storage",sincronizar); controller.abort(); window.clearInterval(intervalo); document.removeEventListener("visibilitychange", atualizar); window.removeEventListener('portal:access-requests-changed',alteradas); window.removeEventListener('portal:notifications-changed',alteradas); };
  }, [conta, versao, analise]);
  async function ler(id: number) {
    try { const aviso = await notificacoesService.ler(id); setEstado(atual => atual.conta === conta ? { ...atual, avisos: atual.avisos.map(n => n.id === id ? aviso : n) } : atual); window.dispatchEvent(new Event('portal:notifications-changed')); }
    catch (erro) { setEstado(atual => atual.conta === conta ? { ...atual, erro: mensagemErro(erro) } : atual); }
  }
  return { usuario, alertasSonoros: estado.conta === conta ? estado.sonoros : [], alertas: estado.conta === conta ? estado.alertas.filter(n => !estado.avisos.find(a => a.id === n.id)?.lida) : [], fecharAlerta: (id: number) => setEstado(e => ({ ...e, alertas: e.alertas.filter(n => n.id !== id) })), avisos: estado.conta === conta ? estado.avisos : [], solicitacoes:analise && estado.conta===conta ? estado.solicitacoes : [], erro: estado.conta === conta ? estado.erro : "", carregando: !!conta && estado.conta !== conta, ler, atualizar: () => setVersao(v => v + 1) };
}
