import StudentFlow from "./components/StudentFlow";
import Button from "../../../components/common/Button";
import StudentExport from "./components/StudentExport";
import { fluxoEstudanteService } from "../../../services/fluxoEstudanteService";
import { mensagemErro } from "../../../services/apiError";
import { cursosInstitucionais } from "../../../config/profissionais";
import { necessidades, condicoes, atendimentos, acessibilidades } from "../../../config/estudanteFormOptions";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Swal from "sweetalert2";
import { toastConfig } from "../../../config/toast";
import { useAuth } from "../../../hooks/useAuth";
import { accessProfiles, canAccess } from "../../../config/access";
import { alertaFluxo, oferecerEncaminhamento, encaminharEtapa } from "../../../services/fluxoEstudanteAlerts";
import { pendenciasAnamnese } from "../../../services/fluxoEstudanteValidation";
import { confirmarCadastroEstudante, confirmarConclusaoAnamnese } from "../../../services/estudanteConfirmation";
import { estudantesService } from "../../../services/estudantesService";
import type {
  EstudanteRequest,
  EstudanteResponse,
} from "../../../types/estudante";

const formularioVazio: EstudanteRequest = {
  nomeCompleto: "",
  dataNascimento: "",
  curso: "",
  matricula: "",
  periodoIngresso: "",
  telefone: "",
  email: "",
  nomeResponsavel: "",
  telefoneResponsavel: "",
  emailResponsavel: "",
  possuiNecessidadeEspecifica: null,
  necessidadesEspecificas: [],
  outraNecessidadeEspecifica: "",
  condicoesAssociadas: [],
  outraCondicaoAssociada: "",
  atendimentosCampus: [],
  acessibilidadesFisicas: [],
  outraAcessibilidadeFisica: "",
  possuiOutraNecessidadeAtendimento: null,
  descricaoOutraNecessidadeAtendimento: "",
};

function converterParaFormulario(
  estudante: EstudanteResponse
): EstudanteRequest {
  return {
    nomeCompleto: estudante.nomeCompleto ?? "",
    dataNascimento: estudante.dataNascimento ?? "",
    curso: estudante.curso ?? "",
    matricula: estudante.matricula ?? "",
    periodoIngresso: estudante.periodoIngresso ?? "",
    telefone: estudante.telefone ?? "",
    email: estudante.email ?? "",
    nomeResponsavel: estudante.nomeResponsavel ?? "",
    telefoneResponsavel: estudante.telefoneResponsavel ?? "",
    emailResponsavel: estudante.emailResponsavel ?? "",
    possuiNecessidadeEspecifica: estudante.possuiNecessidadeEspecifica ?? null,
    necessidadesEspecificas: estudante.necessidadesEspecificas ?? [],
    outraNecessidadeEspecifica: estudante.outraNecessidadeEspecifica ?? "",
    condicoesAssociadas: estudante.condicoesAssociadas ?? [],
    outraCondicaoAssociada: estudante.outraCondicaoAssociada ?? "",
    atendimentosCampus: estudante.atendimentosCampus ?? [],
    acessibilidadesFisicas: estudante.acessibilidadesFisicas ?? [],
    outraAcessibilidadeFisica: estudante.outraAcessibilidadeFisica ?? "",
    possuiOutraNecessidadeAtendimento:
      estudante.possuiOutraNecessidadeAtendimento ?? null,
    descricaoOutraNecessidadeAtendimento:
      estudante.descricaoOutraNecessidadeAtendimento ?? "",
  };
}

type CampoTextoProps = {
  label: string;
  name: keyof EstudanteRequest;
  value: string;
  onChange: (name: keyof EstudanteRequest, value: string) => void;
  required?: boolean;
  type?: string;
  maxLength?: number;
};

function CampoTexto({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  maxLength,
}: CampoTextoProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required ? " *" : ""}
      </span>
      <input
        type={type}
        name={String(name)}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required={required}
        maxLength={maxLength}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

type Opcao = { value: string; label: string };

type CampoOpcoesProps = {
  titulo: string;
  opcoes: readonly Opcao[];
  selecionadas: string[];
  onChange: (value: string, checked: boolean) => void;
};

