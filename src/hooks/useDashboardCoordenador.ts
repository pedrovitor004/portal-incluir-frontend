import { notificationService } from "../services/notificationService";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { dashboardService } from "../services/dashboardService";
import { mensagemErro } from "../services/apiError";
import type { DashboardCoordenadorData } from "../types/dashboard";

export function useDashboardCoordenador() {
  const { usuario } = useAuth();
  const perfilId = usuario?.perfilId;
  const [resultado, setResultado] = useState<{ perfilId: number; dados: DashboardCoordenadorData | null; erro: string } | null>(null);
  const dados = resultado && resultado.perfilId === perfilId ? resultado.dados : null;
  const erro = resultado && resultado.perfilId === perfilId ? resultado.erro : "";
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!perfilId) return;
    const controller = new AbortController();
    dashboardService.buscarCoordenador(perfilId, controller.signal)
      .then(result => { if (!controller.signal.aborted) setResultado({ perfilId, dados: result, erro: "" }); })
      .catch(error => {
        if (controller.signal.aborted) return;
        const mensagem = mensagemErro(error);
        setResultado({ perfilId, dados: null, erro: mensagem });
        notificationService.error(mensagem);
      });
    return () => controller.abort();
  }, [perfilId, tentativa]);

  function recarregar() { setResultado(null); setTentativa(t => t + 1); }
  return { dados, erro, carregando: !dados && !erro, recarregar };
}
