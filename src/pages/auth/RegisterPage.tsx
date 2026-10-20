import AccessibilitySymbols from "../../components/auth/AccessibilitySymbols";
import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario, routes } from "../../config/routes";
import { mensagemErro } from "../../services/apiError";
import type { CadastroRequest } from "../../types/auth";
import { Link, useNavigate } from "react-router";
import { useState, type FormEvent } from "react";
import logoClai from "../../assets/logos/logo-clai.png";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoPortal from "../../assets/logos/logo-portal.png";
import PasswordField from "../../components/PasswordField";

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

function ProfileIcon({ type }: { type: BondType }) {
  const paths: Record<BondType, string> = {
    teacher: "m3 8 9-5 9 5-9 5-9-5Z M7 11v5c3 3 7 3 10 0v-5 M21 8v7",
    coordinator: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 21v-2a7 7 0 0 1 14 0v2 M9 16l3 3 3-3",
    multidisciplinary: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M3 20v-2a6 6 0 0 1 12 0v2 M16 5a3 3 0 0 1 0 6 M17 14a5 5 0 0 1 4 5v1",
    admin: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z m-4 9 3 3 5-6",
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-primary">
      <path d={paths[type]} />
    </svg>
  );
}

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
      <h1 data-page-title className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function FormInput({ field }: { field: Field }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-primary">{field.label}{["telefone", "dataNascimento"].includes(field.name) ? " (opcional)" : " (obrigatório)"}</span>
      <input
        type={field.type}
        name={field.name}
        autoComplete={({ nome: "name", email: "email", telefone: "tel", dataNascimento: "bday" } as Record<string, string>)[field.name]}
        required={field.name !== "telefone" && field.name !== "dataNascimento"}
        maxLength={field.name === "matricula" ? 30 : field.name === "telefone" ? 20 : field.name === "periodoIngresso" ? 20 : field.name === "areaAtuacao" ? 100 : ["nome", "email", "curso"].includes(field.name) ? 150 : 120}
        placeholder={field.placeholder}
        className="h-9 min-w-0 w-full rounded-lg border border-emerald-300 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition hover:border-emerald-400 focus:border-primary focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    if (form.password !== form.confirmPassword) {
      const mensagem = "As senhas não coincidem.";
      setErro(mensagem);
      setPasswordMismatch(true);
      event.currentTarget.querySelector<HTMLInputElement>('[name="confirmPassword"]')?.focus();
      return;
    }
    const comum = {
      nome: String(form.nome || ""), email: String(form.email || ""), senha: String(form.password || ""),
      matricula: String(form.matricula || ""), telefone: String(form.telefone || ""),
      dataNascimento: form.dataNascimento ? String(form.dataNascimento) : null,
      setor: String(form.setor || ""),
    };
    let request: CadastroRequest;
    switch (bondType) {
      case "teacher": request = { ...comum, perfil: "PROFESSOR", disciplina: String(form.disciplina || "") }; break;
      case "coordinator": request = { ...comum, perfil: "COORDENADOR", cargo: String(form.cargo || "") }; break;
      case "admin": request = { ...comum, perfil: "ADMINISTRADOR", cargo: String(form.cargo || "") }; break;
      case "multidisciplinary": request = { ...comum, perfil: "EQUIPE_MULTIDISCIPLINAR", cargo: String(form.cargo || ""), areaAtuacao: String(form.areaAtuacao || "") }; break;
    }
    setEnviando(true); setErro("");
    try {
      const usuario = await register(request);
      navigate(destinoUsuario(usuario), { replace: true });
    } catch (error) { setErro(mensagemErro(error)); }
    finally { setEnviando(false); }
  }
  const [bondType, setBondType] = useState<BondType>("teacher");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  return (
    <main className="flex min-h-dvh flex-col bg-[#f3f5ef] text-slate-700">
      <header className="shrink-0 border-b border-slate-200 bg-white/95 shadow-[0_1px_0_rgba(255,255,255,0.8)] backdrop-blur">
        <div className="flex w-full items-center gap-5 px-4 py-3 sm:px-6 lg:px-8">
          <img
            src={logoIfpb}
            alt="Instituto Federal da Paraíba"
            className="h-14 w-auto object-contain sm:h-16"
          />
          <img
            src={logoClai}
            alt="Coordenação Local de Acessibilidade e Inclusão"
            className="h-14 w-auto object-contain sm:h-16"
          />

          <div className="hidden flex-col leading-tight text-primary md:flex">
            <span className="text-[1.05rem] font-semibold">IFPB Campus Monteiro</span>
            <span className="text-sm text-primary">
              Coordenação Local de Acessibilidade e Inclusão
            </span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-sky-400" />
      </header>

      <section className="grid flex-1 w-full grid-cols-1 lg:grid-cols-[46.8%_53.2%]">
        <aside className="hidden items-center bg-primary px-6 py-10 text-white sm:px-10 lg:flex lg:px-[60px]">
          <div className="flex w-full flex-col items-start">
            <div className="relative aspect-[685/292] w-[270px] max-w-full shrink-0 self-start overflow-hidden">
              <img
                src={logoPortal}
                alt="Portal Incluir - Inclusão e acompanhamento educacional"
                className="absolute h-auto max-w-none"
                style={{ width: "109.927%", left: "-4.672%", top: "-7.192%" }}
              />
            </div>

            <h2 className="mt-10 max-w-[390px] text-[34px] font-semibold leading-[1.1] tracking-tight">
              Bem-vindo(a) ao Portal<br />Incluir!
            </h2>

            <p className="mt-9 max-w-[500px] text-lg font-normal leading-[1.4] text-white/90">
              Acompanhamento educacional em um ambiente simples, seguro e
              organizado, conectando pessoas e promovendo a inclusão em cada
              etapa da jornada acadêmica.
            </p>

            <div className="mt-[72px] flex w-full flex-col items-start gap-7">
              <div className="text-xs font-semibold leading-relaxed text-white/90">
                CLAI • Instituto Federal da Paraíba
              </div>
              <AccessibilitySymbols />
            </div>
          </div>
        </aside>

        <div className="flex items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-[560px]">
            <section className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_12px_40px_rgba(50,93,58,0.08)] sm:p-5">
              <SectionTitle
                title="Registrar"
                description="Preencha os dados abaixo para criar seu acesso institucional."
              />

              <div className="mt-3 space-y-3">
                <fieldset>
                  <legend className="text-xs font-medium text-primary">Perfil de acesso</legend>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                    {bondOptions.map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-center gap-2 text-xs leading-5 text-slate-600">
                        <input
                          type="radio"
                          name="perfil"
                          value={option.value}
                          checked={bondType === option.value}
                          onChange={() => { setBondType(option.value); setErro(""); setPasswordMismatch(false); }}
                          className="h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        />
                        <ProfileIcon type={option.value} />
                        {option.title}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <form key={bondType} onSubmit={cadastrar} aria-busy={enviando} aria-describedby={erro ? "register-error" : undefined} onInput={() => { if (passwordMismatch) { setPasswordMismatch(false); setErro(""); } }} className="space-y-3">
                  <p id="password-hint" className="text-xs text-slate-600">Preencha os campos obrigatórios. A senha deve ter entre 6 e 72 caracteres.</p>
                  {erro && <p id="register-error" role="alert" className="text-sm text-red-700">{erro}</p>}
                  <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                    {formFieldsByType[bondType].map((field) => (
                      <FormInput key={field.name} field={field} />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                    <PasswordField name="password" label="Senha (obrigatória)" autoComplete="new-password" placeholder="Crie uma senha" describedBy="password-hint" />
                    <PasswordField name="confirmPassword" label="Confirmar senha (obrigatório)" autoComplete="new-password" placeholder="Repita a senha" invalid={passwordMismatch} describedBy={passwordMismatch ? "password-hint register-error" : "password-hint"} />
                  </div>

                  <button
                    type="submit" disabled={enviando}
                    className="inline-flex w-full items-center justify-between rounded-lg bg-primary px-4 py-2 text-left text-sm font-semibold text-white shadow-[0_4px_12px_rgba(70,167,75,0.18)] transition hover:bg-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                  >
                    <span>{enviando ? "Criando conta..." : "Criar conta"}</span>
                    <ArrowIcon />
                  </button>
                </form>
              </div>
            </section>

            <div className="auth-footer mt-3 px-1 text-center">
              <p className="text-xs text-slate-500">
                Ao criar a conta, você concorda com as orientações institucionais.
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-medium leading-5 text-primary">
                <Link to={routes.login} className="text-sm font-medium leading-5 transition hover:text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
