import type { Usuario } from "../../types/auth";
import ProfileMenu from "../profile/ProfileMenu";
import { MenuIcon } from "../icons/AppIcons";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoClai from "../../assets/logos/logo-clai.png";

type Props = {
  usuario: Usuario;
  mobileOpen: boolean;
  onToggleMobile: () => void;
};

export default function AppHeader({
  usuario,
  mobileOpen,
  onToggleMobile,
}: Props) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[#dce5dc] bg-white px-4 py-2 sm:px-5">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleMobile}
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

        <ProfileMenu usuario={usuario} />
      </div>
    </header>
  );
}
