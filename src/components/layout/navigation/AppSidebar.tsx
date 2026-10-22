import { useAuth } from "../../../hooks/useAuth";
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
  const { usuario } = useAuth();
  const items = getMenuItems(usuario ?? perfil);
  const sections = [
    { label: undefined, items: items.filter(item => !item.section) },
    { label: "Professores", items: items.filter(item => item.section === "Professores") },
    { label: "Equipe multidisciplinar", items: items.filter(item => item.section === "Equipe multidisciplinar") },
  ].filter(section => section.items.length > 0);
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-hidden bg-[#389e49] text-white">
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-2 pt-8 [scrollbar-width:thin]" aria-label="Menu principal">
        {sections.map(section => section.label ? <details key={section.label} open={section.items.some(item => currentPath === item.path || item.children?.some(child => currentPath === child.path))} className="group border-t border-white/20 pt-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 text-[11px] font-semibold uppercase tracking-wide text-white/90 focus-visible:outline-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden"><span>{section.label}</span><span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span></summary>
          <div className="space-y-1 pb-2">{section.items.map(item => <SidebarMenuItem key={item.path} item={item} currentPath={currentPath} onNavigate={onNavigate} />)}</div>
        </details> : <section key="geral" aria-label="Acesso geral"><div className="space-y-1">{section.items.map(item => <SidebarMenuItem key={item.path} item={item} currentPath={currentPath} onNavigate={onNavigate} />)}</div></section>)}
      </nav>
      <SidebarFooter onLogout={onLogout} />
    </aside>
  );
}
