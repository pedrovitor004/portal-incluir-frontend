import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Swal from "sweetalert2";
import { toastConfig } from "../../../config/toast";
import { routes } from "../../../config/routes";
import { estudantesService } from "../../../services/estudantesService";
import type {
  EstudanteRequest,
  EstudanteResponse,
  TipoNecessidadeEspecifica,
  TipoCondicaoAssociada,
  TipoAtendimentoCampus,
  TipoAcessibilidadeFisica,
} from "../../../types/estudante";

const necessidades: { value: TipoNecessidadeEspecifica; label: string }[] = [
  { value: "CEGUEIRA_TOTAL", label: "Cegueira total" },
  { value: "VISAO_MONOCULAR", label: "Visão monocular" },
  { value: "BAIXA_VISAO", label: "Baixa visão" },
  { value: "SURDEZ_LINGUA_ORAL_LEITURA_LABIAL", label: "Surdez com leitura labial/oral" },
  { value: "SURDEZ_USA_LIBRAS", label: "Surdez com uso de Libras" },
  { value: "SURDEZ_SEM_LIBRAS_OU_ORALIZACAO", label: "Surdez sem Libras ou oralização" },
  { value: "PERDA_AUDITIVA_PARCIAL_COM_APARELHO", label: "Perda auditiva parcial com aparelho" },
  { value: "PERDA_AUDITIVA_PARCIAL", label: "Perda auditiva parcial" },
  { value: "SURDOCEGUEIRA", label: "Surdocegueira" },
  { value: "DEFICIENCIA_FISICA_MOBILIDADE", label: "Deficiência física - mobilidade" },
  { value: "DEFICIENCIA_FISICA_ATIVIDADES_MANUAIS", label: "Deficiência física - atividades manuais" },
  { value: "DEFICIENCIA_INTELECTUAL", label: "Deficiência intelectual" },
  { value: "DEFICIENCIAS_MULTIPLAS", label: "Deficiências múltiplas" },
  { value: "AUTISMO", label: "Autismo" },
  { value: "ALTAS_HABILIDADES", label: "Altas habilidades" },
  { value: "TDAH", label: "TDAH" },
  { value: "DISLEXIA", label: "Dislexia" },
  { value: "DIFICULDADE_APRENDIZAGEM", label: "Dificuldade de aprendizagem" },
  { value: "OUTRA", label: "Outra necessidade" },
];

const condicoes: { value: TipoCondicaoAssociada; label: string }[] = [
  { value: "EPILEPSIA", label: "Epilepsia" },
  { value: "ESQUIZOFRENIA", label: "Esquizofrenia" },
  { value: "TRANSTORNO_OPOSITOR_DESAFIADOR", label: "Transtorno opositor desafiador" },
  { value: "TOC", label: "Transtorno obsessivo-compulsivo (TOC)" },
  { value: "TRANSTORNO_BIPOLAR", label: "Transtorno bipolar" },
  { value: "ANSIEDADE", label: "Ansiedade" },
  { value: "DEPRESSAO", label: "Depressão" },
  { value: "BORDERLINE", label: "Transtorno de personalidade borderline" },
  { value: "INTOLERANCIA_ALIMENTAR", label: "Intolerância alimentar" },
  { value: "DISTURBIO_COMPORTAMENTO", label: "Distúrbio de comportamento" },
  { value: "OUTRA", label: "Outra condição" },
];

const atendimentos: { value: TipoAtendimentoCampus; label: string }[] = [
  { value: "TRADUTOR_INTERPRETE_LIBRAS", label: "Tradutor/intérprete de Libras" },
  { value: "CUIDADOR", label: "Cuidador" },
  { value: "LEDOR_AUDIODESCRITOR", label: "Ledor/audiodescritor" },
  { value: "MATERIAL_BRAILLE", label: "Material em Braille" },
  { value: "ALFABETIZADOR_JOVENS_ADULTOS", label: "Alfabetizador de jovens e adultos" },
];

const acessibilidades: { value: TipoAcessibilidadeFisica; label: string }[] = [
  { value: "SALA_TERREO_AMBIENTE_ACESSIVEL", label: "Sala no térreo ou ambiente acessível" },
  { value: "TODAS_DISCIPLINAS_MESMA_SALA", label: "Todas as disciplinas na mesma sala" },
  { value: "BANHEIRO_ADAPTADO", label: "Banheiro adaptado" },
  { value: "OUTRA", label: "Outra acessibilidade física" },
];

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
  const [searchParams] = useSearchParams();
  const estudanteId = searchParams.get("estudanteId");
  const modoEdicao = estudanteId !== null;

  const [formulario, setFormulario] =
    useState<EstudanteRequest>(formularioVazio);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!modoEdicao || estudanteId === null) {
      setFormulario(formularioVazio);
      setCarregando(false);
      return;
    }

    const id = Number(estudanteId);

    if (!Number.isInteger(id) || id <= 0) {
      setErro("O identificador do estudante é inválido.");
      setCarregando(false);
      return;
    }

    let ativo = true;

    async function carregarEstudante() {
      setCarregando(true);
      setErro("");

      try {
        const estudante = await estudantesService.buscarPorId(id);

        if (ativo) {
          setFormulario(converterParaFormulario(estudante));
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar o estudante. Verifique a conexão e tente novamente.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarEstudante();

    return () => {
      ativo = false;
    };
  }, [estudanteId, modoEdicao]);

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
    setErro("");
    setSucesso("");

    if (formulario.dataNascimento >= new Date().toLocaleDateString("en-CA")) {
      setErro("A data de nascimento deve ser anterior à data de hoje.");
      return;
    }

    setSalvando(true);

    try {
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
        await estudantesService.atualizar(Number(estudanteId), request);

        setSucesso("Estudante atualizado com sucesso.");

        void Swal.fire({
          ...toastConfig,
          icon: "success",
          title: "Estudante atualizado com sucesso!",
        });
      } else {
        await estudantesService.cadastrar(request);

        setSucesso("Estudante cadastrado com sucesso.");

        void Swal.fire({
          ...toastConfig,
          icon: "success",
          title: "Estudante cadastrado com sucesso!",
        });

        setFormulario(formularioVazio);
      }
    } catch {
      setErro(
        "Não foi possível salvar o estudante. Confira os dados e tente novamente.",
      );

      void Swal.fire({
        ...toastConfig,
        icon: "error",
        title: "Não foi possível salvar o estudante.",
        text: "Confira os dados e tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-primary sm:text-[28px]">
          Anamnese do estudante
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {modoEdicao
            ? "Consulte e atualize as informações do estudante."
            : "Preencha as informações para cadastrar um novo estudante."}
        </p>
      </header>

      {erro && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {erro}
        </div>
      )}

      {sucesso && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {sucesso}
        </div>
      )}

      <form
        onSubmit={salvar}
        className="space-y-6"
      >
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
            <CampoTexto
              label="Curso"
              name="curso"
              value={formulario.curso}
              onChange={alterarCampo}
              required
              maxLength={150}
            />
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

        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(routes.estudantesCoordenador)}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Voltar para estudantes
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando
              ? "Salvando..."
              : modoEdicao
                ? "Salvar alterações"
                : "Cadastrar estudante"}
          </button>
        </div>
      </form>
    </main>
  );
}
