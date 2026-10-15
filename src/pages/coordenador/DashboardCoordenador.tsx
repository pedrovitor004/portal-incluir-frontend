import { useDashboardCoordenador } from "../../hooks/useDashboardCoordenador";
import InstitutionalResources from "../../components/common/InstitutionalResources";
import DashboardSummary from "./components/DashboardSummary";
import RecentStudents from "./components/RecentStudents";
import RecentNotifications from "./components/RecentNotifications";

export default function DashboardCoordenador() {
  const { dados, erro, carregando, recarregar } = useDashboardCoordenador();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1440px] flex-col gap-6">
      <DashboardSummary dados={dados} erro={erro} carregando={carregando} onRetry={recarregar} />
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <RecentStudents students={dados?.estudantesRecentes ?? []} loaded={Boolean(dados)} />
        <RecentNotifications />
      </div>
      <InstitutionalResources />
    </div>
  );
}
