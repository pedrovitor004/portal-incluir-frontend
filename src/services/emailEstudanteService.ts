import { http } from "./http";

export type EmailEstudanteRequest = {
  assunto: string;
  mensagem: string;
};

export function emailValido(email: string | null | undefined): boolean {
  return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function templateEmailAcompanhamento(nome: string): { assunto: string; mensagem: string } {
  return {
    assunto: "Convite para conversar sobre seu acompanhamento - Portal Incluir",
    mensagem: `Olá, ${nome}.\n\nEsperamos que esteja bem.\n\nA equipe do Portal Incluir gostaria de conversar com você sobre seu acompanhamento. Se tiver disponibilidade, responda a este e-mail para combinarmos um horário e o melhor canal para a conversa.\n\nPor segurança, evite enviar informações pessoais ou sensíveis por e-mail. Se preferir, podemos tratar do assunto em um atendimento.\n\nAtenciosamente,\nEquipe Portal Incluir`,
  };
}

export const emailEstudanteService = {
  async enviar(estudanteId: number, request: EmailEstudanteRequest): Promise<void> {
    await http.post(`/estudantes/${estudanteId}/email`, request);
  },
};
