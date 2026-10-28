import DataConsultationIndicator from "../components/common/DataConsultationIndicator";
import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { routes } from "../config/routes";
import { useAuth } from "../hooks/useAuth";
import AppHeader from "../components/layout/AppHeader";
import DesktopNavigation from "../components/layout/navigation/DesktopNavigation";
import MobileNavigation from "../components/layout/navigation/MobileNavigation";

type LayoutProps = { children: ReactNode };

export default function AppLayout({ children }: LayoutProps) {
  const { usuario, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  async function handleLogout() {
    if (!await logout()) return;
    closeMobileMenu();
    navigate(routes.home);
  }

  if (!usuario) return null;


  const sidebarProps = {
    perfil: usuario.perfil,
    currentPath: location.pathname,
    onNavigate: closeMobileMenu,
    onLogout: handleLogout,
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f3f6f1]">
      <AppHeader usuario={usuario} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen(previous => !previous)} />
      <div className="flex min-h-0 flex-1">
        <DesktopNavigation {...sidebarProps} collapsed={collapsed} onToggle={() => setCollapsed(previous => !previous)} />
        {mobileOpen && <MobileNavigation {...sidebarProps} onClose={closeMobileMenu} />}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-8"><DataConsultationIndicator />{children}</main>
      </div>
    </div>
  );
}
