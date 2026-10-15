import AppSidebar, { type SidebarProps } from "./AppSidebar";
import { CloseIcon } from "../../icons/AppIcons";
import { useEffect, useRef } from "react";

type Props = SidebarProps & { onClose: () => void };

export default function MobileNavigation({ onClose, ...sidebarProps }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) onClose(); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, [onClose]);
  return (
    <dialog ref={dialogRef} id="mobile-navigation" aria-label="Menu principal" onCancel={onClose} className="mobile-menu-dialog">
      <button type="button" tabIndex={-1} aria-label="Fechar menu" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative h-dvh w-56 max-w-[85vw] shadow-xl">
        <button type="button" onClick={onClose} aria-label="Fechar menu" className="absolute right-2 top-1 rounded-md p-1 text-white hover:bg-white/10">
          <CloseIcon />
        </button>
        <AppSidebar {...sidebarProps} />
      </div>
    </dialog>
  );
}
