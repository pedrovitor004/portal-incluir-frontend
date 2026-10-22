import { useEffect, useMemo, useState } from "react";
import { estudantesService } from "../../../services/estudantesService";
import {
  mapearEstudante,
  type Estudante,
} from "../../../types/estudante";

import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { useNavigate } from "react-router";
import { routes } from "../../../config/routes";

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  estudantes?: Estudante[];
  carregando?: boolean;
  erro?: string;
  onAbrirEstudante?: (estudante: Estudante) => void;
  onNovoEstudante?: () => void;
};

const temaEstudantes = themeQuartz.withParams({
  accentColor: "#16a34a",
  spacing: 8,
  borderRadius: 8,
  headerHeight: 48,
  rowHeight: 52,
});

export default function GerenciarEstudantes({
  estudantes: estudantesIniciais,
  carregando: carregandoInicial = false,
  erro: erroInicial,
  onAbrirEstudante,
  onNovoEstudante,
}: Props) {
  const [estudantesApi, setEstudantesApi] = useState<Estudante[]>([]);
  const [carregandoApi, setCarregandoApi] = useState(true);
  const [erroApi, setErroApi] = useState("");
  const navigate = useNavigate();

  function abrirAnamnese(estudante?: Estudante) {
    const destino = routes.anamneseCoordenador;

    navigate(
      estudante
        ? `${destino}?estudanteId=${encodeURIComponent(String(estudante.id))}`
        : destino,
    );
  }

    function abrirPerfilEstudante(estudante: Estudante) {
      navigate(
        routes.perfilEstudante.replace(
          ":id",
          encodeURIComponent(String(estudante.id)),
        ),
      );
    }

  useEffect(() => {
    let ativo = true;

    async function carregarEstudantes() {
      try {
        setCarregandoApi(true);
        setErroApi("");

        const resposta = await estudantesService.listarTodos();

        if (ativo) {
          setEstudantesApi(resposta.map(mapearEstudante));
        }
      } catch (error) {
        if (ativo) {
          setErroApi(
            "Não foi possível carregar os estudantes. Verifique se o backend está em execução.",
          );
        }

        console.error("Erro ao carregar estudantes:", error);
      } finally {
        if (ativo) {
          setCarregandoApi(false);
        }
      }
    }

    carregarEstudantes();

    return () => {
      ativo = false;
    };
  }, []);

  const estudantes = estudantesIniciais ?? estudantesApi;
  const carregando = carregandoInicial || carregandoApi;
  const erro = erroInicial || erroApi;

  const [nome, setNome] = useState("");
  const [matricula] = useState("");
  const [curso, setCurso] = useState("");
  const [ano, setAno] = useState("");
  const [deficiencia, setDeficiencia] = useState("");

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    nome: "",
    matricula: "",
    curso: "",
    ano: "",
    deficiencia: "",
  });

  const cursos = useMemo(
    () =>
      [...new Set(estudantes.map((e) => e.curso).filter(Boolean))].sort(),
    [estudantes],
  );

  const anos = useMemo(
    () =>
      [...new Set(estudantes.map((e) => e.ano).filter(Boolean))].sort(),
    [estudantes],
  );

  const deficiencias = useMemo(
    () =>
      [
        ...new Set(
          estudantes.map((e) => e.deficiencia).filter(Boolean),
        ),
      ].sort(),
    [estudantes],
  );

    const estudantesFiltrados = useMemo(() => {
      const normalizar = (valor: string) =>
        valor.toLocaleLowerCase("pt-BR").trim();

      return estudantes.filter((estudante) => {
        const termoBusca = normalizar(filtrosAplicados.nome);

        const correspondeNomeOuMatricula =
          normalizar(estudante.nome).includes(termoBusca) ||
          normalizar(estudante.matricula).includes(termoBusca);

        return (
          correspondeNomeOuMatricula &&
          (!filtrosAplicados.curso ||
            estudante.curso === filtrosAplicados.curso) &&
          (!filtrosAplicados.ano ||
            estudante.ano === filtrosAplicados.ano) &&
          (!filtrosAplicados.deficiencia ||
            estudante.deficiencia === filtrosAplicados.deficiencia)
        );
      });
  }, [estudantes, filtrosAplicados]);

  const columnDefs = useMemo<ColDef<Estudante>[]>(
    () => [
      {
        field: "nome",
        headerName: "Nome do estudante",
        minWidth: 220,
        flex: 2,
      },
      {
        field: "matricula",
        headerName: "Matrícula",
        minWidth: 130,
        flex: 1,
      },
      {
        field: "ano",
        headerName: "Ano",
        minWidth: 100,
        flex: 0.7,
      },
      {
        field: "curso",
        headerName: "Curso",
        minWidth: 150,
        flex: 1,
      },
      {
        field: "deficiencia",
        headerName: "Necessidades específicas",
        minWidth: 220,
        flex: 1.5,
        wrapText: true,
        autoHeight: true,
        tooltipField: "deficiencia",
        valueFormatter: (params) =>
            params.value || "Não informado",
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        flex: 0.8,
        cellRenderer: (params: ICellRendererParams<Estudante>) => {
          const status = params.value || "Não informado";
          const statusNormalizado = String(status).toLowerCase();
          const ativo = statusNormalizado === "ativo";
          const concluido = statusNormalizado === "concluído";

          return (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                ativo
                  ? "bg-green-100 text-green-800"
                  : concluido
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        headerName: "Ações",
        colId: "acoes",
        minWidth: 110,
        maxWidth: 130,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<Estudante>) => {
          const estudante = params.data;

          if (!estudante) return null;

          return (
            <button
              type="button"
              onClick={() => {
                if (onAbrirEstudante) {
                  onAbrirEstudante(estudante);
                } else {
                  abrirPerfilEstudante(estudante);
                }
              }}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Abrir
            </button>
          );
        },
      },
    ],
    [onAbrirEstudante],
  );

  const defaultColDef = useMemo<ColDef<Estudante>>(
    () => ({
      sortable: true,
      resizable: true,
      suppressHeaderMenuButton: true,
    }),
    [],
  );

  function aplicarFiltros() {
    setFiltrosAplicados({
      nome,
      matricula,
      curso,
      ano,
      deficiencia,
    });
  }




return (
  <section className="min-h-full w-full bg-[#f3f6f1] px-1 py-2">
    <div className="w-full space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">
          Gerenciar estudantes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consulta, filtros e acesso ao perfil completo do estudante.
        </p>
      </header>

      {/* Filtros */}
      <div className="rounded-md border border-[#d9e2d9] bg-white px-4 py-3">

        <form
          className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-12"
          onSubmit={(event) => {
            event.preventDefault();
            aplicarFiltros();
          }}
        >
          <div className="sm:col-span-2 lg:col-span-3">
            <label
              htmlFor="filtro-busca"
              className="mb-1 block text-[11px] font-semibold text-gray-800"
            >
              Nome ou matrícula
            </label>
            <input
              id="filtro-busca"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Buscar estudante"
              className="h-8 w-full rounded border border-[#dce2dc] px-2 text-xs outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-100"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="filtro-curso"
              className="mb-1 block text-[11px] font-semibold text-gray-800"
            >
              Curso
            </label>
            <select
              id="filtro-curso"
              value={curso}
              onChange={(event) => setCurso(event.target.value)}
              className="h-8 w-full rounded border border-[#dce2dc] bg-white px-2 text-xs outline-none focus:border-green-600"
            >
              <option value="">Todos</option>
              {cursos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label
              htmlFor="filtro-ano"
              className="mb-1 block text-[11px] font-semibold text-gray-800"
            >
              Ano
            </label>
            <select
              id="filtro-ano"
              value={ano}
              onChange={(event) => setAno(event.target.value)}
              className="h-8 w-full rounded border border-[#dce2dc] bg-white px-2 text-xs outline-none focus:border-green-600"
            >
              <option value="">Todos</option>
              {anos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="filtro-deficiencia"
              className="mb-1 block text-[11px] font-semibold text-gray-800"
            >
              Deficiência
            </label>
            <select
              id="filtro-deficiencia"
              value={deficiencia}
              onChange={(event) => setDeficiencia(event.target.value)}
              className="h-8 w-full rounded border border-[#dce2dc] bg-white px-2 text-xs outline-none focus:border-green-600"
            >
              <option value="">Todas</option>
              {deficiencias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end">
            <button
              type="submit"
              className="inline-flex h-8 items-center justify-center gap-2 rounded bg-[#36a653] px-3 text-xs font-semibold text-white transition hover:bg-[#278944]"
            >
              Filtrar
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 7h10" />
                <path d="M18 7h2" />
                <path d="M4 17h2" />
                <path d="M10 17h10" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="8" cy="17" r="2" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onNovoEstudante) {
                  onNovoEstudante();
                } else {
                  abrirAnamnese();
                }
              }}
              className="inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded border border-[#d4dfd4] bg-white px-3 text-xs font-semibold text-[#14532d] transition hover:bg-[#f3f8f3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Novo estudante
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {erro}
        </div>
      )}

      {/* Tabela de estudantes */}
      <div className="overflow-hidden rounded-md border border-[#d9e2d9] bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-[#14532d]">
            Lista de estudantes
          </h2>
          <span className="text-xs text-gray-500">
            {estudantesFiltrados.length} estudante(s)
          </span>
        </div>

        <div className="w-full" style={{ height: 520 }}>
          <AgGridReact<Estudante>
            theme={temaEstudantes}
            rowData={estudantesFiltrados}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowId={(params) => String(params.data.id)}
            loading={carregando}
            pagination
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            localeText={{
              noRowsToShow: "Nenhum estudante encontrado.",
              loadingOoo: "Carregando...",
              page: "Página",
              of: "de",
              to: "até",
              first: "Primeira",
              last: "Última",
              next: "Próxima",
              previous: "Anterior",
              pageSizeSelectorLabel: "Itens por página:",
            }}
          />
        </div>
      </div>
    </div>
  </section>
);
}
