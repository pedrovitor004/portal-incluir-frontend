import { useCallback, useEffect, useState } from "react";
import { mensagemErroSolicitacaoPea } from "../services/solicitacaoPeaModel";
export function useConsultaPea<T>(consultar: (signal: AbortSignal) => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const recarregar = useCallback(() => { setCarregando(true); setErro(""); setTentativa(t => t+1); }, []);
  useEffect(() => {
    const controller = new AbortController();
    consultar(controller.signal).then(valor => { if (!controller.signal.aborted) { setDados(valor); setErro(""); } })
      .catch((e: unknown) => { if (!controller.signal.aborted) { setDados(null); setErro(mensagemErroSolicitacaoPea(e)); } })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [consultar, tentativa]);
  return { dados, erro, carregando, recarregar };
}
