import Modal from "../../../components/common/Modal";
import { routes } from "../../../config/routes";
import { solicitacoesPeaService } from "../../../services/solicitacoesPeaService";
import { criarChavesIdempotencia, exigirSolicitacaoEntregavel, mensagemErroSolicitacaoPea, modoCadastroPea, prepararEntregaPea } from "../../../services/solicitacaoPeaModel";
import type { SolicitacaoPeaResponse } from "../../../types/solicitacaoPea";
import PeaFields from "../../../components/pea/PeaFields";
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



const campoClass = "mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500";

function FormularioPea({ peaId, solicitacaoId }: { peaId: string | null; solicitacaoId: string | null }) {
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
  const solicitado = solicitacaoId !== null;
  const [solicitacao, setSolicitacao] = useState<SolicitacaoPeaResponse | null>(null);
  const [confirmacao, setConfirmacao] = useState<AdaptacaoPedagogicaConteudo | null>(null);
  const chaves = useRef(criarChavesIdempotencia());
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
        if (solicitado) {
          const contexto = await solicitacoesPeaService.contexto(Number(solicitacaoId));
          // Valida destinatário/permissões sem exigir vínculo ou consulta geral do estudante.
          exigirSolicitacaoEntregavel(contexto, usuario);
          if (!ativo) return;
          setSolicitacao(contexto);
          setEstudanteId(String(contexto.estudante.id));
        } else if (edicao) {
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
        if (ativo) setErroEstudantes(solicitado ? mensagemErroSolicitacaoPea(error) : axios.isAxiosError(error) ? erroApi(error) : error instanceof Error ? error.message : mensagemErro(error));
      }
    }
    void carregar().finally(() => {
      if (ativo) setCarregando(false);
    });
    return () => { ativo = false; };
  }, [tentativa, contaId, professorId, podeCadastrar, edicao, peaId, solicitado, solicitacaoId, usuario]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando.current || confirmacao || carregando || erroEstudantes) return;
    setErro("");
    let request;
    try {
      if (solicitado) {
        if (!solicitacao) throw new Error("Aguarde o carregamento da solicitação.");
        setConfirmacao(prepararEntregaPea(formulario, solicitacao, usuario));
        return;
      }
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

  async function confirmarEntrega() {
    if (!solicitacao || !confirmacao || enviando.current) return;
    enviando.current = true; setSalvando(true); setErro("");
    try {
      await solicitacoesPeaService.entregar(solicitacao.id, confirmacao, chaves.current(confirmacao));
      notificationService.success("PEA entregue com sucesso.");
      navigate(`${routes.solicitacoesPeaProfessor}/${solicitacao.id}`);
    } catch (error: unknown) {
      setErro(mensagemErroSolicitacaoPea(error));
    } finally { enviando.current = false; setSalvando(false); }
  }

  function atualizarCampo(name: keyof AdaptacaoPedagogicaConteudo, value: string) {
    setFormulario(atual => ({ ...atual, [name]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-primary sm:text-[28px]">{solicitado ? "Preencher PEA solicitado" : edicao ? "Editar Plano de Ensino Adaptado (PEA)" : "Plano de Ensino Adaptado (PEA)"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {solicitado ? "Este novo PEA será entregue exclusivamente à solicitação indicada. O estudante está fixado e não é necessário PEI." : edicao ? "Atualize o conteúdo do documento. O estudante e o professor responsável permanecem os mesmos." : "Registre as adaptações pedagógicas por componente curricular. O cadastro do PEA não exige um PEI previamente preenchido."}
        </p>
      </header>

      {solicitacao && <section className="space-y-2 rounded-xl bg-emerald-50 p-4 text-sm"><p className="font-semibold">Solicitação #{solicitacao.id} · {solicitacao.contexto}</p><p>Estudante: {solicitacao.estudante.nome} · Matrícula {solicitacao.estudante.matricula}</p><p className="whitespace-pre-wrap">{solicitacao.orientacoes || "Sem orientações adicionais."}</p></section>}
      <form className="space-y-6" onSubmit={event => void salvar(event)} aria-busy={salvando}>
        <p className="text-sm text-slate-600">Todos os campos indicados com * são obrigatórios.</p>
        {erro && !confirmacao && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
        {erroEstudantes && <div role="alert" className="space-y-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"><p>{erroEstudantes}</p><Button variant="secondary" onClick={() => { setCarregando(true); setErroEstudantes(""); setTentativa(atual => atual + 1); }}>Tentar novamente</Button></div>}
        {carregando && <p role="status" className="text-sm text-slate-600">{solicitado ? "Carregando solicitação..." : "Carregando estudantes..."}</p>}
        {!solicitado && !carregando && !erroEstudantes && !estudantes.length && <p role="status" className="text-sm text-slate-600">Nenhum estudante disponível para seu acompanhamento. Solicite o vínculo à coordenação.</p>}
        <fieldset disabled={salvando || !!confirmacao || ((edicao || solicitado) && (carregando || !!erroEstudantes || (edicao ? !peaOriginal : !solicitacao)))} className="min-w-0 space-y-6">
          <legend className="sr-only">Dados do PEA</legend>
          <PeaFields conteudo={formulario} onChange={atualizarCampo} identificacao={<>
              <label className="block text-sm font-medium text-slate-700" htmlFor="pea-estudante">
                Estudante *
                <select id="pea-estudante" className={campoClass} value={estudanteId} onChange={event => setEstudanteId(event.target.value)} disabled={solicitado || edicao || carregando || !!erroEstudantes} required>
                  <option value="">Selecione pelo nome e matrícula</option>
                  {solicitacao && <option value={solicitacao.estudante.id}>{solicitacao.estudante.nome} · Matrícula {solicitacao.estudante.matricula}</option>}
                  {estudantes.map(estudante => <option key={estudante.id} value={estudante.id} disabled={estudante.concluido}>{estudante.nomeCompleto} · Matrícula {estudante.matricula}{estudante.concluido ? " · Histórico concluído" : ""}</option>)}
                </select>
              </label>
              <div>
                <p className="text-sm font-medium text-slate-700">Professor responsável *</p>
                <p className="mt-1.5 break-words text-sm text-slate-800">{edicao ? peaOriginal?.professorNome || "Carregando professor..." : usuario?.nome || "Professor não identificado"}</p>
              </div>
          </>} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{solicitado ? "Será criado um novo PEA para esta entrega. PEAs anteriores permanecem no histórico." : edicao ? "A edição preserva os vínculos do documento." : "O PEA será vinculado ao estudante selecionado e ao professor responsável."}</p>
            <Button type="submit" disabled={salvando || carregando || !!erroEstudantes || !estudanteId || !podeCadastrar}>{salvando ? "Salvando..." : solicitado ? "Revisar e entregar PEA solicitado" : edicao ? "Salvar alterações" : "Salvar PEA"}</Button>
          </div>
        </fieldset>
      </form>
      <Modal open={confirmacao !== null} onClose={() => { if (!salvando) { setConfirmacao(null); setErro(""); } }} title="Confirmar entrega do PEA" busy={salvando} footer={<Button disabled={salvando} onClick={() => void confirmarEntrega()}>{salvando ? "Entregando..." : "Confirmar entrega"}</Button>}>
        <div className="space-y-4"><p><strong>{solicitacao?.estudante.nome}</strong> · {solicitacao?.contexto}</p><p>A entrega será final. O conteúdo entregue ficará preservado e não poderá ser editado ou excluído pelo cadastro comum.</p><dl className="space-y-3">{confirmacao && camposPea.map(c => <div key={c.name}><dt className="font-semibold">{c.label}</dt><dd className="whitespace-pre-wrap break-words">{confirmacao[c.name]}</dd></div>)}</dl>{erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}</div>
      </Modal>
    </div>
  );
}

export default function CadastroPeaPage() {
  const [params] = useSearchParams();
  const { usuario } = useAuth();
  let modo;
  try { modo = modoCadastroPea(params); }
  catch (error) { return <p role="alert">{error instanceof Error ? error.message : "Endereço inválido."}</p>; }
  return <FormularioPea key={`${usuario?.id}-${modo.peaId ?? "novo"}-${modo.solicitacaoId ?? "espontaneo"}`} {...modo} />;
}
