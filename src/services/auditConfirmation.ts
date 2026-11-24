import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { colorThemes } from "../config/uiThemes";
import { getOverlayToolsHost } from "./overlayTools";

export async function confirmarAtualizacaoAuditorias() {
  const resultado = await Swal.fire({
    target: getOverlayToolsHost(), titleText: "Deseja atualizar as auditorias?",
    text: "O histórico e os indicadores serão consultados novamente. Os filtros e a ordenação da tabela serão mantidos.",
    icon: "question", iconColor: colorThemes.green["--accent-main"],
    confirmButtonColor: colorThemes.green["--accent-main"], cancelButtonColor: "#64748b",
    showCancelButton: true, confirmButtonText: "Sim, atualizar", cancelButtonText: "Não, cancelar",
    focusCancel: true, allowOutsideClick: false, heightAuto: false,
  });
  return resultado.isConfirmed;
}
