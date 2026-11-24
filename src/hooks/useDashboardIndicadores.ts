import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { consultarIndicadores } from "../services/dashboardIndicadoresService";
import { mensagemErro } from "../services/apiError";

export function useDashboardIndicadores() {
  const { usuario } = useAuth();
  const [resultado, setResultado] = useState<{ chave: string; valores: (number | null)[]; erros: string[] } | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const chave = `${usuario?.id}-${usuario?.perfilId}-${usuario?.perfil}-${JSON.stringify(usuario?.permissoes)}`;
  useEffect(() => {
    if (!usuario) return;
    const controller = new AbortController();
    void consultarIndicadores(usuario, controller.signal).then(respostas => {
      if (controller.signal.aborted) return;
      setResultado({ chave, valores: respostas.map(r => r.status === "fulfilled" ? r.value : null), erros: respostas.map(r => r.status === "rejected" ? mensagemErro(r.reason) : "") });
    });
    return () => controller.abort();
  }, [usuario, chave, tentativa]);
  const atual = resultado?.chave === chave ? resultado : null;
  return { valores: atual?.valores ?? [null, null, null, null], erros: atual?.erros ?? [], carregando: !atual, recarregar: () => { setResultado(null); setTentativa(t => t + 1); } };
}
