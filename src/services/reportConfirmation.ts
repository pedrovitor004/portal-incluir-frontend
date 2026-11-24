import Swal from "sweetalert2";
import { getOverlayToolsHost } from "./overlayTools";
import { colorThemes } from "../config/uiThemes";

export async function confirmarRelatorio(acao: "atualizar" | "restaurar") {
  const restaurar = acao === "restaurar";
  const resultado = await Swal.fire({
    target: getOverlayToolsHost(),
    titleText: restaurar ? "Deseja restaurar as configurações?" : "Deseja atualizar os dados?",
    text: restaurar
      ? "O título, as informações incluídas e o filtro de documentos voltarão ao padrão do modelo atual. Os filtros de curso, ingresso e situação serão mantidos."
      : "Os dados serão consultados novamente. Os filtros e as configurações do relatório serão mantidos.",
    icon: "question", iconColor: colorThemes.green["--accent-main"],
    confirmButtonColor: colorThemes.green["--accent-main"], cancelButtonColor: "#64748b",
    showCancelButton: true, confirmButtonText: restaurar ? "Sim, restaurar" : "Sim, atualizar",
    cancelButtonText: "Não, cancelar", focusCancel: true, allowOutsideClick: false, heightAuto: false,
  });
  return resultado.isConfirmed;
}
