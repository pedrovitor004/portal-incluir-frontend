import { useDashboardCoordenador } from "../../hooks/useDashboardCoordenador";
import { Link } from "react-router";

type StatCard = {
  title: string;
  value: string;
  borderColor: string;
  accent: string;
  iconPath: string;
};

type Student = {
  id: number;
  name: string;
  course: string;
  badge1: string;
  badge2: string;
  highlighted: boolean;
};

type Notification = {
  id: number;
  title: string;
  time: string;
  color: string;
};

function GraduationCapIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
    </svg>
  );
}

const statCards: StatCard[] = [
  {
    title: "Estudantes acompanhados",
    value: "128",
    borderColor: "border-l-primary",
    accent: "bg-emerald-50 text-primary",
    iconPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  },
  {
    title: "Anamneses pendentes",
    value: "12",
    borderColor: "border-l-amber-500",
    accent: "bg-amber-50 text-amber-600",
    iconPath: "M9 4H5v17h14V4h-4M9 3h6v4H9ZM9 12h6M9 16h4",
  },
  {
    title: "PEIs em revisão",
    value: "8",
    borderColor: "border-l-sky-500",
    accent: "bg-sky-50 text-sky-600",
    iconPath: "M14 3H5v18h14V8ZM14 3v5h5M9 13h6M9 17h4",
  },
  {
    title: "Novos registros",
    value: "5",
    borderColor: "border-l-red-500",
    accent: "bg-red-50 text-red-500",
    iconPath: "M12 8v8M8 12h8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
];

const institutionalResources = [
  "Manual do usuário",
  "Legislação",
  "LGPD",
  "Acessibilidade",
];

export default function DashboardCoordenador() {
  const { dados, erro, carregando, recarregar } = useDashboardCoordenador();
  const valores = dados ? [dados.estudantesAtivos, dados.professoresAtivos, dados.planosAtivos, dados.planosArquivados] : [];
  const titulos = ["Estudantes ativos na instituição", "Professores ativos", "Meus PEIs ativos", "Meus PEIs arquivados"];
  const cards = statCards.map((card, i) => ({ ...card, title: titulos[i], value: dados ? String(valores[i]) : "—" }));
  const recentStudents: Student[] = dados?.estudantesRecentes.map(e => ({ id: e.id, name: e.nome, course: e.curso, badge1: e.matricula, badge2: e.ativo ? "Ativo" : "Inativo", highlighted: false })) || [];
  const notifications: Notification[] = [];
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1440px] flex-col gap-6">
      {/* Título */}
      <header>
        <h1 className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">
          Início do coordenador
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Visão rápida dos estudantes, pendências e atividades recentes.
        </p>
      </header>

      {erro && <div role="alert" className="text-sm text-red-700">{erro} <button className="underline" onClick={recarregar}>Tentar novamente</button></div>}
      {carregando && <p role="status">Carregando dashboard...</p>}
      {/* Indicadores */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores do sistema"
      >
        {cards.map((card) => (
          <article
            key={card.title}
            className={`relative min-w-0 overflow-hidden rounded-2xl border border-[#dce5dc] border-l-4 bg-white p-5 shadow-[0_4px_20px_rgba(24,91,50,0.05)] sm:p-6 ${card.borderColor}`}
          >
            <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={card.iconPath} />
              </svg>
            </div>
            <div aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 ${card.accent}`} />
            <h2 className="text-xs font-semibold leading-snug text-slate-600 sm:text-sm">
              {card.title}
            </h2>

            <p className="mt-3 text-3xl font-semibold leading-none tracking-tight text-[#26332b] tabular-nums sm:text-4xl">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      {/* Estudantes e notificações */}
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        {/* Estudantes recentes */}
        <section className="min-w-0 rounded-md border border-[#dce5dc] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-1 pb-4">
            <h2 className="text-base font-bold text-[#26332b]">
              Últimos estudantes cadastrados na instituição
            </h2>

            <Link
              to="/coordenador/estudantes"
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[#dce5dc] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-[#edf7ee] focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Ver todos
              <GraduationCapIcon />
            </Link>
          </div>

          <div className="mt-3 space-y-1">
            {dados && recentStudents.length === 0 && <p className="p-3 text-sm text-slate-500">Nenhum estudante cadastrado.</p>}
            {recentStudents.map((student) => (
              <article
                key={student.id}
                className={`grid grid-cols-1 items-center gap-2 rounded-md px-3 py-3 sm:grid-cols-[minmax(100px,1fr)_minmax(90px,1fr)] xl:grid-cols-[minmax(100px,1fr)_minmax(90px,1fr)_minmax(135px,1fr)] sm:gap-3 sm:px-4 ${
                  student.highlighted ? "bg-[#b8ffbf]" : "bg-white"
                }`}
              >
                <h3 className="truncate text-xs font-semibold text-[#26332b]">
                  {student.name}
                </h3>

                <p className="truncate text-xs text-slate-500">
                  {student.course}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="max-w-full truncate rounded-full bg-[#e6f5e8] px-2.5 py-1 text-[10px] font-semibold text-primary">
                    {student.badge1}
                  </span>

                  <span className="max-w-full truncate rounded-full bg-[#fff5d6] px-2.5 py-1 text-[10px] font-semibold text-[#805b00]">
                    {student.badge2}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Notificações recentes */}
        <section className="min-w-0 rounded-md border border-[#dce5dc] bg-white p-4 sm:p-5">
          <h2 className="border-b border-slate-100 px-1 pb-4 text-base font-bold text-[#26332b]">
            Notificações recentes
          </h2>

          <div className="space-y-6 px-1 py-5">
            <p className="text-sm text-slate-500">As notificações ainda não estão disponíveis.</p>
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className="flex min-w-0 items-start gap-3"
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.color}`}
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <h3 className="break-words text-xs font-semibold leading-snug text-[#26332b]">
                    {notification.title}
                  </h3>

                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {notification.time}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Recursos institucionais: ficam no final quando há espaço */}
      <section className="mt-4 rounded-md border border-[#dce5dc] bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <h2 className="shrink-0 text-sm font-bold text-primary">
            Recursos institucionais
          </h2>

          <div className="flex flex-1 flex-wrap items-center gap-2">
            {institutionalResources.map((resource) => (
              <span
                key={resource}
                className="rounded-md bg-[#e8f5e9] px-3.5 py-2 text-[11px] font-semibold text-primary"
              >
                {resource}
              </span>
            ))}
          </div>

          <p className="max-w-[200px] text-[11px] leading-snug text-slate-500">
            Modelos e orientações para o trabalho da equipe.
          </p>
        </div>
      </section>
    </div>
  );
}
