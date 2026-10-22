import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { colorThemes } from "../config/uiThemes";
import { acoesEstudante, type AcaoEstudante } from "../config/estudantes";
import { getOverlayToolsHost } from "./overlayTools";
import type { Estudante } from "../types/estudante";

const padrao = { showCancelButton: true, cancelButtonText: "Cancelar", cancelButtonColor: "#64748b", focusCancel: true, allowOutsideClick: false, heightAuto: false } as const;
function hoje() { const data = new Date(); return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`; }
export async function confirmarAcaoEstudante(estudante: Estudante, acao: AcaoEstudante): Promise<{ confirmado: boolean; dataConclusao?: string }> {
  const config = acoesEstudante[acao];
  const resultado = await Swal.fire({
    ...padrao, target: getOverlayToolsHost(), titleText: `${config.titulo}?`,
    text: `${estudante.nome} · Matrícula ${estudante.matricula}. ${config.descricao}`,
    icon: "warning", iconColor: colorThemes[config.cor]["--accent-main"], confirmButtonColor: colorThemes[config.cor]["--accent-main"],
    confirmButtonText: acao === "concluir" ? "Sim, concluir acompanhamento" : `Sim, ${acao}`,
    ...(acao === "concluir" ? { input: "date" as const, inputLabel: "Data de conclusão", inputValue: hoje(), inputAttributes: { max: hoje(), required: "true" }, inputValidator: (value: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value > hoje()) return "Informe uma data válida, até hoje.";
      const limite = new Date(`${value}T12:00:00`); limite.setFullYear(limite.getFullYear() + 5);
      if (limite <= new Date(`${hoje()}T12:00:00`)) return "O prazo de guarda dos dados para essa data já terminou. Confira a data de conclusão.";
      return undefined;
    } } : {}),
  });
  return { confirmado: resultado.isConfirmed, dataConclusao: acao === "concluir" && resultado.isConfirmed ? String(resultado.value) : undefined };
}
export async function confirmarCadastroEstudante(etapa: "abrir" | "salvar" | "editar", nome?: string) {
  const resultado = await Swal.fire({ ...padrao, target: getOverlayToolsHost(), titleText: etapa === "abrir" ? "Cadastrar um novo estudante?" : etapa === "editar" ? "Salvar alterações do estudante?" : "Confirmar cadastro do estudante?", text: etapa === "abrir" ? "Você abrirá o formulário de identificação inicial e anamnese. Confira os dados antes de salvar. Plano de Ação, PEI e RAI devem ser acompanhados nas etapas seguintes." : `${nome || "Estudante"}. ${etapa === "editar" ? "Os dados informados substituirão os valores atuais no cadastro." : "Os dados informados serão gravados e o estudante ficará disponível para acompanhamento."}`, icon: "question", iconColor: colorThemes.green["--accent-main"], confirmButtonColor: colorThemes.green["--accent-main"], confirmButtonText: etapa === "abrir" ? "Sim, iniciar cadastro" : "Sim, salvar" });
  return resultado.isConfirmed;
}
export async function informarPoliticaExclusao() {
  await Swal.fire({ target: getOverlayToolsHost(), titleText: "Por que não posso excluir um estudante?", text: "Os cadastros de estudantes precisam ser preservados durante o prazo de guarda dos dados. Para suspender um cadastro, escolha Inativar. Para encerrar o acompanhamento, escolha Concluir. A exclusão definitiva segue as regras de guarda da instituição.", icon: "info", confirmButtonText: "Entendi", confirmButtonColor: colorThemes.blue["--accent-main"], heightAuto: false });
}
