import { useEffect } from "react";
import { Link } from "react-router";
import PublicLayout from "../../components/layout/PublicLayout";
import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario, routes } from "../../config/routes";

export default function HomePage() {
  const { usuario } = useAuth();
  useEffect(() => { document.title = "Início | Portal Incluir"; }, []);
  return <PublicLayout>
    <span className="mb-4 w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800">Acessibilidade e inclusão</span>
    <h1 data-page-title className="text-3xl font-bold leading-tight text-primary sm:text-4xl">Bem-vindo(a) ao Portal Incluir!</h1>
    <p className="mt-5 text-base leading-relaxed text-slate-600">Um espaço para apoiar o acompanhamento educacional dos estudantes e a atuação integrada da coordenação, dos professores e da equipe multidisciplinar.</p>
    <p className="mt-3 text-sm leading-relaxed text-slate-500">Acesse sua conta institucional para utilizar os recursos disponíveis para o seu perfil.</p>
    <Link to={routes.login} className="mt-7 inline-flex min-h-11 items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287535] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Acessar login <span aria-hidden="true">→</span></Link>
    {usuario && <Link to={destinoUsuario(usuario)} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dce5dc] px-6 py-3 text-sm font-semibold text-primary hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-primary">Voltar ao meu painel</Link>}
  </PublicLayout>;
}
