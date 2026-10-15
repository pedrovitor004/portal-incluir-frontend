import type { PerfilUsuario } from "../../../types/auth";
import { getMenuItems } from "./menu";
import SidebarMenuItem from "./SidebarMenuItem";
import SidebarFooter from "./SidebarFooter";

export type SidebarProps = {
  perfil: PerfilUsuario;
  currentPath: string;
  onNavigate: () => void;
  onLogout: () => void;
};

export default function AppSidebar({ perfil, currentPath, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-hidden bg-[#389e49] text-white">
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-2 pt-6" aria-label="Menu principal">
        {getMenuItems(perfil).map(item => (
          <SidebarMenuItem key={item.path} item={item} currentPath={currentPath} onNavigate={onNavigate} />
        ))}
      </nav>
      <SidebarFooter onLogout={onLogout} />
    </aside>
  );
}
