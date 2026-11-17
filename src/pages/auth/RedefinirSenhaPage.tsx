import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import RecuperacaoSenhaLayout from "../../components/auth/RecuperacaoSenhaLayout";
import PasswordField from "../../components/PasswordField";
import Button from "../../components/common/Button";
import LoadingState from "../../components/common/LoadingState";
import { authService } from "../../services/authService";
import { mensagemErro } from "../../services/apiError";
import { tokenRecuperacaoValido, validarNovaSenha } from "../../services/recuperacaoSenhaValidation";
import { routes } from "../../config/routes";
import { useAuth } from "../../hooks/useAuth";

export default function RedefinirSenhaPage() {
  const location = useLocation();
  const { atualizarSessao } = useAuth();
  const [token, setToken] = useState(() => new URLSearchParams(location.hash.slice(1)).get("token") ?? "");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const pendente = useRef(false);
  useEffect(() => {
    if (window.location.hash) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }, []);
  async function redefinir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pendente.current) return;
    const dados = new FormData(event.currentTarget);
    const senha = String(dados.get("novaSenha") ?? "");
    const validacao = validarNovaSenha(senha, String(dados.get("confirmacao") ?? ""));
    setErro(validacao ?? ""); if (validacao || !tokenRecuperacaoValido(token)) return;
    pendente.current = true; setEnviando(true);
    try {
      await authService.redefinirSenha({ token, novaSenha: senha });
      setToken(""); setSucesso(true); void atualizarSessao();
    } catch (error) { setErro(mensagemErro(error)); }
    finally { pendente.current = false; setEnviando(false); }
  }
  return <RecuperacaoSenhaLayout titulo="Redefinir senha" descricao="Escolha sua nova senha para acessar o Portal Incluir.">
    {sucesso ? <div role="status" className="space-y-4"><p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">Senha redefinida com sucesso. As sessões anteriores da sua conta perderam a validade.</p><Link to={routes.login} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Entrar com a nova senha</Link></div> : !tokenRecuperacaoValido(token) ? <div className="space-y-4"><p role="alert" className="text-sm text-red-700">Link de recuperação inválido ou ausente. Abra o link enviado ao seu e-mail ou solicite uma nova recuperação.</p><Link to={routes.recuperarSenha} className="inline-flex min-h-11 items-center font-semibold text-primary underline">Solicitar novo link</Link></div> : <form onSubmit={redefinir} aria-busy={enviando} className="space-y-5">
      <p id="nova-senha-ajuda" className="text-xs text-slate-500">Use entre 6 e 72 caracteres. Não reutilize uma senha compartilhada com outras pessoas.</p>
      <fieldset disabled={enviando} className="space-y-5">
        <PasswordField name="novaSenha" label="Nova senha" autoComplete="new-password" describedBy="nova-senha-ajuda" />
        <PasswordField name="confirmacao" label="Confirmar nova senha" autoComplete="new-password" invalid={!!erro} describedBy={erro ? "nova-senha-erro" : "nova-senha-ajuda"} />
      </fieldset>
      {erro && <p id="nova-senha-erro" role="alert" className="text-sm text-red-700">{erro}</p>}
      {enviando && <LoadingState compact label="Redefinindo senha..." />}
      <Button type="submit" disabled={enviando} className="w-full">{enviando ? "Aguarde..." : "Redefinir senha"}</Button>
      <Link to={routes.recuperarSenha} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">Preciso de um novo link</Link>
    </form>}
  </RecuperacaoSenhaLayout>;
}
