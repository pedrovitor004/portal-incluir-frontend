import { useEffect } from "react";
import { Link } from "react-router";
import PublicLayout from "../../components/layout/PublicLayout";
import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario, routes } from "../../config/routes";

const erros = {
  401: { titulo: "Autenticação necessária", descricao: "Entre na sua conta para acessar esta área do Portal Incluir.", icone: "M14 3H5v18h9M10 12h11m-4-4 4 4-4 4" },
  403: { titulo: "Acesso não permitido", descricao: "Seu perfil não possui acesso a esta área. Se precisar dessa permissão, entre em contato com a coordenação.", icone: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3ZM9 9l6 6m0-6-6 6" },
  404: { titulo: "Página não encontrada", descricao: "O endereço acessado não existe ou esta página ainda não está disponível no Portal Incluir. Confira o endereço ou volte ao início.", icone: "M14 3H5v18h14V8l-5-5Zm0 0v5h5M9 13h6m-6 4h4" },
  500: { titulo: "Não foi possível abrir esta página", descricao: "Ocorreu um erro inesperado. Tente carregar a página novamente. Se o problema continuar, procure o suporte do portal.", icone: "M12 3 2 21h20L12 3Zm0 6v5m0 3v1" },
  503: { titulo: "Serviço temporariamente indisponível", descricao: "Não foi possível acessar o serviço neste momento. Aguarde um pouco e tente novamente.", icone: "M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1" },
} as const;
export type CodigoErro = keyof typeof erros;

export default function NotFoundPage({ codigo = 404 }: { codigo?: CodigoErro }) {
  const { usuario } = useAuth();
  const erro = erros[codigo];
  useEffect(() => { document.title = `${codigo} — ${erro.titulo} | Portal Incluir`; }, [codigo, erro.titulo]);
  const linkClass = "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
  return <PublicLayout>
    <div aria-hidden="true" className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-primary"><svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={erro.icone} /></svg></div>
    <p className="text-sm font-semibold tracking-widest text-primary">{codigo}</p>
    <h1 data-page-title className="mt-2 text-3xl font-bold leading-tight text-slate-800">{erro.titulo}</h1>
    <p className="mt-4 text-sm leading-relaxed text-slate-500">{erro.descricao}</p>
    <div className="mt-7 flex flex-wrap gap-3">
      {codigo === 401 ? <Link to={routes.login} className={`${linkClass} bg-primary text-white hover:bg-[#287535]`}>Acessar login</Link>
        : codigo === 500 || codigo === 503 ? <button type="button" onClick={() => window.location.reload()} className={`${linkClass} bg-primary text-white hover:bg-[#287535]`}>Tentar novamente</button>
        : <Link to={usuario ? destinoUsuario(usuario) : routes.home} className={`${linkClass} bg-primary text-white hover:bg-[#287535]`}>{usuario ? "Voltar ao meu painel" : "Voltar ao início"}</Link>}
      {(codigo === 401 || codigo === 500 || codigo === 503 || usuario) && <Link to={routes.home} className={`${linkClass} border border-[#dce5dc] text-primary hover:bg-green-50`}>Página inicial</Link>}
    </div>
  </PublicLayout>;
}
