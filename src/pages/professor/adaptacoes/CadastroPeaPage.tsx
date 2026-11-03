import { useEffect, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { canAccess } from "../../../config/access";
import { estudantesService } from "../../../services/estudantesService";
import { adaptacoesPedagogicasService } from "../../../services/adaptacoesPedagogicasService";
import { camposPea, prepararCadastroPea, prepararEdicaoPea } from "../../../services/cadastroPeaValidation";
import { mensagemErro } from "../../../services/apiError";
import { notificationService } from "../../../services/notificationService";
import type { EstudanteResponse } from "../../../types/estudante";
import Button from "../../../components/common/Button";
import type { AdaptacaoPedagogicaConteudo, AdaptacaoPedagogicaResponse } from "../../../types/adaptacaoPedagogica";

const formularioInicial: AdaptacaoPedagogicaConteudo = {
  componenteCurricular: "",
  semestreAno: "",
  objetivoGeral: "",
  objetivosEspecificos: "",
  conteudosProgramaticos: "",
  metodologia: "",
  avaliacao: "",
  bibliografiaBasica: "",
  bibliografiaComplementar: "",
};

const camposTexto = camposPea.slice(2);

const campoClass = "mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500";

function FormularioPea({ peaId }: { peaId: string | null }) {
  const [formulario, setFormulario] = useState(formularioInicial);

  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [estudantes, setEstudantes] = useState<EstudanteResponse[]>([]);
  const [estudanteId, setEstudanteId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erroEstudantes, setErroEstudantes] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const enviando = useRef(false);
  const edicao = peaId !== null;
  const [peaOriginal, setPeaOriginal] = useState<AdaptacaoPedagogicaResponse | null>(null);
  const podeCadastrar = !!usuario && usuario.perfil === "PROFESSOR" && canAccess(usuario, "pedagogico.editar");
  const professorId = usuario?.perfilId;
  const contaId = usuario?.id;

  function erroApi(error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
      if (error.response?.status === 403) return "Acesso negado. Verifique sua permissão e o vínculo com o estudante.";
      if (error.response?.status === 404) return "O estudante ou recurso solicitado não está mais disponível.";
    }
    return mensagemErro(error);
  }

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        if (edicao) {
          const id = Number(peaId);
          if (!Number.isSafeInteger(id) || id <= 0) throw new Error("O PEA informado é inválido.");
          const pea = await adaptacoesPedagogicasService.buscarPorId(id);
          if (!podeCadastrar || pea.professorId !== professorId) throw new Error("Você não tem permissão para editar este PEA.");
          if (pea.arquivado) throw new Error("Este PEA está arquivado e disponível somente para consulta.");
          const estudante = await estudantesService.buscarPorId(pea.estudanteId);
          if (!ativo) return;
          const conteudo = { ...formularioInicial };
          for (const campo of camposPea) conteudo[campo.name] = pea[campo.name];
          setPeaOriginal(pea);
          setFormulario(conteudo);
          setEstudanteId(String(pea.estudanteId));
          setEstudantes([estudante]);
        } else {
          const dados = await estudantesService.listarTodos();
          if (ativo) setEstudantes(dados);
        }
      } catch (error: unknown) {
        if (ativo) setErroEstudantes(axios.isAxiosError(error) ? erroApi(error) : error instanceof Error ? error.message : mensagemErro(error));
      }
    }
    void carregar().finally(() => {
      if (ativo) setCarregando(false);
    });
    return () => { ativo = false; };
  }, [tentativa, contaId, professorId, podeCadastrar, edicao, peaId]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando.current || carregando || erroEstudantes) return;
    setErro("");
    let request;
    try {
      if (edicao && !peaOriginal) throw new Error("Aguarde o carregamento do PEA antes de salvar.");
      request = edicao && peaOriginal
        ? prepararEdicaoPea(formulario, peaOriginal, estudantes, usuario)
        : prepararCadastroPea(formulario, Number(estudanteId), estudantes, usuario);
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : "Verifique os dados do formulário.";
      setErro(mensagem);
      notificationService.error(mensagem);
      return;
    }
    enviando.current = true;
    setSalvando(true);
    try {
      if (edicao && peaOriginal) {
        await adaptacoesPedagogicasService.atualizar(peaOriginal.id, request);
        notificationService.success("PEA atualizado com sucesso.");
        navigate("/professor/documentos");
      } else {
        await adaptacoesPedagogicasService.criar(request);
        notificationService.success("PEA cadastrado com sucesso.");
        navigate(`/professor/estudantes/${request.estudanteId}`);
      }
    } catch (error: unknown) {
      const mensagem = erroApi(error);
      setErro(mensagem);
      notificationService.error(mensagem);
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }

  function atualizarCampo(name: keyof AdaptacaoPedagogicaConteudo, value: string) {
    setFormulario(atual => ({ ...atual, [name]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-primary sm:text-[28px]">{edicao ? "Editar Plano de Ensino Adaptado (PEA)" : "Plano de Ensino Adaptado (PEA)"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {edicao ? "Atualize o conteúdo do documento. O estudante e o professor responsável permanecem os mesmos." : "Registre as adaptações pedagógicas por componente curricular. O cadastro do PEA não exige um PEI previamente preenchido."}
        </p>
      </header>

      <form className="space-y-6" onSubmit={event => void salvar(event)} aria-busy={salvando}>
        <p className="text-sm text-slate-600">Todos os campos indicados com * são obrigatórios.</p>
        {erro && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
        {erroEstudantes && <div role="alert" className="space-y-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"><p>{erroEstudantes}</p><Button variant="secondary" onClick={() => { setCarregando(true); setErroEstudantes(""); setTentativa(atual => atual + 1); }}>Tentar novamente</Button></div>}
        {carregando && <p role="status" className="text-sm text-slate-600">Carregando estudantes...</p>}
        {!carregando && !erroEstudantes && !estudantes.length && <p role="status" className="text-sm text-slate-600">Nenhum estudante disponível para seu acompanhamento. Solicite o vínculo à coordenação.</p>}
        <fieldset disabled={salvando || (edicao && (carregando || !!erroEstudantes || !peaOriginal))} className="min-w-0 space-y-6">
          <legend className="sr-only">Dados do PEA</legend>
          <section aria-labelledby="pea-identificacao" className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
            <h2 id="pea-identificacao" className="text-lg font-semibold text-slate-900">1. Identificação</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="pea-estudante">
                Estudante *
                <select id="pea-estudante" className={campoClass} value={estudanteId} onChange={event => setEstudanteId(event.target.value)} disabled={edicao || carregando || !!erroEstudantes} required>
                  <option value="">Selecione pelo nome e matrícula</option>
                  {estudantes.map(estudante => <option key={estudante.id} value={estudante.id} disabled={estudante.concluido}>{estudante.nomeCompleto} · Matrícula {estudante.matricula}{estudante.concluido ? " · Histórico concluído" : ""}</option>)}
                </select>
              </label>
              <div>
                <p className="text-sm font-medium text-slate-700">Professor responsável *</p>
                <p className="mt-1.5 break-words text-sm text-slate-800">{edicao ? peaOriginal?.professorNome || "Carregando professor..." : usuario?.nome || "Professor não identificado"}</p>
              </div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="pea-componente">
                Componente curricular *
                <input id="pea-componente" name="componenteCurricular" className={campoClass} value={formulario.componenteCurricular} onChange={event => atualizarCampo("componenteCurricular", event.target.value)} required maxLength={150} aria-describedby="pea-componente-limite" />
                <span id="pea-componente-limite" className="mt-1 block text-xs font-normal text-slate-500">{formulario.componenteCurricular.length}/150 caracteres</span>
              </label>
              <label className="block text-sm font-medium text-slate-700" htmlFor="pea-semestre">
                Semestre/ano *
                <input id="pea-semestre" name="semestreAno" className={campoClass} value={formulario.semestreAno} onChange={event => atualizarCampo("semestreAno", event.target.value)} required maxLength={20} aria-describedby="pea-semestre-limite" />
                <span id="pea-semestre-limite" className="mt-1 block text-xs font-normal text-slate-500">{formulario.semestreAno.length}/20 caracteres</span>
              </label>
            </div>
          </section>

          <section aria-labelledby="pea-conteudo" className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
            <h2 id="pea-conteudo" className="text-lg font-semibold text-slate-900">2. Planejamento pedagógico</h2>
            {camposTexto.map(campo => (
              <label key={campo.name} className="block text-sm font-medium text-slate-700" htmlFor={`pea-${campo.name}`}>
                {campo.label} *
                <textarea id={`pea-${campo.name}`} name={campo.name} className={`${campoClass} min-h-[120px] resize-y`} rows={5} value={formulario[campo.name]} onChange={event => atualizarCampo(campo.name, event.target.value)} required maxLength={5000} aria-describedby={`pea-${campo.name}-limite`} />
                <span id={`pea-${campo.name}-limite`} className="mt-1 block text-xs font-normal text-slate-500">{formulario[campo.name].length}/5000 caracteres</span>
              </label>
            ))}
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{edicao ? "A edição preserva os vínculos do documento." : "O PEA será vinculado ao estudante selecionado e ao professor responsável."}</p>
            <Button type="submit" disabled={salvando || carregando || !!erroEstudantes || !estudanteId || !podeCadastrar}>{salvando ? "Salvando..." : edicao ? "Salvar alterações" : "Salvar PEA"}</Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default function CadastroPeaPage() {
  const [params] = useSearchParams();
  const { usuario } = useAuth();
  const peaId = params.get("peaId");
  return <FormularioPea key={`${usuario?.id}-${peaId ?? "novo"}`} peaId={peaId} />;
}