function CampoOpcoes({
  titulo,
  opcoes,
  selecionadas,
  onChange,
}: CampoOpcoesProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-slate-800">
        {titulo}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {opcoes.map((opcao) => (
          <label
            key={opcao.value}
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selecionadas.includes(opcao.value)}
              onChange={(event) =>
                onChange(opcao.value, event.target.checked)
              }
              className="mt-0.5 accent-emerald-700"
            />
            <span>{opcao.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type SimNaoProps = {
  titulo: string;
  valor: boolean | null;
  onChange: (valor: boolean | null) => void;
};

function CampoSimNao({ titulo, valor, onChange }: SimNaoProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-slate-800">
        {titulo}
      </legend>
      <div className="flex flex-wrap gap-5">
        {[
          { label: "Sim", value: true },
          { label: "Não", value: false },
          { label: "Não informado", value: null },
        ].map((opcao) => (
          <label key={opcao.label} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={titulo}
              checked={valor === opcao.value}
              onChange={() => onChange(opcao.value)}
              className="accent-emerald-700"
            />
            {opcao.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function AnamnesePage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const basePath = accessProfiles[usuario?.perfil ?? "COORDENADOR"].basePath;
  const podeAtribuir = !!usuario && ["COORDENADOR", "ADMINISTRADOR"].includes(usuario.perfil) && canAccess(usuario, "estudantes.vincular");
  const envioPendente = useRef(false);
  const necessidadeRef = useRef<HTMLDivElement>(null);
  const [tentouConcluir, setTentouConcluir] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [searchParams] = useSearchParams();
  const estudanteId = searchParams.get("estudanteId");
  const modoEdicao = estudanteId !== null;
  const [concluir, setConcluir] = useState(false);
  const [podePreencher, setPodePreencher] = useState(usuario?.perfil === "COORDENADOR" || usuario?.perfil === "ADMINISTRADOR");

  const [formulario, setFormulario] =
    useState<EstudanteRequest>(formularioVazio);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [estudanteCarregado, setEstudanteCarregado] = useState(!modoEdicao);
  const [fluxoDisponivel, setFluxoDisponivel] = useState(!modoEdicao);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    async function carregarEstudante() {
      if (!modoEdicao || estudanteId === null) { setFormulario(formularioVazio); setSomenteLeitura(false); setEstudanteCarregado(true); setFluxoDisponivel(true); setPodePreencher(usuario?.perfil === "COORDENADOR" || usuario?.perfil === "ADMINISTRADOR"); setCarregando(false); return; }
      const id = Number(estudanteId);
      if (!Number.isInteger(id) || id <= 0) { setErro("O identificador do estudante é inválido."); setEstudanteCarregado(false); setCarregando(false); return; }
      setCarregando(true); setErro("");
      try {
        const [cadastro, acompanhamento] = await Promise.allSettled([estudantesService.buscarPorId(id), fluxoEstudanteService.consultar(id)]);
        if (!ativo) return;
        if (cadastro.status === "rejected") throw cadastro.reason;
        const estudante = cadastro.value;
        setFormulario(converterParaFormulario(estudante)); setSomenteLeitura(estudante.concluido); setEstudanteCarregado(true);
        setFluxoDisponivel(acompanhamento.status === "fulfilled");
        const gestao = usuario?.perfil === "COORDENADOR" || usuario?.perfil === "ADMINISTRADOR";
        if (acompanhamento.status === "fulfilled") {
          setConcluir(acompanhamento.value.anamneseStatus === "CONCLUIDA");
          setPodePreencher(gestao || acompanhamento.value.responsaveis.ANAMNESE?.usuarioId === usuario?.id);
        } else { setPodePreencher(gestao); }
      } catch (error) { if (ativo) { setErro(`Não foi possível carregar o cadastro. ${mensagemErro(error)}`); setEstudanteCarregado(false); setFluxoDisponivel(false); } }
      finally { if (ativo) setCarregando(false); }
    }
    void carregarEstudante();
    return () => { ativo = false; };
  }, [estudanteId, modoEdicao, usuario?.id, usuario?.perfil, tentativa]);
  function alterarCampo(
    nome: keyof EstudanteRequest,
    valor: string
  ) {
    setFormulario((atual) => ({ ...atual, [nome]: valor }));
  }

  function alternarOpcao(
    campo:
      | "necessidadesEspecificas"
      | "condicoesAssociadas"
      | "atendimentosCampus"
      | "acessibilidadesFisicas",
    valor: string,
    selecionado: boolean
  ) {
    setFormulario((atual) => {
      const listaAtual = atual[campo] as string[];
      const novaLista = selecionado
        ? [...listaAtual, valor]
        : listaAtual.filter((item) => item !== valor);

      return { ...atual, [campo]: novaLista };
    });
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const elementoFormulario = event.currentTarget;
    const formularioValido = elementoFormulario.checkValidity();
    if (envioPendente.current || carregando || somenteLeitura || !podePreencher || !estudanteCarregado || !fluxoDisponivel) return;
    setErro("");
    setSucesso("");

    if (formulario.dataNascimento >= new Date().toLocaleDateString("en-CA")) {
      setErro("A data de nascimento deve ser anterior à data de hoje.");
      return;
    }

    envioPendente.current = true;
    setSalvando(true);
    const continuar = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "continuar";
    let idSalvo = Number(estudanteId);

    try {
      const pendencias = concluir || continuar ? pendenciasAnamnese(formulario) : [];
      const delegar = pendencias.length > 0 && await oferecerEncaminhamento(pendencias, podeAtribuir);
      if (pendencias.length && !delegar) { setTentouConcluir(true); return; }
      // A API exige a identificação básica antes de criar ou atualizar o cadastro.
      if (!formularioValido) {
        await alertaFluxo({ titleText: "Confira os dados de identificação", text: "Preencha nome, data de nascimento, curso, matrícula e período de ingresso, e corrija os campos inválidos. Esses dados identificam o cadastro antes de salvar e encaminhar as demais pendências.", icon: "warning" });
        return;
      }
      const concluirEtapa = (concluir || continuar) && !delegar;
      const confirmado = delegar || (concluirEtapa
        ? await confirmarConclusaoAnamnese(formulario.nomeCompleto)
        : await confirmarCadastroEstudante(modoEdicao ? "editar" : "salvar", formulario.nomeCompleto));
      if (!confirmado) return;
      const request: EstudanteRequest = {
        ...formulario,
        outraNecessidadeEspecifica:
          formulario.necessidadesEspecificas.includes("OUTRA")
            ? formulario.outraNecessidadeEspecifica
            : "",
        outraCondicaoAssociada:
          formulario.condicoesAssociadas.includes("OUTRA")
            ? formulario.outraCondicaoAssociada
            : "",
        outraAcessibilidadeFisica:
          formulario.acessibilidadesFisicas.includes("OUTRA")
            ? formulario.outraAcessibilidadeFisica
            : "",
        descricaoOutraNecessidadeAtendimento:
          formulario.possuiOutraNecessidadeAtendimento === true
            ? formulario.descricaoOutraNecessidadeAtendimento
            : "",
      };

      if (modoEdicao && estudanteId !== null) {
        await fluxoEstudanteService.salvarAnamnese(Number(estudanteId), request, concluirEtapa);
        if (delegar) { setConcluir(false); if (await encaminharEtapa(idSalvo, "ANAMNESE", basePath)) { setTentativa(v => v + 1); if (continuar) navigate(`${basePath}/plano-acao?estudanteId=${idSalvo}`); } return; }

        setSucesso(concluirEtapa ? "Anamnese concluída e vinculada ao estudante." : "Rascunho da anamnese salvo. Você pode continuar depois.");

        void Swal.fire({
          ...toastConfig,
          icon: "success",
          title: concluirEtapa ? "Anamnese concluída!" : "Rascunho da anamnese salvo!",
        });
      } else {
        const estudanteSalvo = await estudantesService.cadastrar({ ...request, anamneseConcluida: concluirEtapa });
        idSalvo = estudanteSalvo.id;
        if (delegar) { setConcluir(false); const encaminhado = await encaminharEtapa(idSalvo, "ANAMNESE", basePath); navigate(encaminhado && continuar ? `${basePath}/plano-acao?estudanteId=${idSalvo}` : `${basePath}/anamnese?estudanteId=${idSalvo}`, { replace: true }); return; }
        if (!continuar) navigate(`${basePath}/anamnese?estudanteId=${estudanteSalvo.id}`, { replace: true });

        setSucesso("Estudante cadastrado com sucesso.");

        void Swal.fire({
          ...toastConfig,
          icon: "success",
          title: "Estudante cadastrado com sucesso!",
        });


      }
      if (continuar) navigate(`${basePath}/plano-acao?estudanteId=${idSalvo}`);
    } catch (error) {
      setErro(mensagemErro(error));

      void Swal.fire({
        ...toastConfig,
        icon: "error",
        title: "Não foi possível salvar o estudante.",
        text: mensagemErro(error),
      });
    } finally {
      envioPendente.current = false;
      setSalvando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-primary sm:text-[28px]">
          Anamnese e cadastro inicial
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {modoEdicao
            ? "Consulte e atualize as informações do estudante."
            : "Preencha as informações para cadastrar um novo estudante."}
        </p>
      </header>

      <StudentFlow key={`${estudanteId}-${sucesso}-${tentativa}`} estudanteId={modoEdicao ? Number(estudanteId) : undefined} atual="anamnese" somenteLeitura={somenteLeitura} onRetry={() => setTentativa(v => v + 1)} />
      {modoEdicao && estudanteCarregado && !carregando && <StudentExport estudanteId={Number(estudanteId)} tipo="anamnese" />}
      {erro && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {erro}
          <Button variant="secondary" className="ml-3" disabled={carregando} onClick={() => setTentativa(v => v + 1)}>Tentar novamente</Button>
        </div>
      )}

      {sucesso && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {sucesso}
        </div>
      )}

      {carregando && <p role="status" className="text-sm text-slate-500">Carregando os dados do estudante...</p>}
      {estudanteCarregado && fluxoDisponivel && !podePreencher && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">A coordenação precisa atribuir esta etapa à sua conta para permitir o preenchimento.</p>}
      {estudanteCarregado && somenteLeitura && <p role="status" className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">Este cadastro está disponível somente para consulta. Estudantes concluídos não podem ser alterados.</p>}
      {estudanteCarregado && <form
        onSubmit={salvar}
        className="space-y-6"
      >
        <fieldset disabled={carregando || salvando || somenteLeitura || !podePreencher || !fluxoDisponivel} className="min-w-0 space-y-6">
        <section className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            1. Identificação do estudante
          </h2>
          <p className="text-sm text-slate-500">Os campos com * são obrigatórios.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CampoTexto
                label="Nome completo"
                name="nomeCompleto"
                value={formulario.nomeCompleto}
                onChange={alterarCampo}
                required
                maxLength={150}
              />
            </div>
            <CampoTexto
              label="Data de nascimento"
              name="dataNascimento"
              type="date"
              value={formulario.dataNascimento}
              onChange={alterarCampo}
              required
            />
            <CampoTexto
              label="Matrícula"
              name="matricula"
              value={formulario.matricula}
              onChange={alterarCampo}
              required
              maxLength={30}
            />
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">Curso *
              <select name="curso" value={formulario.curso} onChange={event => setFormulario(atual => ({ ...atual, curso: event.target.value }))} required className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-green-100">
                <option value="">Selecione o curso</option>
                {formulario.curso && !cursosInstitucionais.includes(formulario.curso) && <option value={formulario.curso}>{formulario.curso} (cadastro atual)</option>}
                {cursosInstitucionais.map(curso => <option key={curso} value={curso}>{curso}</option>)}
              </select>
            </label>
            <CampoTexto
              label="Período de ingresso"
              name="periodoIngresso"
              value={formulario.periodoIngresso}
              onChange={alterarCampo}
              required
              maxLength={20}
            />
            <CampoTexto
              label="Telefone"
              name="telefone"
              value={formulario.telefone}
              onChange={alterarCampo}
              maxLength={20}
            />
            <CampoTexto
              label="E-mail"
              name="email"
              type="email"
              value={formulario.email}
              onChange={alterarCampo}
              maxLength={150}
            />
          </div>
        </section>

        <section className="space-y-5 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            2. Informações sobre necessidades específicas
          </h2>

          <div ref={necessidadeRef} className={tentouConcluir && concluir && formulario.possuiNecessidadeEspecifica === null ? "rounded-xl border border-red-300 bg-red-50 p-4" : undefined}>
          <CampoSimNao
            titulo="O estudante possui necessidade específica?"
            valor={formulario.possuiNecessidadeEspecifica}
            onChange={(valor) =>
              setFormulario((atual) => ({
                ...atual,
                possuiNecessidadeEspecifica: valor,
                ...(valor === false
                  ? {
                      necessidadesEspecificas: [],
                      outraNecessidadeEspecifica: "",
                    }
                  : {}),
              }))
            }
          />
          <p className="mt-2 text-xs text-slate-500">Responda Sim ou Não para concluir a anamnese. “Não informado” permite salvar como rascunho.</p>
          {tentouConcluir && concluir && formulario.possuiNecessidadeEspecifica === null && <p role="alert" className="mt-3 text-sm font-semibold text-red-800">Para concluir a anamnese, responda Sim ou Não nesta pergunta. Se ainda não souber, desmarque “Marcar anamnese como concluída” e salve como rascunho.</p>}
          </div>

          {formulario.possuiNecessidadeEspecifica !== false && (
            <>
              <CampoOpcoes
                titulo="Selecione as necessidades específicas aplicáveis"
                opcoes={necessidades}
                selecionadas={formulario.necessidadesEspecificas}
                onChange={(valor, checked) =>
                  alternarOpcao("necessidadesEspecificas", valor, checked)
                }
              />

              {formulario.necessidadesEspecificas.includes("OUTRA") && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Descreva a outra necessidade
                  </span>
                  <textarea
                    value={formulario.outraNecessidadeEspecifica ?? ""}
                    onChange={(event) =>
                      alterarCampo("outraNecessidadeEspecifica", event.target.value)
                    }
                    maxLength={500}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              )}
            </>
          )}
        </section>

        <section className="space-y-5 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            3. Condições associadas
          </h2>

          <CampoOpcoes
            titulo="Selecione as condições associadas, se houver"
            opcoes={condicoes}
            selecionadas={formulario.condicoesAssociadas}
            onChange={(valor, checked) =>
              alternarOpcao("condicoesAssociadas", valor, checked)
            }
          />

          {formulario.condicoesAssociadas.includes("OUTRA") && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Descreva a outra condição
              </span>
              <textarea
                value={formulario.outraCondicaoAssociada ?? ""}
                onChange={(event) =>
                  alterarCampo("outraCondicaoAssociada", event.target.value)
                }
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            4. Atendimentos necessários no campus
          </h2>

          <CampoOpcoes
            titulo="Selecione os atendimentos necessários"
            opcoes={atendimentos}
            selecionadas={formulario.atendimentosCampus}
            onChange={(valor, checked) =>
              alternarOpcao("atendimentosCampus", valor, checked)
            }
          />

          <CampoSimNao
            titulo="O estudante necessita de outro atendimento?"
            valor={formulario.possuiOutraNecessidadeAtendimento}
            onChange={(valor) =>
              setFormulario((atual) => ({
                ...atual,
                possuiOutraNecessidadeAtendimento: valor,
                ...(valor !== true
                  ? { descricaoOutraNecessidadeAtendimento: "" }
                  : {}),
              }))
            }
          />

          {formulario.possuiOutraNecessidadeAtendimento === true && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Descreva o atendimento necessário
              </span>
              <textarea
                value={formulario.descricaoOutraNecessidadeAtendimento ?? ""}
                onChange={(event) =>
                  alterarCampo(
                    "descricaoOutraNecessidadeAtendimento",
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            5. Acessibilidade física
          </h2>

          <CampoOpcoes
            titulo="Selecione os recursos de acessibilidade necessários"
            opcoes={acessibilidades}
            selecionadas={formulario.acessibilidadesFisicas}
            onChange={(valor, checked) =>
              alternarOpcao("acessibilidadesFisicas", valor, checked)
            }
          />

          {formulario.acessibilidadesFisicas.includes("OUTRA") && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Descreva a outra necessidade de acessibilidade física
              </span>
              <textarea
                value={formulario.outraAcessibilidadeFisica ?? ""}
                onChange={(event) =>
                  alterarCampo("outraAcessibilidadeFisica", event.target.value)
                }
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            6. Dados do responsável
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto
              label="Nome do responsável"
              name="nomeResponsavel"
              value={formulario.nomeResponsavel}
              onChange={alterarCampo}
              maxLength={150}
            />
            <CampoTexto
              label="Telefone do responsável"
              name="telefoneResponsavel"
              value={formulario.telefoneResponsavel}
              onChange={alterarCampo}
              maxLength={20}
            />
            <div className="sm:col-span-2">
              <CampoTexto
                label="E-mail do responsável"
                name="emailResponsavel"
                type="email"
                value={formulario.emailResponsavel}
                onChange={alterarCampo}
                maxLength={150}
              />
            </div>
          </div>
        </section>

        </fieldset>
        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/estudantes`)}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Voltar para estudantes
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={concluir} onChange={e => setConcluir(e.target.checked)} disabled={salvando || somenteLeitura || !podePreencher} className="accent-green-700" /> Marcar anamnese como concluída</label>
            <Button type="submit" formNoValidate={concluir} disabled={salvando || carregando || somenteLeitura || !podePreencher || !fluxoDisponivel}>{salvando ? "Salvando..." : concluir ? "Concluir anamnese" : "Salvar para continuar depois"}</Button>
            <Button type="submit" formNoValidate variant="secondary" name="acao" value="continuar" disabled={salvando || carregando || somenteLeitura || !podePreencher || !fluxoDisponivel}>Concluir e ir para plano de ação →</Button>
          </div>
        </div>
      </form>}
    </main>
  );
}
