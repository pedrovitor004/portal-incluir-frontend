import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef, useState, type ReactNode, type ComponentType } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import logoClai from "../assets/logos/logo-clai.png";
import logoIfpb from "../assets/logos/logo-ifpb.png";
import logoPortal from "../assets/logos/logo-portal.png";

type IconProps = {
  className?: string;
};

type MenuItem = {
  label: string;
  path: string;
  icon: ComponentType<IconProps>;
};

type SidebarProps = {
  currentPath: string;
  onNavigate: () => void;
  onLogout: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
};

type LayoutProps = {
  children: ReactNode;
};

function HomeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6"
      />
    </svg>
  );
}

function StudentsIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />
      <circle cx="9" cy="7" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

function ClipboardIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3"
      />
    </svg>
  );
}

function DocumentIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 3v5h5M9 13h6M9 17h6"
      />
    </svg>
  );
}

function ChartIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V5M4 19h17M8 15v-4M13 15V7M18 15V3"
      />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"
      />
    </svg>
  );
}

function LogoutIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
      />
    </svg>
  );
}

function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  );
}

const menuItems: MenuItem[] = [
  {
    label: "Início",
    path: "/coordenador/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Estudantes",
    path: "/coordenador/estudantes",
    icon: StudentsIcon,
  },
  {
    label: "Anamnese",
    path: "/coordenador/anamnese",
    icon: ClipboardIcon,
  },
  {
    label: "PEI e Plano",
    path: "/coordenador/pei",
    icon: DocumentIcon,
  },
  {
    label: "Documentos",
    path: "/coordenador/documentos",
    icon: DocumentIcon,
  },
  {
    label: "Relatórios",
    path: "/coordenador/relatorios",
    icon: ChartIcon,
  },
  {
    label: "Usuários",
    path: "/coordenador/usuarios",
    icon: UsersIcon,
  },
];

function Sidebar({
  currentPath,
  onNavigate,
  onLogout,
  collapsed = false,
  onToggle,
}: SidebarProps) {
  function isActive(path: string): boolean {
    return path === "/coordenador/dashboard"
      ? currentPath === path
      : currentPath === path || currentPath.startsWith(`${path}/`);
  }

  return (
    <aside className={`flex h-full shrink-0 flex-col overflow-hidden bg-primary text-white transition-[width] duration-200 motion-reduce:transition-none ${collapsed ? "w-18" : "w-56"}`}>
      {/* Menu: somente esta área rola quando necessário */}
      {onToggle && (
        <div className={`flex min-h-14 items-center px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <span className="text-xs font-semibold text-white/80">Menu principal</span>}
          <button type="button" onClick={onToggle} aria-label={collapsed ? "Expandir menu" : "Recolher menu"} title={collapsed ? "Expandir menu" : "Recolher menu"} aria-expanded={!collapsed} aria-controls="desktop-navigation" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${collapsed ? "rotate-180" : ""}`}>
              <path d="m14 7-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
      <nav
        className={`min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-6 ${onToggle ? "pt-1" : "pt-6"}`}
        aria-label="Menu principal"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${collapsed ? "justify-center" : ""} ${
                active
                  ? "bg-white/95 text-[#226b32] shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center"><Icon className="h-4 w-4" /></span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sair e logo permanecem na parte inferior */}
      <div className="shrink-0 border-t border-white/20 px-4 pt-3 pb-3">
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sair"
          title={collapsed ? "Sair" : undefined}
          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${collapsed ? "justify-center" : ""}`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center"><LogoutIcon className="h-4 w-4" /></span>
          {!collapsed && <span>Sair</span>}
        </button>

        <div className={`${collapsed ? "hidden" : "flex"} mt-2 items-center justify-center pt-4 pb-3`}>
          <img
            src={logoPortal}
            alt="Portal Incluir"
            className="h-auto max-h-20 w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </aside>
  );
}

export default function CoordenadorLayout({ children }: LayoutProps) {
  const { usuario, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen) mobileDialog.current?.showModal();
    else mobileDialog.current?.close();
  }, [mobileOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setMobileOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function handleLogout() {
    logout();
    closeMobileMenu();
    navigate("/");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f3f6f1]">
        <header className="sticky top-0 z-30 shrink-0 border-b border-[#dce5dc] bg-white px-4 py-2 sm:px-5">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <button
                ref={menuTrigger}
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <MenuIcon />
              </button>

              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={logoIfpb}
                  alt="IFPB"
                  className="h-14 w-12 shrink-0 object-contain"
                />

                <img
                  src={logoClai}
                  alt="CLAI"
                  className="h-14 w-14 shrink-0 object-contain"
                />

                <div className="hidden min-w-0 sm:block">
                  <p className="text-sm font-bold text-primary">
                    IFPB Campus Monteiro
                  </p>
                  <p className="text-[10px] text-primary">
                    Coordenação Local de Acessibilidade e Inclusão
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-[10px] text-slate-500">Coordenador</p>
                <p className="text-xs font-semibold text-slate-800">
                  {usuario?.nome}
                </p>
              </div>

              <div
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f4e8] text-base font-bold text-primary"
                aria-label={usuario?.nome}
              >
                {usuario?.nome.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("")}
              </div>
            </div>
          </div>
        </header>
      <div className="flex min-h-0 flex-1">
        <div id="desktop-navigation" className="hidden shrink-0 lg:block">
          <Sidebar currentPath={location.pathname} onNavigate={closeMobileMenu} onLogout={handleLogout} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>
          <dialog ref={mobileDialog} id="mobile-navigation" aria-label="Menu principal" onCancel={closeMobileMenu} onClose={() => { closeMobileMenu(); menuTrigger.current?.focus(); }} className="mobile-menu-dialog">
            <button type="button" aria-label="Fechar menu" tabIndex={-1} className="absolute inset-0 bg-black/50" onClick={closeMobileMenu} />
            <div className="relative h-dvh w-56 max-w-[85vw] shadow-xl">
              <button type="button" onClick={closeMobileMenu} aria-label="Fechar menu" className="absolute right-2 top-1 rounded-md p-1 text-white hover:bg-white/10">
                <CloseIcon />
              </button>
              <Sidebar currentPath={location.pathname} onNavigate={closeMobileMenu} onLogout={handleLogout} />
            </div>
          </dialog>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
