import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";

import { toastConfig } from "../../../config/toast";
import { planoAcaoService } from "../../../services/planoAcaoService";
import { estudantesService } from "../../../services/estudantesService";
import type { PlanoAcaoRequest } from "../../../types/planoAcao";
import type { EstudanteResponse } from "../../../types/estudante";
import { useAuth } from "../../../hooks/useAuth";

const camposIniciais: Omit<
  PlanoAcaoRequest,
  "estudanteId" | "coordenadorResponsavelId"
> = {
  periodoLetivo: "",
  nomeResponsavel: "",
  grauParentesco: "",
  telefoneResponsavel: "",
  emailResponsavel: "",
  possuiComorbidade: false,
  comorbidades: "",
  usaMedicacaoContinua: false,
  medicacoes: "",
  frequentaServicoApoio: false,
  servicosApoio: "",
  possuiDocumentosComprobatorios: false,
  documentosComprobatorios: "",
  necessidadesEspecificas: "",
  consideracoes: "",
  avancosDificuldadesPotencialidades: "",
  principaisDemandas: "",
  propostasIntervencao: "",
};

type CampoTexto =
  | "periodoLetivo"
  | "nomeResponsavel"
  | "grauParentesco"
  | "telefoneResponsavel"
  | "emailResponsavel"
  | "comorbidades"
  | "medicacoes"
  | "servicosApoio"
  | "documentosComprobatorios"
  | "necessidadesEspecificas"
  | "consideracoes"
  | "avancosDificuldadesPotencialidades"
  | "principaisDemandas"
  | "propostasIntervencao";

type CampoBooleano =
  | "possuiComorbidade"
  | "usaMedicacaoContinua"
  | "frequentaServicoApoio"
  | "possuiDocumentosComprobatorios";

const nomesLegiveis: Record<string, string> = {
  CEGUEIRA_TOTAL: "Cegueira total",
  VISAO_MONOCULAR: "Visão monocular",
  BAIXA_VISAO: "Baixa visão",
  SURDEZ_LINGUA_ORAL_LEITURA_LABIAL:
    "Surdez com leitura labial/oral",
  SURDEZ_USA_LIBRAS: "Surdez com uso de Libras",
  SURDEZ_SEM_LIBRAS_OU_ORALIZACAO:
    "Surdez sem Libras ou oralização",
  PERDA_AUDITIVA_PARCIAL_COM_APARELHO:
    "Perda auditiva parcial com aparelho",
  PERDA_AUDITIVA_PARCIAL: "Perda auditiva parcial",
  SURDOCEGUEIRA: "Surdocegueira",
  DEFICIENCIA_FISICA_MOBILIDADE:
    "Deficiência física relacionada à mobilidade",
  DEFICIENCIA_FISICA_ATIVIDADES_MANUAIS:
    "Deficiência física relacionada às atividades manuais",
  DEFICIENCIA_INTELECTUAL: "Deficiência intelectual",
  DEFICIENCIAS_MULTIPLAS: "Deficiências múltiplas",
  AUTISMO: "Autismo",
  ALTAS_HABILIDADES: "Altas habilidades",
  TDAH: "TDAH",
  DISLEXIA: "Dislexia",
  DIFICULDADE_APRENDIZAGEM: "Dificuldade de aprendizagem",
  OUTRA: "Outra",

  EPILEPSIA: "Epilepsia",
  ESQUIZOFRENIA: "Esquizofrenia",
  TRANSTORNO_OPOSITOR_DESAFIADOR:
    "Transtorno opositor desafiador",
  TOC: "Transtorno obsessivo-compulsivo (TOC)",
  TRANSTORNO_BIPOLAR: "Transtorno bipolar",
  ANSIEDADE: "Ansiedade",
  DEPRESSAO: "Depressão",
  BORDERLINE: "Transtorno de personalidade borderline",
  INTOLERANCIA_ALIMENTAR: "Intolerância alimentar",
  DISTURBIO_COMPORTAMENTO: "Distúrbio de comportamento",

  TRADUTOR_INTERPRETE_LIBRAS: "Tradutor/intérprete de Libras",
  CUIDADOR: "Cuidador",
  LEDOR_AUDIODESCRITOR: "Ledor/audiodescritor",
  MATERIAL_BRAILLE: "Material em Braille",
  ALFABETIZADOR_JOVENS_ADULTOS:
    "Alfabetizador de jovens e adultos",

  SALA_TERREO_AMBIENTE_ACESSIVEL:
    "Sala no térreo ou ambiente acessível",
  TODAS_DISCIPLINAS_MESMA_SALA:
    "Todas as disciplinas na mesma sala",
  BANHEIRO_ADAPTADO: "Banheiro adaptado",
};

