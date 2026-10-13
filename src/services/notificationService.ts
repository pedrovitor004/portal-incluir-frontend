import Swal, { type SweetAlertIcon } from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../styles/toast.css";
import { toastConfig } from "../config/toast";

const toast = Swal.mixin({
  ...toastConfig,
  didOpen: popup => {
    popup.addEventListener("mouseenter", Swal.stopTimer);
    popup.addEventListener("mouseleave", Swal.resumeTimer);
    popup.addEventListener("focusin", Swal.stopTimer);
    popup.addEventListener("focusout", Swal.resumeTimer);
  },
});

function show(icon: SweetAlertIcon, message: string) {
  // titleText mantém mensagens vindas da API como texto, sem interpretar HTML.
  void toast.fire({ icon, titleText: message, timer: icon === "error" ? 8000 : toastConfig.timer });
}

export const notificationService = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
  warning: (message: string) => show("warning", message),
  info: (message: string) => show("info", message),
};
