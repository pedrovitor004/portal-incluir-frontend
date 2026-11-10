import { http } from "./http";
import type { FiltrosOcorrencia, Ocorrencia, OcorrenciaRequest } from "../types/ocorrencia";

export const ocorrenciasService = {
  async listar(filtros: FiltrosOcorrencia = {}, signal?: AbortSignal, relatorio = false): Promise<Ocorrencia[]> {
    const { data } = await http.get<Ocorrencia[]>(relatorio ? "/ocorrencias/relatorio" : "/ocorrencias", { params: { ...filtros, _consulta: Date.now() }, signal });
    if (!Array.isArray(data)) throw new Error("Não foi possível consultar as ocorrências.");
    return data;
  },
  async consultar(id: number, signal?: AbortSignal) { return (await http.get<Ocorrencia>(`/ocorrencias/${id}`, { signal })).data; },
  async registrar(dados: OcorrenciaRequest, arquivo?: File | null): Promise<Ocorrencia> {
    const form = new FormData();
    form.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
    if (arquivo) form.append("arquivo", arquivo);
    return (await http.post<Ocorrencia>("/ocorrencias", form)).data;
  },
  async baixar(ocorrencia: Ocorrencia) {
    const { data } = await http.get<Blob>(`/ocorrencias/${ocorrencia.id}/arquivo`, { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a"); link.href = url; link.download = ocorrencia.arquivoNome || "anexo";
    document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

export function filtrarOcorrencias(lista: Ocorrencia[], busca: string, autor: string) {
  const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  return lista.filter(o => normalizar(`${o.estudanteNome} ${o.estudanteMatricula} ${o.descricao}`).includes(normalizar(busca.trim())) && normalizar(o.autorNome).includes(normalizar(autor.trim())));
}
