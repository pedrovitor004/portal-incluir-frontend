import { Link } from "react-router";
import { useState } from "react";
import logoAmarela from "../../assets/logos/amarela.png";
import logoAzul from "../../assets/logos/azul.png";
import logoClai from "../../assets/logos/logo-clai.png";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoPortal from "../../assets/logos/logo-portal.png";
import logoVerde from "../../assets/logos/verde.png";
import logoVermelha from "../../assets/logos/vermelha.png";

type BondType = "teacher" | "coordinator" | "multidisciplinary" | "admin";

type Field = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
};

const bondOptions = [
  {
    value: "teacher" as const,
    title: "Professor",
    description: "Cadastro para docentes do IFPB.",
  },
  {
    value: "coordinator" as const,
    title: "Coordenador",
    description: "Cadastro para coordenação institucional.",
  },
  {
    value: "multidisciplinary" as const,
    title: "Equipe multidisciplinar",
    description: "Cadastro para apoio pedagógico e assistência.",
  },
  {
    value: "admin" as const,
    title: "Administrador",
    description: "Acesso para administração do sistema.",
  },
];

const formFieldsByType: Record<BondType, Field[]> = {
  teacher: [
    { name: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome completo" },
    { name: "email", label: "E-mail", type: "email", placeholder: "nome@ifpb.edu.br" },
    { name: "telefone", label: "Telefone", type: "tel", placeholder: "(00) 00000-0000" },
    { name: "dataNascimento", label: "Data de nascimento", type: "date" },
    { name: "matricula", label: "Matrícula", type: "text", placeholder: "Número da matrícula" },
    { name: "disciplina", label: "Disciplina", type: "text", placeholder: "Disciplina lecionada" },
    { name: "setor", label: "Setor", type: "text", placeholder: "Setor de atuação" },
  ],
  coordinator: [
    { name: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome completo" },
    { name: "email", label: "E-mail", type: "email", placeholder: "nome@ifpb.edu.br" },
    { name: "telefone", label: "Telefone", type: "tel", placeholder: "(00) 00000-0000" },
    { name: "dataNascimento", label: "Data de nascimento", type: "date" },
    { name: "matricula", label: "Matrícula", type: "text", placeholder: "Número da matrícula" },
    { name: "cargo", label: "Cargo", type: "text", placeholder: "Cargo do coordenador" },
    { name: "setor", label: "Setor", type: "text", placeholder: "Setor de atuação" },
  ],
  multidisciplinary: [
    { name: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome completo" },
    { name: "email", label: "E-mail", type: "email", placeholder: "nome@ifpb.edu.br" },
    { name: "telefone", label: "Telefone", type: "tel", placeholder: "(00) 00000-0000" },
    { name: "dataNascimento", label: "Data de nascimento", type: "date" },
    { name: "matricula", label: "Matrícula", type: "text", placeholder: "Número da matrícula" },
    { name: "areaAtuacao", label: "Área de atuação", type: "text", placeholder: "Área de atuação" },
    { name: "cargo", label: "Cargo", type: "text", placeholder: "Cargo da função" },
    { name: "setor", label: "Setor", type: "text", placeholder: "Setor de atuação" },
  ],
  admin: [
    { name: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome completo" },
    { name: "email", label: "E-mail", type: "email", placeholder: "nome@ifpb.edu.br" },
    { name: "telefone", label: "Telefone", type: "tel", placeholder: "(00) 00000-0000" },
    { name: "dataNascimento", label: "Data de nascimento", type: "date" },
    { name: "matricula", label: "Matrícula", type: "text", placeholder: "Número da matrícula" },
    { name: "cargo", label: "Cargo", type: "text", placeholder: "Cargo do administrador" },
    { name: "setor", label: "Setor", type: "text", placeholder: "Setor de atuação" },
  ],
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h12" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-4xl font-semibold text-emerald-700">{title}</h2>
      <p className="mt-3 text-base text-slate-500">{description}</p>
    </div>
  );
}

function BondOption({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full min-h-20 flex-col items-start justify-between rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
        active
          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
          : "border-emerald-200 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50/40"
      }`}
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className="mt-2 text-xs leading-snug text-inherit/80">{description}</span>
    </button>
  );
}

function FormInput({ field }: { field: Field }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-emerald-700">{field.label}</span>
      <input
        type={field.type}
        name={field.name}
        placeholder={field.placeholder}
        className="mt-2 w-full rounded-lg border border-emerald-500 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

export default function RegisterPage() {
  const [bondType, setBondType] = useState<BondType>("teacher");

  return (
    <main className="flex min-h-screen flex-col bg-[#f3f5ef] text-slate-700">
      <header className="border-b border-slate-200 bg-white/95 shadow-[0_1px_0_rgba(255,255,255,0.8)] backdrop-blur">
        <div className="flex w-full items-center gap-5 px-4 py-3 sm:px-6 lg:px-8">
          <img
            src={logoIfpb}
            alt="Instituto Federal da Paraíba"
            className="h-12 w-auto object-contain"
          />
          <img
            src={logoClai}
            alt="Coordenação Local de Acessibilidade e Inclusão"
            className="h-12 w-auto object-contain"
          />

          <div className="hidden flex-col leading-tight text-emerald-700 md:flex">
            <span className="text-[1.05rem] font-semibold">IFPB Campus Monteiro</span>
            <span className="text-sm text-emerald-600">
              Coordenação Local de Acessibilidade e Inclusão
            </span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-sky-400" />
      </header>

      <section className="grid flex-1 w-full grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="flex items-center bg-[#47a84b] px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-10">
          <div className="max-w-xl">
            <div className="max-w-[18rem] sm:max-w-[21rem]">
              <img
                src={logoPortal}
                alt="Portal Incluir - Inclusão e acompanhamento educacional"
                className="h-auto w-full object-contain"
              />
            </div>

            <h1 className="mt-8 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">
              Crie sua conta no Portal Incluir
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-[1.05rem]">
              O formulário se ajusta conforme o vínculo selecionado para orientar o cadastro corretamente.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="text-sm font-medium tracking-wide text-white/90">
                CLAI • Instituto Federal da Paraíba
              </div>
              <div className="flex items-end gap-4">
                <img src={logoVermelha} alt="Logo vermelha" className="h-10 w-10 object-contain sm:h-14 sm:w-14" />
                <img src={logoAzul} alt="Logo azul" className="h-10 w-10 object-contain sm:h-14 sm:w-14" />
                <img src={logoVerde} alt="Logo verde" className="h-10 w-10 object-contain sm:h-14 sm:w-14" />
                <img src={logoAmarela} alt="Logo amarela" className="h-10 w-10 object-contain sm:h-14 sm:w-14" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex h-full items-center justify-center px-4 py-6 sm:px-8 lg:px-12 lg:py-6">
          <div className="w-full max-w-[700px]">
            <section className="flex flex-col rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-[0_20px_60px_rgba(50,93,58,0.12)] sm:p-6">
              <SectionTitle
                title="Registrar"
                description="Preencha os dados abaixo para criar seu acesso institucional."
              />

              <div className="mt-5 space-y-3">
                <div>
                  <span className="text-sm font-semibold text-emerald-700">Tipo de vínculo</span>
                  <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {bondOptions.map((option) => (
                      <BondOption
                        key={option.value}
                        active={bondType === option.value}
                        title={option.title}
                        description={option.description}
                        onClick={() => setBondType(option.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <p className="text-sm font-semibold text-emerald-700">
                    {bondOptions.find((option) => option.value === bondType)?.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Os campos abaixo mudam conforme o vínculo selecionado.
                  </p>
                </div>

                <form className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {formFieldsByType[bondType].map((field) => (
                      <FormInput key={field.name} field={field} />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-emerald-700">Senha</span>
                      <input
                        type="password"
                        name="password"
                        placeholder="Crie uma senha"
                        className="mt-2 w-full rounded-lg border border-emerald-500 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-emerald-700">Confirmar senha</span>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Repita a senha"
                        className="mt-2 w-full rounded-lg border border-emerald-500 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-between rounded-lg bg-[#46a74b] px-5 py-2.5 text-left text-base font-semibold text-white shadow-[0_10px_24px_rgba(70,167,75,0.28)] transition hover:bg-[#3f9744] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                  >
                    <span>Criar conta</span>
                    <ArrowIcon />
                  </button>
                </form>
              </div>
            </section>

            <div className="mt-3 px-1 ml-10">
              <p className="text-xs text-slate-500">
                Ao criar a conta, você concorda com as orientações institucionais.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-emerald-700">
                <Link to="/" className="transition hover:text-emerald-800">
                  Já tenho conta
                </Link>
                <button type="button" className="transition hover:text-emerald-800">
                  Acessibilidade
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}