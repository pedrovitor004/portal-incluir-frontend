import type { ReactNode } from "react";
import { Link } from "react-router";
import { routes } from "../../config/routes";
import logoPortal from "../../assets/logos/logo-portal.png";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoClai from "../../assets/logos/logo-clai.png";

export default function RecuperacaoSenhaLayout({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return <main className="flex min-h-dvh flex-col bg-[#f3f5ef] text-slate-700">
    <meta name="referrer" content="no-referrer" />
    <header className="border-b border-slate-200 bg-white px-5 py-4"><div className="mx-auto flex max-w-6xl items-center gap-5"><img src={logoIfpb} alt="Instituto Federal da Paraíba" className="h-14 w-auto" /><img src={logoClai} alt="Coordenação Local de Acessibilidade e Inclusão" className="h-14 w-auto" /><p className="hidden text-sm font-semibold text-primary sm:block">IFPB Campus Monteiro<br />Portal Incluir</p></div></header>
    <div className="flex flex-1 items-center justify-center px-4 py-10"><div className="w-full max-w-[460px]">
      <div className="mb-6 rounded-2xl bg-primary p-5"><img src={logoPortal} alt="Portal Incluir" className="mx-auto h-auto w-56 max-w-full" /></div>
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-[0_12px_40px_rgba(50,93,58,0.08)] sm:p-8"><h1 data-page-title className="text-2xl font-bold tracking-tight text-primary">{titulo}</h1><p className="mt-2 text-sm leading-relaxed text-slate-500">{descricao}</p><div className="mt-6">{children}</div></section>
      <Link to={routes.login} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">Voltar ao login</Link>
    </div></div>
  </main>;
}
