import { useAuth } from "../../hooks/useAuth";
import LoadingState from "../../components/common/LoadingState";
import { useDashboardCoordenador } from "../../hooks/useDashboardCoordenador";
import InstitutionalResources from "../../components/common/InstitutionalResources";
import DashboardSummary from "./components/DashboardSummary";
import RecentStudents from "./components/RecentStudents";
import RecentNotifications from "./components/RecentNotifications";

export default function DashboardCoordenador() {
  const { usuario } = useAuth();
  const { dados, erro, carregando, recarregar } = useDashboardCoordenador();

  if (carregando) return <LoadingState label="Carregando painel da coordenação..." />;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1440px] flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">
          Início do coordenador
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Visão rápida dos estudantes, pendências e atividades recentes.
        </p>
      </header>
      <section className="rounded-2xl border border-[#dce5dc] bg-white p-5 sm:p-6" aria-label="Boas-vindas">
        <h2 className="text-lg font-semibold text-primary">Olá, {usuario?.nome}!</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Este é o seu espaço no Portal Incluir. Use o menu lateral para se orientar pelas áreas do seu perfil.</p>
      </section>
      <DashboardSummary dados={dados} erro={erro} carregando={carregando} onRetry={recarregar} />
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <RecentStudents students={dados?.estudantesRecentes ?? []} loaded={Boolean(dados)} />
        <RecentNotifications />
      </div>
      <InstitutionalResources />
    </div>
  );
}
