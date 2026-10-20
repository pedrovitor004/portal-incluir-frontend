import { notificationService } from "../services/notificationService";
import { useEffect, useState } from "react";
import type { BaseRelatorio } from "../types/relatorio";
import { relatoriosService } from "../services/relatorios/relatoriosService";
import { mensagemErro } from "../services/apiError";
export function useRelatorios() {
  const [base, setBase] = useState<BaseRelatorio | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    relatoriosService.consultar(controller.signal).then(dados => { if (!controller.signal.aborted) { setBase(dados); if (tentativa > 0) notificationService.success("Dados dos relatórios atualizados com sucesso."); } })
      .catch(error => { if (!controller.signal.aborted) { const mensagem = mensagemErro(error); setErro(mensagem); if (tentativa > 0) notificationService.error("Não foi possível atualizar os dados. " + mensagem); } });
    return () => controller.abort();
  }, [tentativa]);
  function recarregar() { setBase(null); setErro(""); setTentativa(t => t + 1); }
  return { base, setBase, erro, carregando: !base && !erro, recarregar };
}
