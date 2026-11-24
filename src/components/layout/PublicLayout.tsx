import type { ReactNode } from "react";
import { Link } from "react-router";
import { routes } from "../../config/routes";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoClai from "../../assets/logos/logo-clai.png";
import logoPortal from "../../assets/logos/logo-portal.png";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-[#f3f6f1] text-slate-700">
    <header className="border-b border-[#dce5dc] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to={routes.home} aria-label="Portal Incluir — página inicial" className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <img src={logoIfpb} alt="Instituto Federal da Paraíba" className="h-14 w-auto object-contain sm:h-16" />
          <img src={logoClai} alt="Coordenação Local de Acessibilidade e Inclusão (CLAI)" className="h-14 w-auto object-contain sm:h-16" />
          <span className="hidden border-l border-slate-200 pl-4 sm:block"><span className="block text-sm font-bold text-primary">IFPB Campus Monteiro</span><span className="mt-1 block text-xs text-slate-500">Acessibilidade e inclusão</span></span>
        </Link>
        <span className="hidden text-xs font-medium text-slate-500 md:block">Inclusão e acompanhamento educacional</span>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-yellow-300 to-sky-400" />
    </header>
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-8 sm:py-16">
      <div className="grid w-full overflow-hidden rounded-3xl border border-[#dce5dc] bg-white shadow-[0_12px_40px_rgba(24,91,50,0.06)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex flex-col justify-center bg-primary px-7 py-9 text-white sm:p-10 lg:p-12">
          <div className="relative aspect-[685/292] w-[270px] max-w-full overflow-hidden"><img src={logoPortal} alt="Portal Incluir — Inclusão e acompanhamento educacional" className="absolute h-auto max-w-none" style={{ width: "109.927%", left: "-4.672%", top: "-7.192%" }} /></div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/90">Conectando pessoas e promovendo a inclusão em cada etapa da jornada acadêmica.</p>
          <span className="mt-8 text-xs font-semibold text-white/80">CLAI · IFPB Campus Monteiro</span>
        </aside>
        <section className="flex flex-col justify-center px-7 py-9 sm:p-10 lg:p-12">{children}</section>
      </div>
    </main>
    <footer className="px-5 pb-6 text-center text-xs leading-relaxed text-slate-500">Portal Incluir · Instituto Federal da Paraíba · Campus Monteiro</footer>
  </div>;
}