function formatarLista(valores: string[] | null | undefined): string {
  if (!valores || valores.length === 0) {
    return "Nenhuma informação cadastrada";
  }

  return valores
    .map((valor) => nomesLegiveis[valor] ?? valor.replaceAll("_", " "))
    .join(", ");
}

function formatarData(data: string | null | undefined): string {
  if (!data) {
    return "Não informado";
  }

  const partes = data.split("-");

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return data;
}

function CampoInformacao({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor: string | null | undefined;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {rotulo}
      </p>
      <p className="break-words text-sm font-medium text-slate-800">
        {valor?.trim() || "Não informado"}
      </p>
    </div>
  );
}

export default function PlanoAcaoPage() {
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();

  const estudanteId = Number(searchParams.get("estudanteId"));

  const [formulario, setFormulario] = useState(camposIniciais);
  const [salvando, setSalvando] = useState(false);

  const [estudante, setEstudante] =
    useState<EstudanteResponse | null>(null);

  const [carregandoEstudante, setCarregandoEstudante] =
    useState(true);

  const [erroEstudante, setErroEstudante] = useState(false);

  const atualizarTexto = (campo: CampoTexto, valor: string) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const atualizarBooleano = (
    campo: CampoBooleano,
    valor: boolean,
  ) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  useEffect(() => {
    let cancelado = false;

    async function carregarEstudante() {
      setCarregandoEstudante(true);
      setErroEstudante(false);
      setEstudante(null);

      if (!Number.isInteger(estudanteId) || estudanteId <= 0) {
        setErroEstudante(true);
        setCarregandoEstudante(false);
        return;
      }

      try {
        const dados =
          await estudantesService.buscarPorId(estudanteId);

        if (cancelado) {
          return;
        }

        setEstudante(dados);

        setFormulario((anterior) => ({
          ...anterior,

          nomeResponsavel:
            anterior.nomeResponsavel || dados.nomeResponsavel || "",

          telefoneResponsavel:
            anterior.telefoneResponsavel ||
            dados.telefoneResponsavel ||
            "",

          emailResponsavel:
            anterior.emailResponsavel || dados.emailResponsavel || "",

          necessidadesEspecificas:
            anterior.necessidadesEspecificas ||
            [
              formatarLista(dados.necessidadesEspecificas),
              dados.outraNecessidadeEspecifica?.trim()
                ? `Outra necessidade: ${dados.outraNecessidadeEspecifica.trim()}`
                : "",
              dados.condicoesAssociadas?.length
                ? `Condições associadas: ${formatarLista(dados.condicoesAssociadas)}`
                : "",
              dados.outraCondicaoAssociada?.trim()
                ? `Outra condição associada: ${dados.outraCondicaoAssociada.trim()}`
                : "",
              dados.atendimentosCampus?.length
                ? `Atendimentos no campus: ${formatarLista(dados.atendimentosCampus)}`
                : "",
              dados.acessibilidadesFisicas?.length
                ? `Acessibilidades físicas: ${formatarLista(dados.acessibilidadesFisicas)}`
                : "",
              dados.outraAcessibilidadeFisica?.trim()
                ? `Outra acessibilidade física: ${dados.outraAcessibilidadeFisica.trim()}`
                : "",
              dados.descricaoOutraNecessidadeAtendimento?.trim()
                ? `Outras necessidades de atendimento: ${dados.descricaoOutraNecessidadeAtendimento.trim()}`
                : "",
            ]
              .filter(Boolean)
              .join("\n"),
        }));
      } catch {
        if (!cancelado) {
          setEstudante(null);
          setErroEstudante(true);

          void Swal.fire({
            ...toastConfig,
            icon: "error",
            title: "Não foi possível carregar os dados do estudante.",
            text: "Verifique se o estudante existe e tente novamente.",
          });
        }
      } finally {
        if (!cancelado) {
          setCarregandoEstudante(false);
        }
      }
    }

    void carregarEstudante();

    return () => {
      cancelado = true;
    };
  }, [estudanteId]);

  const enviarFormulario = async (
    evento: FormEvent<HTMLFormElement>,
  ) => {
    evento.preventDefault();

    if (!Number.isInteger(estudanteId) || estudanteId <= 0) {
      await Swal.fire(
        "Estudante não identificado",
        "Abra o formulário a partir do perfil do estudante.",
        "warning",
      );
      return;
    }

    if (carregandoEstudante) {
      await Swal.fire(
        "Aguarde",
        "Os dados do estudante ainda estão sendo carregados.",
        "info",
      );
      return;
    }

    if (!estudante || erroEstudante) {
      await Swal.fire(
        "Estudante não encontrado",
        "Não é possível cadastrar o plano sem carregar um estudante válido.",
        "warning",
      );
      return;
    }

    if (!usuario || usuario.perfil !== "COORDENADOR") {
      await Swal.fire(
        "Acesso não permitido",
        "É necessário estar autenticado como coordenador para cadastrar o plano.",
        "warning",
      );
      return;
    }

    const camposObrigatoriosGerais: {
      campo: CampoTexto;
      rotulo: string;
    }[] = [
      { campo: "periodoLetivo", rotulo: "Período letivo" },
      { campo: "nomeResponsavel", rotulo: "Nome do responsável" },
      { campo: "grauParentesco", rotulo: "Grau de parentesco" },
      { campo: "telefoneResponsavel", rotulo: "Telefone do responsável" },
      { campo: "emailResponsavel", rotulo: "E-mail do responsável" },
      {
        campo: "necessidadesEspecificas",
        rotulo: "Necessidades específicas",
      },
      { campo: "consideracoes", rotulo: "Considerações" },
      {
        campo: "avancosDificuldadesPotencialidades",
        rotulo: "Avanços, dificuldades e potencialidades",
      },
      { campo: "principaisDemandas", rotulo: "Principais demandas" },
      {
        campo: "propostasIntervencao",
        rotulo: "Propostas de intervenção",
      },
    ];

    let campoVazio = camposObrigatoriosGerais.find(
      ({ campo }) => !formulario[campo].trim(),
    );

    if (!campoVazio && formulario.possuiComorbidade && !formulario.comorbidades.trim()) {
      campoVazio = { campo: "comorbidades", rotulo: "Detalhes sobre comorbidades" };
    }
    if (!campoVazio && formulario.usaMedicacaoContinua && !formulario.medicacoes.trim()) {
      campoVazio = { campo: "medicacoes", rotulo: "Detalhes sobre medicações" };
    }
    if (!campoVazio && formulario.frequentaServicoApoio && !formulario.servicosApoio.trim()) {
      campoVazio = { campo: "servicosApoio", rotulo: "Detalhes sobre serviços de apoio" };
    }
    if (
      !campoVazio &&
      formulario.possuiDocumentosComprobatorios &&
      !formulario.documentosComprobatorios.trim()
    ) {
      campoVazio = {
        campo: "documentosComprobatorios",
        rotulo: "Detalhes sobre documentos comprobatórios",
      };
    }

    if (campoVazio) {
      await Swal.fire(
        "Preenchimento obrigatório",
        `Preencha o campo: ${campoVazio.rotulo}.`,
        "warning",
      );
      return;
    }

    setSalvando(true);

    try {
      const request: PlanoAcaoRequest = {
        ...formulario,
        estudanteId,
        coordenadorResponsavelId: usuario.perfilId,
      };

      const plano = await planoAcaoService.criar(request);

      await Swal.fire({
        title: "Plano de ação cadastrado!",
        text: `O plano de ação nº ${plano.id} foi salvo como rascunho.`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (erro) {
      const erroAxios = erro as AxiosError<{ message?: string }>;

      const mensagem =
        erroAxios.response?.data?.message ??
        "Não foi possível cadastrar o plano de ação. Verifique os dados e tente novamente.";

      await Swal.fire({
        title: "Erro ao cadastrar",
        text: mensagem,
        icon: "error",
        confirmButtonText: "Entendi",
      });
    } finally {
      setSalvando(false);
    }
  };

  const secaoClass =
    "space-y-4 rounded-xl border border-[#d9e2d9] bg-white p-5 shadow-sm sm:p-6";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const textareaClass =
    "mt-1.5 min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const renderPerguntaSimNao = (
    titulo: string,
    campo: CampoBooleano,
    valor: boolean,
    campoDetalhes: CampoTexto,
    placeholder: string,
  ) => (
    <div className="space-y-3">
      <span className={labelClass}>{titulo} *</span>

      <div className="flex flex-wrap gap-5">
        {[
          { texto: "Sim", valor: true },
          { texto: "Não", valor: false },
        ].map((opcao) => (
          <label
            key={String(opcao.valor)}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
          >
            <input
              type="radio"
              name={campo}
              checked={valor === opcao.valor}
              onChange={() => atualizarBooleano(campo, opcao.valor)}
              className="accent-emerald-700"
            />
            {opcao.texto}
          </label>
        ))}
      </div>

      <label className={labelClass}>
        Qual(is)? {valor ? "*" : ""}
        <textarea
          className={textareaClass}
          value={formulario[campoDetalhes]}
          onChange={(evento) =>
            atualizarTexto(campoDetalhes, evento.target.value)
          }
          placeholder={
            valor
              ? placeholder
              : "Se não se aplica, informe: Não se aplica."
          }
          maxLength={5000}
        />
      </label>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-primary sm:text-[28px]">
          Plano de Ação
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Confira os dados do estudante e preencha as informações do
          responsável e do planejamento de acompanhamento.
        </p>
      </header>

      {carregandoEstudante && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          role="status"
        >
          Carregando os dados do estudante...
        </div>
      )}

      {erroEstudante && !carregandoEstudante && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          Não foi possível identificar o estudante. Volte ao perfil do
          estudante e tente abrir o cadastro do Plano de Ação novamente.
        </div>
      )}

      {estudante && (
        <form onSubmit={enviarFormulario} className="space-y-6">
          <section className={secaoClass}>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                1. Identificação do estudante
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Dados carregados do cadastro existente. Essas informações
                são exibidas para consulta e não são editadas neste formulário.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <CampoInformacao
                rotulo="Nome do estudante"
                valor={estudante.nomeCompleto}
              />

              <CampoInformacao
                rotulo="Matrícula"
                valor={estudante.matricula}
              />

              <CampoInformacao
                rotulo="Curso"
                valor={estudante.curso}
              />

              <CampoInformacao
                rotulo="Período de ingresso"
                valor={estudante.periodoIngresso}
              />

              <CampoInformacao
                rotulo="Data de nascimento"
                valor={formatarData(estudante.dataNascimento)}
              />

              <CampoInformacao
                rotulo="Telefone"
                valor={estudante.telefone}
              />

              <CampoInformacao
                rotulo="E-mail"
                valor={estudante.email}
              />
            </div>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              2. Identificação do plano
            </h2>

            <label className={labelClass}>
              Período letivo *
              <input
                className={inputClass}
                value={formulario.periodoLetivo}
                onChange={(evento) =>
                  atualizarTexto("periodoLetivo", evento.target.value)
                }
                placeholder="Ex.: 2026.1"
                required
                maxLength={20}
              />
            </label>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              3. Dados do responsável
            </h2>

            <p className="text-sm text-slate-500">
              Os valores disponíveis no cadastro do estudante foram
              utilizados como preenchimento inicial. Você pode ajustá-los
              para este plano.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nome completo *
                <input
                  className={inputClass}
                  value={formulario.nomeResponsavel}
                  onChange={(evento) =>
                    atualizarTexto("nomeResponsavel", evento.target.value)
                  }
                  required
                  maxLength={255}
                />
              </label>

              <label className={labelClass}>
                Grau de parentesco *
                <input
                  className={inputClass}
                  value={formulario.grauParentesco}
                  onChange={(evento) =>
                    atualizarTexto("grauParentesco", evento.target.value)
                  }
                  placeholder="Ex.: Mãe, pai, avó ou tutor"
                  required
                  maxLength={255}
                />
              </label>

              <label className={labelClass}>
                Telefone *
                <input
                  type="tel"
                  className={inputClass}
                  value={formulario.telefoneResponsavel}
                  onChange={(evento) =>
                    atualizarTexto(
                      "telefoneResponsavel",
                      evento.target.value,
                    )
                  }
                  required
                  maxLength={255}
                />
              </label>

              <label className={labelClass}>
                E-mail *
                <input
                  type="email"
                  className={inputClass}
                  value={formulario.emailResponsavel}
                  onChange={(evento) =>
                    atualizarTexto("emailResponsavel", evento.target.value)
                  }
                  required
                  maxLength={255}
                />
              </label>
            </div>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              4. Informações complementares
            </h2>

            <div className="space-y-6">
              {renderPerguntaSimNao(
                "Há comorbidade relevante?",
                "possuiComorbidade",
                formulario.possuiComorbidade,
                "comorbidades",
                "Descreva as comorbidades relevantes.",
              )}

              {renderPerguntaSimNao(
                "Faz uso de medicação de uso contínuo?",
                "usaMedicacaoContinua",
                formulario.usaMedicacaoContinua,
                "medicacoes",
                "Informe as medicações de uso contínuo.",
              )}

              {renderPerguntaSimNao(
                "Frequenta serviços de apoio (FUNAD, APAE etc.)?",
                "frequentaServicoApoio",
                formulario.frequentaServicoApoio,
                "servicosApoio",
                "Informe os serviços de apoio frequentados.",
              )}

              {renderPerguntaSimNao(
                "Apresentou documentos comprobatórios?",
                "possuiDocumentosComprobatorios",
                formulario.possuiDocumentosComprobatorios,
                "documentosComprobatorios",
                "Descreva os documentos apresentados.",
              )}
            </div>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              5. Identificação das necessidades específicas
            </h2>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Informações já registradas no estudante
              </h3>

              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">
                    Necessidades específicas:{" "}
                  </span>
                  {formatarLista(estudante.necessidadesEspecificas)}
                </p>

                {estudante.outraNecessidadeEspecifica && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Outra necessidade:{" "}
                    </span>
                    {estudante.outraNecessidadeEspecifica}
                  </p>
                )}

                <p>
                  <span className="font-medium text-slate-800">
                    Condições associadas:{" "}
                  </span>
                  {formatarLista(estudante.condicoesAssociadas)}
                </p>

                {estudante.outraCondicaoAssociada && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Outra condição associada:{" "}
                    </span>
                    {estudante.outraCondicaoAssociada}
                  </p>
                )}

                <p>
                  <span className="font-medium text-slate-800">
                    Atendimentos no campus:{" "}
                  </span>
                  {formatarLista(estudante.atendimentosCampus)}
                </p>

                <p>
                  <span className="font-medium text-slate-800">
                    Acessibilidades físicas:{" "}
                  </span>
                  {formatarLista(estudante.acessibilidadesFisicas)}
                </p>

                {estudante.outraAcessibilidadeFisica && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Outra acessibilidade:{" "}
                    </span>
                    {estudante.outraAcessibilidadeFisica}
                  </p>
                )}

                {estudante.descricaoOutraNecessidadeAtendimento && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Outras necessidades de atendimento:{" "}
                    </span>
                    {estudante.descricaoOutraNecessidadeAtendimento}
                  </p>
                )}
              </div>
            </div>

            <label className={labelClass}>
              Identificação e descrição das necessidades específicas *
              <textarea
                className={textareaClass}
                value={formulario.necessidadesEspecificas}
                onChange={(evento) =>
                  atualizarTexto(
                    "necessidadesEspecificas",
                    evento.target.value,
                  )
                }
                required
                maxLength={5000}
                placeholder="Descreva as necessidades específicas e os aspectos relevantes para o acompanhamento."
              />
            </label>

            <p className="text-xs text-slate-500">
              As informações do cadastro são uma referência inicial. Revise
              e complemente o texto antes de salvar o plano.
            </p>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              6. Considerações
            </h2>

            <p className="text-sm text-slate-500">
              Considere diagnósticos e encaminhamentos anteriores,
              autonomia no contexto familiar e escolar, serviços de apoio
              frequentados e aspectos psicossociais relevantes.
            </p>

            <label className={labelClass}>
              Considerações *
              <textarea
                className={textareaClass}
                value={formulario.consideracoes}
                onChange={(evento) =>
                  atualizarTexto("consideracoes", evento.target.value)
                }
                required
                maxLength={5000}
                placeholder="Registre observações relevantes."
              />
            </label>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              7. Avanços, dificuldades e potencialidades
            </h2>

            <p className="text-sm text-slate-500">
              Registre objetivos já atingidos, disciplinas em que o estudante
              apresenta facilidade, experiências positivas e demais aspectos
              de seu percurso educacional.
            </p>

            <label className={labelClass}>
              Relato sistematizado *
              <textarea
                className={textareaClass}
                value={formulario.avancosDificuldadesPotencialidades}
                onChange={(evento) =>
                  atualizarTexto(
                    "avancosDificuldadesPotencialidades",
                    evento.target.value,
                  )
                }
                required
                maxLength={5000}
                placeholder="Registre avanços, dificuldades e potencialidades."
              />
            </label>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              8. Principais demandas identificadas
            </h2>

            <p className="text-sm text-slate-500">
              Considere implicações das necessidades específicas na
              aprendizagem, dificuldades encontradas, adaptações anteriores
              e experiências negativas no ensino.
            </p>

            <label className={labelClass}>
              Principais demandas *
              <textarea
                className={textareaClass}
                value={formulario.principaisDemandas}
                onChange={(evento) =>
                  atualizarTexto("principaisDemandas", evento.target.value)
                }
                required
                maxLength={5000}
                placeholder="Descreva as principais demandas identificadas."
              />
            </label>
          </section>

          <section className={secaoClass}>
            <h2 className="text-lg font-semibold text-slate-900">
              9. Propostas iniciais de intervenção
            </h2>

            <p className="text-sm text-slate-500">
              Descreva adaptações de acessibilidade e aprendizagem,
              atendimentos, monitoria, apoios complementares, profissionais
              envolvidos, modalidade, local e frequência.
            </p>

            <label className={labelClass}>
              Propostas de intervenção *
              <textarea
                className={textareaClass}
                value={formulario.propostasIntervencao}
                onChange={(evento) =>
                  atualizarTexto("propostasIntervencao", evento.target.value)
                }
                required
                maxLength={5000}
                placeholder="Descreva as estratégias e ações propostas."
              />
            </label>
          </section>

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={salvando}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={salvando || carregandoEstudante || erroEstudante}
              className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Cadastrar plano de ação"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}