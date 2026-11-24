import axios from "axios";

export function mensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    return error.response
      ? "Não foi possível concluir a solicitação. Verifique os dados."
      : "Não foi possível conectar ao servidor. Tente novamente.";
  }
  return "Não foi possível concluir a solicitação.";
}
