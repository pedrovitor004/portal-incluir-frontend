import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import axios from "axios";
import Button from "../../../../components/common/Button";
import LoadingState from "../../../../components/common/LoadingState";
import { useAuth } from "../../../../hooks/useAuth";
import { canAccess } from "../../../../config/access";
import { planoEducacionalService } from "../../../../services/planoEducacionalService";
import { camposPei, exigirEdicaoPei, prepararPei } from "../../../../services/planoEducacionalValidation";
import { mensagemErro } from "../../../../services/apiError";
import { notificationService } from "../../../../services/notificationService";
import type { EstudanteResponse } from "../../../../types/estudante";
import type { PlanoEducacionalConteudo, PlanoEducacionalResponse } from "../../../../types/planoEducacional";

const vazio: PlanoEducacionalConteudo = {
  semestreAno: "", historico: "", necessidadesEspecificas: "", conhecimentosHabilidadesInteresses: "",
  dificuldadesApresentadas: "", propostasAdaptacoesCurriculares: "",
};
const secao = "space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6";
const campoClass = "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

function erroApi(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
    if (error.response?.status === 403) return "Você não tem permissão para acessar ou salvar este PEI.";
    if (error.response?.status === 404) return "O PEI ou estudante solicitado não foi encontrado.";
    return mensagemErro(error);
  }
  return error instanceof Error ? error.message : mensagemErro(error);
}

type Props = {
  estudante: EstudanteResponse;
  peiId: string | null;
  onSaved: (pei: PlanoEducacionalResponse) => void;
  onCancel: () => void;
  onBusyChange: (busy: boolean) => void;
  areaSolicitacoes?: ReactNode;
};

export default function PeiForm({ estudante, peiId, onSaved, onCancel, onBusyChange, areaSolicitacoes }: Props) {
  const { usuario } = useAuth();
  const formularioId = useId();
  const [conteudo, setConteudo] = useState(vazio);
  const [original, setOriginal] = useState<PlanoEducacionalResponse | null>(null);
  const [carregando, setCarregando] = useState(peiId !== null);
  const [erroCarga, setErroCarga] = useState("");
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const pendente = useRef(false);
  const edicao = peiId !== null;
  const permitido = usuario?.perfil === "COORDENADOR" && canAccess(usuario, "pei.editar") && !estudante.concluido;

  useEffect(() => {
    if (peiId === null) return;
    const controller = new AbortController();
    async function carregar() {
      try {
        const id = Number(peiId);
        if (!Number.isSafeInteger(id) || id <= 0) throw new Error("O identificador do PEI é inválido.");
        const registro = await planoEducacionalService.buscarPorId(id, controller.signal);
        exigirEdicaoPei(registro, estudante.id);
        if (controller.signal.aborted) return;
        const dados = { ...vazio };
        for (const campo of camposPei) dados[campo.name] = registro[campo.name];
        setOriginal(registro);
        setConteudo(dados);
      } catch (error) { if (!controller.signal.aborted) setErroCarga(erroApi(error)); }
      finally { if (!controller.signal.aborted) setCarregando(false); }
    }
    void carregar();
    return () => controller.abort();
  }, [peiId, estudante.id, tentativa]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendente.current || carregando || erroCarga) return;
    setErro("");
    try {
      if (edicao && !original) throw new Error("Carregue o PEI antes de salvar.");
      const request = prepararPei(conteudo, estudante, usuario, original);
      pendente.current = true;
      setSalvando(true);
      onBusyChange(true);
      const salvo = original
        ? await planoEducacionalService.atualizar(original.id, request)
        : await planoEducacionalService.criar(request);
      notificationService.success(original ? "PEI atualizado com sucesso." : "PEI cadastrado com sucesso.");
      onSaved(salvo);
    } catch (error) { const mensagem = erroApi(error); setErro(mensagem); notificationService.error(mensagem); }
    finally { pendente.current = false; setSalvando(false); onBusyChange(false); }
  }

  return <section aria-labelledby="pei-form-titulo" className="space-y-6">
    <header><h2 id="pei-form-titulo" className="text-xl font-semibold text-primary">{edicao ? "Editar PEI" : "Novo PEI"}</h2><p className="mt-1 text-sm text-slate-500">Todos os campos com * são obrigatórios. Preencha o documento completo para salvar.</p></header>
    {carregando && <LoadingState label="Carregando o PEI selecionado..." />}
    {erroCarga && <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{erroCarga}</p><Button variant="secondary" onClick={() => { setErroCarga(""); setCarregando(true); setTentativa(v => v + 1); }}>Tentar novamente</Button></div>}
    {erro && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
    {!permitido && <p role="status" className="text-sm text-slate-600">Este documento não está disponível para edição pela sua conta ou o histórico está concluído.</p>}
    <form id={formularioId} onSubmit={event => void salvar(event)} aria-busy={salvando}>
      <fieldset disabled={!permitido || carregando || salvando || !!erroCarga} className="min-w-0 space-y-6">
        <legend className="sr-only">Conteúdo do PEI</legend>
        <section className={secao}>
          <h3 className="text-lg font-semibold text-slate-900">1. Identificação do documento</h3>
          <dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-medium text-slate-700">Estudante</dt><dd className="mt-1 break-words text-slate-800">{estudante.nomeCompleto} · Matrícula {estudante.matricula}</dd></div><div><dt className="font-medium text-slate-700">Coordenação responsável</dt><dd className="mt-1 break-words text-slate-800">{edicao ? original?.coordenadorNome || "Carregando..." : usuario?.nome}</dd></div></dl>
          <label className="block text-sm font-medium text-slate-700" htmlFor="pei-semestreAno">Semestre/ano *<input id="pei-semestreAno" name="semestreAno" value={conteudo.semestreAno} onChange={e => setConteudo(atual => ({ ...atual, semestreAno: e.target.value }))} required maxLength={20} className={campoClass} aria-describedby="pei-semestreAno-limite" /><span id="pei-semestreAno-limite" className="mt-1 block text-xs font-normal text-slate-500">{conteudo.semestreAno.length}/20 caracteres</span></label>
        </section>
        {camposPei.slice(1).map((campo, index) => <section key={campo.name} className={secao}>
          <h3 className="text-lg font-semibold text-slate-900">{index + 2}. {campo.label}</h3>
          <label className="block text-sm font-medium text-slate-700" htmlFor={`pei-${campo.name}`}>{campo.label} *<textarea id={`pei-${campo.name}`} name={campo.name} value={conteudo[campo.name]} onChange={e => setConteudo(atual => ({ ...atual, [campo.name]: e.target.value }))} required maxLength={campo.limite} rows={5} className={`${campoClass} min-h-[120px] resize-y`} aria-describedby={`pei-${campo.name}-limite`} /><span id={`pei-${campo.name}-limite`} className="mt-1 block text-xs font-normal text-slate-500">{conteudo[campo.name].length}/{campo.limite} caracteres</span></label>
        </section>)}
      </fieldset>
    </form>
    {areaSolicitacoes}
    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row"><Button variant="secondary" disabled={salvando} onClick={onCancel}>Voltar à consulta</Button><Button type="submit" form={formularioId} disabled={!permitido || carregando || salvando || !!erroCarga}>{salvando ? "Salvando..." : edicao ? "Salvar alterações" : "Salvar PEI"}</Button></div>
  </section>;
}
