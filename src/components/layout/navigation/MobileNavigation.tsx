import AppSidebar, { type SidebarProps } from "./AppSidebar";
import { CloseIcon } from "../../icons/AppIcons";

type Props = SidebarProps & { onClose: () => void };

export default function MobileNavigation({ onClose, ...sidebarProps }: Props) {
  return (
    <div id="mobile-navigation" className="fixed inset-0 z-50 lg:hidden">
      <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative h-dvh w-56 max-w-[85vw] shadow-xl">
        <button type="button" onClick={onClose} aria-label="Fechar menu" className="absolute right-2 top-1 rounded-md p-1 text-white hover:bg-white/10">
          <CloseIcon />
        </button>
        <AppSidebar {...sidebarProps} />
      </div>
    </div>
  );
}
