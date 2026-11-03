import { useEffect, useState } from "react";
import type { ConsultaDocumentos, Documento } from "../types/documento";
import { documentosService } from "../services/documentosService";
import { useAuth } from "./useAuth";

export function useDocumentos() {
  const { usuario } = useAuth();
  const professorId = usuario?.perfil === "PROFESSOR" ? usuario.perfilId : undefined;
  const [consulta, setConsulta] = useState<ConsultaDocumentos | null>(null);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    documentosService.listar(controller.signal, professorId).then(result => {
      if (!controller.signal.aborted) setConsulta(result);
    });
    return () => controller.abort();
  }, [tentativa, professorId]);
  function recarregar() { setConsulta(null); setTentativa(t => t + 1); }
  function remover(chave: string) {
    setConsulta(atual => atual ? { ...atual, documentos: atual.documentos.filter(d => d.chave !== chave) } : atual);
  }
  function atualizar(documento: Documento) {
    setConsulta(atual => atual ? { ...atual, documentos: atual.documentos.map(d => d.chave === documento.chave ? documento : d) } : atual);
  }
  return { atualizar, consulta, carregando: consulta === null, recarregar, remover };
}
