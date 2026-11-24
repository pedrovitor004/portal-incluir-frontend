import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { getOverlayToolsHost } from "./overlayTools";
export async function confirmarUsuario(titulo: string, descricao: string, perigo = false) {
  const resultado = await Swal.fire({ target: getOverlayToolsHost(), titleText: titulo, text: descricao, icon: perigo ? "warning" : "question", showCancelButton: true, confirmButtonText: "Sim, confirmar", cancelButtonText: "Cancelar", confirmButtonColor: perigo ? "#b91c1c" : "#287535", cancelButtonColor: "#64748b", focusCancel: true, heightAuto: false, allowOutsideClick: false });
  return resultado.isConfirmed;
}
