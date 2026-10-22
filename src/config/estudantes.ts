import type { Estudante } from "../types/estudante";
export type AcaoEstudante = "ativar" | "inativar" | "concluir";
export const acoesEstudante = {
  ativar: { titulo: "Ativar estudante", descricao: "O estudante voltará à situação ativa. Seus dados e documentos serão mantidos.", sucesso: "Estudante ativado com sucesso!", icone: "M12 8v8M8 12h8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", cor: "green" },
  inativar: { titulo: "Inativar estudante", descricao: "O estudante ficará inativo. O cadastro, os documentos e o histórico serão preservados. Será possível ativá-lo novamente enquanto não estiver concluído.", sucesso: "Estudante inativado com sucesso!", icone: "M9 8v8M15 8v8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", cor: "amber" },
  concluir: { titulo: "Concluir acompanhamento", descricao: "O estudante ficará inativo e seu histórico ficará disponível apenas para consulta. Os dados serão guardados por cinco anos a partir da data de conclusão informada. Não será possível desfazer a conclusão pelo sistema.", sucesso: "Conclusão registrada com sucesso!", icone: "m7 12 3 3 7-7M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", cor: "blue" },
} as const;
export function acaoEstudantePermitida(estudante: Pick<Estudante, "status">, acao: AcaoEstudante) {
  if (estudante.status === "Concluído") return false;
  return acao === "ativar" ? estudante.status === "Inativo" : acao === "inativar" ? estudante.status === "Ativo" : true;
}
