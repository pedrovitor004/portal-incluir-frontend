import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { estudantesService } from "../../../services/estudantesService";
import type { EstudanteResponse } from "../../../types/estudante";
import { routes } from "../../../config/routes";

type AbaPerfil =
  | "plano"
  | "dados"
  | "diagnostico"
  | "adaptacoes"
  | "historico"
  | "documentos";

const abas: { id: AbaPerfil; label: string }[] = [
  { id: "plano", label: "Plano de ação" },
  { id: "dados", label: "Dados pessoais" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "adaptacoes", label: "Adaptações" },
  { id: "historico", label: "Histórico" },
  { id: "documentos", label: "Documentos" },
];

export default function PerfilEstudantePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [estudante, setEstudante] = useState<EstudanteResponse | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>("plano");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const estudanteId = Number(id);

      if (!id || !Number.isInteger(estudanteId) || estudanteId <= 0) {
        setErro("O identificador do estudante é inválido.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro("");

      try {
        const resposta = await estudantesService.buscarPorId(estudanteId);

        if (ativo) setEstudante(resposta);
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar os dados do estudante.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [id]);

  const nome = estudante?.nomeCompleto ?? "Estudante";
  const iniciais = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toLocaleUpperCase("pt-BR"))
    .join("");

  if (carregando) {
    return (
      <main className="min-h-full bg-[#f3f6f1] p-6">
        <p className="text-sm text-slate-500">Carregando perfil do estudante...</p>
      </main>
    );
  }

  if (erro || !estudante) {
    return (
      <main className="min-h-full bg-[#f3f6f1] p-6">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {erro || "Estudante não encontrado."}
        </div>
        <button
          type="button"
          onClick={() => navigate(routes.estudantesCoordenador)}
          className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Voltar para estudantes
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-full w-full bg-[#f3f6f1] px-4 pt-3 pb-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-7 pb-10">
        <header>
          <h1 className="text-2xl font-bold leading-tight text-[#14532d] sm:text-[28px]">
            Perfil do estudante
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Dados centralizados, abas e acompanhamento do estudante.
          </p>
        </header>

        {/* Identificação do estudante */}
        <section className="flex flex-col gap-6 rounded-xl border border-[#d9e2d9] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex min-w-0 items-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#e7f4e8] text-2xl font-bold text-[#14532d] sm:size-[72px] sm:text-3xl">
              {iniciais || "E"}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-[#25332b] sm:text-2xl">
                {nome}
              </h2>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Matrícula {estudante.matricula || "Não informada"}
                {" • "}
                {estudante.curso || "Curso não informado"}
                {estudante.periodoIngresso
                  ? ` • Ingresso ${estudante.periodoIngresso}`
                  : ""}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#e7f4e8] px-3 py-1 text-xs font-bold text-[#176534]">
                  Estudante
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Plano de ação
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3 sm:flex-col sm:items-end">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `${routes.anamneseCoordenador}?estudanteId=${encodeURIComponent(
                    String(estudante.id),
                  )}`,
                )
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#36a653] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#278944]"
            >
              Editar dados
              <span aria-hidden="true">↗</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d9e2d9] bg-white px-5 py-2.5 text-sm font-semibold text-[#14532d] transition hover:bg-[#f3f8f3]"
            >
              Gerar documento
              <span aria-hidden="true">▣</span>
            </button>
          </div>
        </section>

        {/* Abas do perfil */}
        <nav
          aria-label="Seções do perfil do estudante"
          className="grid grid-cols-2 gap-2 rounded-xl border border-[#d9e2d9] bg-white p-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {abas.map((aba) => (
            <button
              key={aba.id}
              type="button"
              onClick={() => setAbaAtiva(aba.id)}
              aria-current={abaAtiva === aba.id ? "page" : undefined}
              className={`min-h-11 rounded-md px-3 py-3 text-sm transition ${
                abaAtiva === aba.id
                  ? "bg-[#e7f4e8] font-bold text-[#14532d]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {aba.label}
            </button>
          ))}
        </nav>

        {/* Aba: Plano de ação */}
        {abaAtiva === "plano" && (
          <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <section className="min-h-[300px] rounded-xl border border-[#d9e2d9] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#25332b]">
                Resumo do plano de ação
              </h2>

              <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-[125px_1fr]">
                <span className="text-sm font-semibold text-slate-500">
                  Responsável
                </span>
                <span className="text-base text-slate-700">
                  {estudante.nomeResponsavel || "Não informado"}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  Contato
                </span>
                <span className="text-base text-slate-700">
                  {estudante.telefoneResponsavel || "Não informado"}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  Dificuldades
                </span>
                <span className="text-base leading-6 text-slate-700">
                  Ainda não há um plano de ação vinculado a este estudante.
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  Necessidades
                </span>
                <span className="text-base leading-6 text-slate-700">
                  {estudante.possuiNecessidadeEspecifica === true
                    ? estudante.necessidadesEspecificas?.join(", ") ||
                      "Necessidades específicas registradas"
                    : estudante.possuiNecessidadeEspecifica === false
                      ? "Nenhuma necessidade específica informada"
                      : "Não informado"}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  O que domina
                </span>
                <span className="text-base leading-6 text-slate-700">
                  Será preenchido a partir do plano de ação.
                </span>
              </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `${routes.planoAcaoCoordenador}?estudanteId=${encodeURIComponent(
                        String(estudante.id),
                      )}`,
                    )
                  }
                  className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-[#36a653] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#278944]"
                >
                  Cadastrar Plano de Ação
                </button>
            </section>

            <section className="min-h-[300px] rounded-xl border border-[#d9e2d9] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-[#25332b]">
                Linha do tempo
              </h2>

              <div className="mt-6 rounded-lg bg-[#f8faf7] p-5">
                <p className="text-base font-semibold text-slate-700">
                  Nenhuma atividade registrada
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Entrevistas, documentos, planos e adaptações poderão aparecer
                  aqui quando o histórico estiver integrado.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Outras abas */}
        {abaAtiva !== "plano" && (
          <section className="min-h-[300px] rounded-xl border border-[#d9e2d9] bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-[#25332b]">
              {abas.find((aba) => aba.id === abaAtiva)?.label}
            </h2>

            <p className="mt-4 text-base leading-6 text-slate-500">
              Esta seção será implementada na próxima etapa.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
