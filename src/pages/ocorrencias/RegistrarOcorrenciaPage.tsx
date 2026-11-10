import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { canAccess } from "../../config/access";
import { http } from "../../services/http";
import { ocorrenciasService } from "../../services/ocorrenciasService";
import { mensagemErro } from "../../services/apiError";
import type { EstudanteResponse } from "../../types/estudante";
import Button from "../../components/common/Button";
import LoadingState from "../../components/common/LoadingState";

const campo = "mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-800 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:opacity-60";
function agoraLocal() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(" ", "T");
}
export default function RegistrarOcorrenciaPage() {
  const { usuario } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<EstudanteResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroConsulta, setErroConsulta] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [estudante, setEstudante] = useState(params.get("estudanteId") || "");
  const [data, setData] = useState(agoraLocal);
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const operando = useRef(false);
  const arquivoInput = useRef<HTMLInputElement>(null);
  const arquivoId = useId();
  const permitido = !!usuario && usuario.perfil === "EQUIPE_MULTIDISCIPLINAR" && canAccess(usuario, "suporte.registrar");
  useEffect(() => {
    if (!permitido) return;
    const c = new AbortController();
    http.get<EstudanteResponse[]>("/estudantes", { signal: c.signal }).then(({ data }) => {
      if (c.signal.aborted) return;
      if (!Array.isArray(data)) throw new Error("Não foi possível consultar os estudantes.");
      setAlunos(data.filter(e => e.ativo && !e.dataConclusao).sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto, "pt-BR")));
    }).catch(e => { if (!c.signal.aborted) setErroConsulta(mensagemErro(e)); }).finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
  }, [permitido, tentativa]);
  if (!permitido) return <p role="alert">O registro de ocorrências é realizado pela equipe multidisciplinar.</p>;
  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (operando.current) return;
    setErro("");
    if (!alunos.some(a => a.id === Number(estudante))) { setErro("Escolha o estudante que você está acompanhando."); return; }
    if (!descricao.trim()) { setErro("Descreva o que aconteceu."); return; }
    if (arquivo && arquivo.size > 10 * 1024 * 1024) { setErro("O anexo deve ter no máximo 10 MB."); return; }
    operando.current = true; setSalvando(true);
    try {
      const o = await ocorrenciasService.registrar({ estudanteId: Number(estudante), descricao: descricao.trim(), ocorridaEm: `${data}:00` }, arquivo);
      window.dispatchEvent(new Event("portal:notifications-changed"));
      navigate(`/equipe/ocorrencias?id=${o.id}&registrada=1`, { replace: true });
    } catch (e) { setErro(mensagemErro(e)); }
    finally { operando.current = false; setSalvando(false); }
  }
  const aluno = alunos.find(a => a.id === Number(estudante));
  return <main className="mx-auto max-w-4xl space-y-5 pb-10">
    <header><Link to="/equipe/dashboard" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary">← Voltar ao início</Link><div className="mt-2 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-primary"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M9 5H5v16h14V5h-4M9 3h6v4H9zM8 12h8M8 16h5" /></svg></span><div><h1 data-page-title className="text-2xl font-bold text-primary">Registrar ocorrência</h1><p className="mt-1 text-sm leading-relaxed text-slate-500">Um registro simples para manter todos informados sobre o estudante.</p></div></div></header>
    {carregando ? <LoadingState label="Consultando seus estudantes..." /> : erroConsulta ? <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">{erroConsulta}<Button className="mt-3" variant="secondary" onClick={() => { setErroConsulta(""); setCarregando(true); setTentativa(t => t + 1); }}>Tentar novamente</Button></div> : !alunos.length ? <p role="status" className="rounded-xl border bg-white p-6">Você ainda não possui estudantes ativos para registrar ocorrências. Solicite à coordenação o vínculo de acompanhamento.</p> : <form onSubmit={e => void salvar(e)} className="overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-[0_4px_24px_rgba(24,91,50,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7"><h2 className="text-sm font-semibold text-slate-800">Informações da ocorrência</h2><p className="text-xs text-slate-500">Os campos com <span className="text-red-600">*</span> são obrigatórios</p></div>
      <div className="space-y-6 p-5 sm:p-7">
        <fieldset disabled={salvando} className="space-y-6">
          <legend className="sr-only">Dados da ocorrência</legend>
          <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><label className="block text-sm font-semibold text-slate-700">Estudante <span className="text-red-600">*</span><select required className={campo} value={estudante} onChange={e => setEstudante(e.target.value)}><option value="">Selecione um estudante</option>{alunos.map(a => <option key={a.id} value={a.id}>{a.nomeCompleto} · {a.matricula}</option>)}</select><span className="mt-2 block text-xs font-normal text-slate-500">Estudantes disponíveis para o seu acompanhamento.</span></label><label className="block text-sm font-semibold text-slate-700">Quando aconteceu? <span className="text-red-600">*</span><input required type="datetime-local" max={agoraLocal()} className={campo} value={data} onChange={e => setData(e.target.value)} /><span className="mt-2 block text-xs font-normal text-slate-500">Data e hora de Brasília.</span></label></div>
          {aluno && <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/70 px-4 py-3"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">{aluno.nomeCompleto.slice(0, 1)}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-green-900">{aluno.nomeCompleto}</p><p className="mt-0.5 break-words text-xs text-green-800/80">{aluno.curso} · Matrícula {aluno.matricula}</p></div></div>}
          <label className="block text-sm font-semibold text-slate-700">O que aconteceu? <span className="text-red-600">*</span><textarea required maxLength={5000} rows={5} value={descricao} onChange={e => setDescricao(e.target.value)} className={`${campo} resize-y leading-relaxed`} placeholder="Descreva o que você observou ou o que o estudante relatou..." /><span className="mt-2 flex flex-wrap justify-between gap-2 text-xs font-normal text-slate-500"><span>Ex.: dificuldade na atividade, ausência informada ou queixa durante o acompanhamento.</span><span className="tabular-nums">{descricao.length}/5000</span></span></label>
          <div><div className="mb-2 flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-700">Foto ou documento</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Opcional</span></div><input ref={arquivoInput} id={arquivoId} type="file" accept=".png,.jpg,.jpeg,.pdf,.docx,.txt" onChange={e => { setArquivo(e.target.files?.[0] || null); setErro(""); }} className="peer sr-only" /><label htmlFor={arquivoId} className={`flex min-h-24 cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${arquivo ? "border-green-300 bg-green-50/50" : "border-slate-300 bg-slate-50/60 hover:border-green-400 hover:bg-green-50/50"}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m8 13 7-7a3 3 0 0 1 4 4l-9 9a5 5 0 0 1-7-7l9-9M8 13l-2 2a2 2 0 0 0 3 3l8-8" /></svg></span><span className="min-w-0"><span className="block break-words text-sm font-semibold text-slate-700">{arquivo ? arquivo.name : "Selecionar foto ou documento"}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{arquivo ? `${(arquivo.size / 1024 / 1024).toFixed(1)} MB · Clique para trocar o anexo` : "PNG, JPEG, PDF, Word ou texto · Até 10 MB"}</span></span></label>{arquivo && <button type="button" className="mt-1 min-h-10 text-xs font-semibold text-red-700 hover:underline" onClick={() => { setArquivo(null); if (arquivoInput.current) arquivoInput.current.value = ""; }}>Remover anexo</button>}</div>
        </fieldset>
        <div className="flex items-start gap-3 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg><p>A coordenação e os professores vinculados ao estudante receberão um alerta quando você salvar.</p></div>
        {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7"><Button variant="secondary" disabled={salvando} onClick={() => navigate("/equipe/ocorrencias")}>Cancelar</Button><Button type="submit" disabled={salvando} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>}>{salvando ? "Registrando..." : "Salvar ocorrência"}</Button></div>
    </form>}
  </main>;
}
