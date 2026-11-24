import Swal, { type SweetAlertOptions } from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { getOverlayToolsHost } from "./overlayTools";
export function alertaPadrao(opcoes: SweetAlertOptions) {
  return Swal.fire({ target: getOverlayToolsHost(), heightAuto: false, allowOutsideClick: false, focusCancel: true, confirmButtonColor: "#287535", cancelButtonColor: "#64748b", confirmButtonText: "Entendi", cancelButtonText: "Cancelar", ...opcoes });
}
