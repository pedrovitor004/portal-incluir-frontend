import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { notificacoesService, type NotificacaoFluxo } from "../services/notificacoesService";
import { solicitacoesAcessoService, podeAnalisarAcesso } from "../services/solicitacoesAcessoService";
import type { SolicitacaoAcesso } from "../types/auth";
import { mensagemErro } from "../services/apiError";
import axios from "axios";
export function useNotificacoes() {
  const { usuario } = useAuth(); const conta = usuario?.id; const analise=podeAnalisarAcesso(usuario);
  const [estado, setEstado] = useState<{ conta?: number; avisos: NotificacaoFluxo[]; solicitacoes: SolicitacaoAcesso[]; erro: string }>({ avisos: [], solicitacoes: [], erro: "" });
  const [versao, setVersao] = useState(0);
  useEffect(() => {
    if (!conta) return;
    const controller = new AbortController(); let consultando = false; let indisponivel = false;
    async function carregar() {
      if (consultando || indisponivel) return; consultando = true;
      try {
        const [mensagens,pedidos]=await Promise.allSettled([notificacoesService.listar(controller.signal),analise ? solicitacoesAcessoService.listar(false,controller.signal) : Promise.resolve([])]);
        if (controller.signal.aborted) return;
        const erros=[mensagens,pedidos].filter((r): r is PromiseRejectedResult=>r.status==='rejected');
        indisponivel=erros.some(r=>axios.isAxiosError(r.reason) && r.reason.response?.status===404);
        setEstado(atual=>({ conta, avisos:mensagens.status==='fulfilled' ? mensagens.value : atual.conta===conta ? atual.avisos : [], solicitacoes:pedidos.status==='fulfilled' ? pedidos.value : atual.conta===conta ? atual.solicitacoes : [], erro:indisponivel ? 'O serviço de notificações precisa do backend atualizado. Reinicie o backend e atualize esta consulta.' : erros.map(r=>mensagemErro(r.reason)).join(' ') }));
      } finally { consultando = false; }
    }
    void carregar();
    const intervalo = window.setInterval(() => { if (document.visibilityState === "visible") void carregar(); }, 30000);
    const atualizar = () => { if (document.visibilityState === "visible") void carregar(); };
    const alteradas=()=>{indisponivel=false;void carregar();};
    document.addEventListener("visibilitychange", atualizar); window.addEventListener('portal:access-requests-changed',alteradas);
    return () => { controller.abort(); window.clearInterval(intervalo); document.removeEventListener("visibilitychange", atualizar); window.removeEventListener('portal:access-requests-changed',alteradas); };
  }, [conta, versao, analise]);
  async function ler(id: number) {
    try { const aviso = await notificacoesService.ler(id); setEstado(atual => atual.conta === conta ? { ...atual, avisos: atual.avisos.map(n => n.id === id ? aviso : n) } : atual); }
    catch (erro) { setEstado(atual => atual.conta === conta ? { ...atual, erro: mensagemErro(erro) } : atual); }
  }
  return { usuario, avisos: estado.conta === conta ? estado.avisos : [], solicitacoes:analise && estado.conta===conta ? estado.solicitacoes : [], erro: estado.conta === conta ? estado.erro : "", carregando: !!conta && estado.conta !== conta, ler, atualizar: () => setVersao(v => v + 1) };
}
