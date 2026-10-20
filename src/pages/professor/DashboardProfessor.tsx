import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import InstitutionalResources from "../../components/common/InstitutionalResources";
import RecentNotifications from "../../components/common/RecentNotifications";
import DashboardSummary from "./components/DashboardSummary";

export default function DashboardProfessor() {
  const { usuario } = useAuth();
  useEffect(() => { document.title = "Início do professor | Portal Incluir"; }, []);
  return <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1440px] flex-col gap-6">
    <header><h1 data-page-title className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">Início do professor</h1>
      <p className="mt-1 text-sm text-slate-500">Organize o acompanhamento pedagógico e as adaptações dos seus estudantes.</p></header>
    <section className="rounded-2xl border border-[#dce5dc] bg-white p-5 sm:p-6" aria-label="Boas-vindas">
      <h2 className="text-lg font-semibold text-primary">Olá, {usuario?.nome}!</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">Este é o seu espaço no Portal Incluir. Use o menu lateral para se orientar pelas áreas do seu perfil.</p>
    </section>
    <DashboardSummary />
    <RecentNotifications />
    <InstitutionalResources />
  </div>;
}
