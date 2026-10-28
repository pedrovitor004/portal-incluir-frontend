import axios from "axios";
import { mensagemErro } from "./apiError";
export function mensagemErroFluxo(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 404) return "O serviço de acompanhamento ainda não está disponível nesta versão do servidor. Reinicie o backend atualizado e tente novamente.";
  return mensagemErro(error);
}
