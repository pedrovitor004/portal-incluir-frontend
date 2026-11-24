import { useRef, useState, type FormEvent } from "react";
import RecuperacaoSenhaLayout from "../../components/auth/RecuperacaoSenhaLayout";
import Button from "../../components/common/Button";
import LoadingState from "../../components/common/LoadingState";
import { authService } from "../../services/authService";
import { mensagemErro } from "../../services/apiError";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const pendente = useRef(false);
  async function solicitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pendente.current) return;
    pendente.current = true; setEnviando(true); setErro("");
    try { const resposta = await authService.recuperarSenha({ email: email.trim() }); setMensagem(resposta.message); }
    catch (error) { setErro(mensagemErro(error)); }
    finally { pendente.current = false; setEnviando(false); }
  }
  return <RecuperacaoSenhaLayout titulo="Recuperar senha" descricao="Informe o e-mail cadastrado para solicitar um link de recuperação.">
    {mensagem ? <div className="space-y-4"><p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">{mensagem}</p><p className="text-sm text-slate-600">Confira também sua pasta de spam. O link é válido por 30 minutos. Se não chegar, aguarde alguns minutos antes de solicitar novamente.</p><Button variant="secondary" onClick={() => setMensagem("")}>Solicitar novamente</Button></div> : <form onSubmit={solicitar} aria-busy={enviando} className="space-y-5">
      <label className="block text-sm font-semibold text-primary">E-mail cadastrado<input type="email" name="email" autoComplete="email" required maxLength={150} disabled={enviando} value={email} onChange={e => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-lg border border-emerald-300 px-4 text-sm font-normal outline-none focus:ring-4 focus:ring-emerald-100" /></label>
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      {enviando && <LoadingState compact label="Solicitando recuperação..." />}
      <Button type="submit" disabled={enviando} className="w-full">{enviando ? "Aguarde..." : "Enviar link de recuperação"}</Button>
    </form>}
  </RecuperacaoSenhaLayout>;
}
