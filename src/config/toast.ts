import type { SweetAlertOptions } from "sweetalert2";

export const toastConfig: SweetAlertOptions = {
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: true,
  closeButtonAriaLabel: "Fechar notificação",
  timer: 4500,
  timerProgressBar: true,
  heightAuto: false,
  customClass: { popup: "portal-toast", title: "portal-toast-title" },
};
