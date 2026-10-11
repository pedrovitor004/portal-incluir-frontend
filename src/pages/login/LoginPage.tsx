import logoAmarela from "../../assets/logos/amarela.png";
import logoAzul from "../../assets/logos/azul.png";
import logoClai from "../../assets/logos/logo-clai.png";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoPortal from "../../assets/logos/logo-portal.png";
import logoVerde from "../../assets/logos/verde.png";
import logoVermelha from "../../assets/logos/vermelha.png";

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
            <span className="text-[1.05rem] font-semibold">
              IFPB Campus Monteiro
            </span>
            <span className="text-sm text-emerald-600">
              Coordenação Local de Acessibilidade e Inclusão
            </span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-sky-400" />
      </header>

      <section className="grid flex-1 w-full grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="flex items-center bg-[#47a84b] px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-14">
          <div className="max-w-xl">
            <div className="max-w-[18rem] sm:max-w-[21rem]">
              <img
                src={logoPortal}
                alt="Portal Incluir - Inclusão e acompanhamento educacional"
                className="h-auto w-full object-contain"
              />
            </div>

            <h1 className="mt-10 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
              Bem-vindo ao Portal Incluir!
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/85 sm:text-[1.15rem]">
              Acompanhamento educacional em um ambiente simples, seguro e
              organizado.
            </p>

            <div className="mt-14 flex flex-col gap-5">
              <div className="text-sm font-medium tracking-wide text-white/90">
                CLAI • Instituto Federal da Paraíba
              </div>
              <div className="flex items-end gap-4">
                <img
                  src={logoVermelha}
                  alt="Logo vermelha"
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
                <img
                  src={logoAzul}
                  alt="Logo azul"
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
                <img
                  src={logoVerde}
                  alt="Logo verde"
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
                <img
                  src={logoAmarela}
                  alt="Logo amarela"
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex h-full items-center justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
          <div className="w-full max-w-[430px]">
            <section className="flex flex-col rounded-3xl border border-emerald-100 bg-white/95 p-8 shadow-[0_20px_60px_rgba(50,93,58,0.12)] sm:min-h-[560px] sm:p-10">
              <div>
                <h2 className="text-4xl font-semibold text-emerald-700">Entrar</h2>
                <p className="mt-3 text-base text-slate-500">
                  Acesse sua conta institucional.
                </p>
              </div>

              <form className="mt-10 flex flex-1 flex-col">
                <div className="space-y-6">
                  <label className="block">
                    <span className="text-sm font-semibold text-emerald-700">
                      E-mail
                    </span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="nome@ifpb.edu.br"
                      className="mt-2 w-full rounded-lg border border-emerald-500 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-emerald-700">
                      Senha
                    </span>
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-lg border border-emerald-500 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-between rounded-lg bg-[#46a74b] px-5 py-3.5 text-left text-lg font-semibold text-white shadow-[0_10px_24px_rgba(70,167,75,0.28)] transition hover:bg-[#3f9744] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                  >
                    <span>Entrar</span>
                    <ArrowIcon />
                  </button>

                  <p className="mt-4 text-sm text-slate-500">
                    Use as credenciais fornecidas pela instituição.
                  </p>
                </div>
              </form>
            </section>

            <div className="mt-4 px-1 ml-10">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-emerald-700">
                <button type="button" className="transition hover:text-emerald-800">
                  Privacidade e LGPD
                </button>
                <button type="button" className="transition hover:text-emerald-800">
                  Acessibilidade
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Consulte orientações antes de acessar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}