import logoPortal from "../../../assets/logos/logo-portal.png";
import { LogoutIcon } from "../../icons/AppIcons";

export default function SidebarFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="shrink-0 border-t border-white/15 px-3 pb-3 pt-1">
      <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">
        <LogoutIcon className="h-5 w-5" />
        <span>Sair</span>
      </button>
      <div className="mt-3 flex items-center justify-start px-3 pb-2">
        <div className="relative aspect-[685/292] w-[190px] max-w-full overflow-hidden">
          <img src={logoPortal} alt="Portal Incluir" className="absolute h-auto max-w-none" style={{ width: "109.927%", left: "-4.672%", top: "-7.192%" }} />
        </div>
      </div>
    </div>
  );
}
