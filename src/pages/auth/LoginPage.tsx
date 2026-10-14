import logoAmarela from "../../assets/logos/amarela.png";
import logoAzul from "../../assets/logos/azul.png";
import logoVerde from "../../assets/logos/verde.png";
import logoVermelha from "../../assets/logos/vermelha.png";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario } from "../../config/routes";
import { mensagemErro } from "../../services/apiError";
import { Link, useNavigate } from "react-router";
import logoClai from "../../assets/logos/logo-clai.png";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoPortal from "../../assets/logos/logo-portal.png";
import PasswordField from "../../components/PasswordField";

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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;
    const form = new FormData(event.currentTarget);
    setEnviando(true); setErro("");
    try {
      const usuario = await login({
        email: String(form.get("email") || ""), senha: String(form.get("password") || ""),
      });
      navigate(destinoUsuario(usuario), { replace: true });
    } catch (error) { setErro(mensagemErro(error)); }
    finally { setEnviando(false); }
  }
  return (
    <main className="flex min-h-dvh flex-col bg-[#f3f5ef] text-slate-700 lg:h-dvh">
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
            <span className="text-[1.05rem] font-semibold">
              IFPB Campus Monteiro
            </span>
            <span className="text-sm text-primary">
              Coordenação Local de Acessibilidade e Inclusão
            </span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-sky-400" />
      </header>

      <section className="grid min-h-0 flex-1 w-full grid-cols-1 lg:grid-cols-[46.8%_53.2%]">
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
              Bem-vindo ao Portal<br />Incluir!
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
              <div className="flex items-center gap-5">
                <img
                  src={logoVermelha}
                  alt="Logo vermelha"
                  className="h-14 w-14 rounded-md object-contain ring-1 ring-white/20 shadow-[0_3px_8px_rgba(0,0,0,0.10)] transition duration-200 ease-out hover:ring-white/50 hover:shadow-[0_8px_18px_rgba(0,0,0,0.20)] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-105 motion-reduce:transition-none"
                />
                <img
                  src={logoAzul}
                  alt="Logo azul"
                  className="h-14 w-14 rounded-md object-contain ring-1 ring-white/20 shadow-[0_3px_8px_rgba(0,0,0,0.10)] transition duration-200 ease-out hover:ring-white/50 hover:shadow-[0_8px_18px_rgba(0,0,0,0.20)] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-105 motion-reduce:transition-none"
                />
                <img
                  src={logoVerde}
                  alt="Logo verde"
                  className="h-14 w-14 rounded-md object-contain ring-1 ring-white/20 shadow-[0_3px_8px_rgba(0,0,0,0.10)] transition duration-200 ease-out hover:ring-white/50 hover:shadow-[0_8px_18px_rgba(0,0,0,0.20)] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-105 motion-reduce:transition-none"
                />
                <img
                  src={logoAmarela}
                  alt="Logo amarela"
                  className="h-14 w-14 rounded-md object-contain ring-1 ring-white/20 shadow-[0_3px_8px_rgba(0,0,0,0.10)] transition duration-200 ease-out hover:ring-white/50 hover:shadow-[0_8px_18px_rgba(0,0,0,0.20)] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-105 motion-reduce:transition-none"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 items-center justify-center px-4 py-5 sm:px-8 lg:px-10">
          <div className="w-full max-w-[430px]">
            <section className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-[0_12px_40px_rgba(50,93,58,0.08)] sm:p-8">
              <div>
                <h1 data-page-title className="text-3xl font-bold tracking-tight text-primary">Entrar</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Acesse sua conta institucional.
                </p>
              </div>

              <form onSubmit={entrar} aria-busy={enviando} aria-describedby={erro ? "login-error" : undefined} className="mt-7 flex flex-col">
                {erro && <p id="login-error" role="alert" className="mb-4 text-sm text-red-700">{erro}</p>}
                <div className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-primary">
                      E-mail
                    </span>
                    <input
                      type="email"
                      required name="email"
                      autoComplete="email"
                      placeholder="nome@ifpb.edu.br"
                      className="h-12 w-full rounded-lg border border-emerald-300 bg-white px-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition hover:border-emerald-400 focus:border-primary focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>

                  <PasswordField name="password" label="Senha" autoComplete="current-password" placeholder="Sua senha" />

                  <div className="-mt-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <button
                    type="submit" disabled={enviando}
                    className="inline-flex h-12 w-full items-center justify-between rounded-lg bg-primary px-5 text-left text-sm font-semibold text-white shadow-[0_4px_12px_rgba(70,167,75,0.18)] transition hover:bg-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                  >
                    <span>{enviando ? "Entrando..." : "Entrar"}</span>
                    <ArrowIcon />
                  </button>

                  <p className="text-sm leading-relaxed text-slate-500">
                    Use as credenciais fornecidas pela instituição.
                  </p>
                </div>
              </form>
            </section>

            <div className="auth-footer mt-5 px-1">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-medium leading-5 text-primary">
                <button type="button" className="text-sm font-medium leading-5 transition hover:text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  Privacidade e LGPD
                </button>
                <Link to="/register" className="text-sm font-medium leading-5 transition hover:text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  Crie sua conta
                </Link>
              </div>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Consulte orientações antes de acessar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
