import { Link } from "react-router";
import { canAccess } from "../../config/access";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import InstitutionalResources from "../../components/common/InstitutionalResources";
import RecentNotifications from "../../components/common/RecentNotifications";
import DashboardSummary from "./components/DashboardSummary";

export default function DashboardEquipeMultidisciplinar() {
  const { usuario } = useAuth();
  useEffect(() => { document.title = "Início da equipe multidisciplinar | Portal Incluir"; }, []);
  return <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1440px] flex-col gap-6">
    <header><h1 data-page-title className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">Início da equipe multidisciplinar</h1>
      <p className="mt-1 text-sm text-slate-500">Organize o acompanhamento dos estudantes e as atividades da equipe.</p></header>
    <section className="rounded-2xl border border-[#dce5dc] bg-white p-5 sm:p-6" aria-label="Boas-vindas">
      <h2 className="text-lg font-semibold text-primary">Olá, {usuario?.nome}!</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">Este é o seu espaço no Portal Incluir. Use o menu lateral para se orientar pelas áreas do seu perfil.</p>
    </section>
    {usuario && canAccess(usuario, "suporte.registrar") && <div><Link to="/equipe/ocorrencias/nova" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 5H5v16h14V5h-4M9 3h6v4H9zM8 12h8M8 16h5" /></svg>Registrar ocorrência</Link></div>}
    <DashboardSummary />
    <RecentNotifications />
    <InstitutionalResources />
  </div>;
}
