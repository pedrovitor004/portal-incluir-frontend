import AppSidebar, { type SidebarProps } from "./AppSidebar";

type Props = SidebarProps & { collapsed: boolean; onToggle: () => void };

export default function DesktopNavigation({ collapsed, onToggle, ...sidebarProps }: Props) {
  return (
    <div className={`relative z-40 hidden shrink-0 transition-[width] duration-200 motion-reduce:transition-none lg:block ${collapsed ? "w-0" : "w-56"}`}>
      <div id="desktop-navigation" aria-hidden={collapsed} inert={collapsed} className="h-full overflow-hidden">
        <AppSidebar {...sidebarProps} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        aria-expanded={!collapsed}
        aria-controls="desktop-navigation"
        className="absolute left-full top-1/2 flex h-36 w-5 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-[#2e853d] bg-[#318b40] text-white shadow-sm transition-colors hover:bg-[#287535] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#226b32]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${collapsed ? "rotate-180" : ""}`}>
          <path d="m14 7-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
