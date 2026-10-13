import { notificationService } from "../services/notificationService";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { dashboardService } from "../services/dashboardService";
import { mensagemErro } from "../services/apiError";
import type { DashboardCoordenadorData } from "../types/dashboard";

export function useDashboardCoordenador() {
  const { usuario } = useAuth();
  const perfilId = usuario?.perfilId;
  const [dados, setDados] = useState<DashboardCoordenadorData | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!perfilId) return;
    const controller = new AbortController();
    dashboardService.buscarCoordenador(perfilId, controller.signal)
      .then(setDados)
      .catch(error => {
        if (controller.signal.aborted) return;
        const mensagem = mensagemErro(error);
        setErro(mensagem);
        notificationService.error(mensagem);
      });
    return () => controller.abort();
  }, [perfilId, tentativa]);

  function recarregar() { setErro(""); setTentativa(t => t + 1); }
  return { dados, erro, carregando: !dados && !erro, recarregar };
}
