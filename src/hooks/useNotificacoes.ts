import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { notificacoesService, type NotificacaoFluxo } from "../services/notificacoesService";
import { mensagemErro } from "../services/apiError";
import axios from "axios";
export function useNotificacoes() {
  const { usuario } = useAuth(); const conta = usuario?.id;
  const [estado, setEstado] = useState<{ conta?: number; avisos: NotificacaoFluxo[]; erro: string }>({ avisos: [], erro: "" });
  const [versao, setVersao] = useState(0);
  useEffect(() => {
    if (!conta) return;
    const controller = new AbortController(); let consultando = false; let indisponivel = false;
    async function carregar() {
      if (consultando || indisponivel) return; consultando = true;
      try { const avisos = await notificacoesService.listar(controller.signal); if (!controller.signal.aborted) setEstado({ conta, avisos, erro: "" }); }
      catch (erro) { if (!controller.signal.aborted) { indisponivel = axios.isAxiosError(erro) && erro.response?.status === 404; setEstado(atual => ({ conta, avisos: atual.conta === conta ? atual.avisos : [], erro: indisponivel ? 'O serviço de notificações precisa do backend atualizado. Atualize esta consulta após reiniciar o backend.' : mensagemErro(erro) })); } }
      finally { consultando = false; }
    }
    void carregar();
    const intervalo = window.setInterval(() => { if (document.visibilityState === "visible") void carregar(); }, 30000);
    const atualizar = () => { if (document.visibilityState === "visible") void carregar(); };
    document.addEventListener("visibilitychange", atualizar);
    return () => { controller.abort(); window.clearInterval(intervalo); document.removeEventListener("visibilitychange", atualizar); };
  }, [conta, versao]);
  async function ler(id: number) {
    try { const aviso = await notificacoesService.ler(id); setEstado(atual => atual.conta === conta ? { ...atual, avisos: atual.avisos.map(n => n.id === id ? aviso : n) } : atual); }
    catch (erro) { setEstado(atual => atual.conta === conta ? { ...atual, erro: mensagemErro(erro) } : atual); }
  }
  return { usuario, avisos: estado.conta === conta ? estado.avisos : [], solicitacoes: [], erro: estado.conta === conta ? estado.erro : "", carregando: !!conta && estado.conta !== conta, ler, atualizar: () => setVersao(v => v + 1) };
}
