import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { estudantesService } from "../../../services/estudantesService";
import {
  mapearEstudante,
  type Estudante,
} from "../../../types/estudante";

import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { accessProfiles, canAccess } from "../../../config/access";
import { confirmarCadastroEstudante } from "../../../services/estudanteConfirmation";
import { portalGridTheme, portalGridLocale } from "../../../config/gridTheme";
import LoadingState from "../../../components/common/LoadingState";
import StudentPanel from "./components/StudentPanel";

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  estudantes?: Estudante[];
  carregando?: boolean;
  erro?: string;
  onAbrirEstudante?: (estudante: Estudante) => void;
  onNovoEstudante?: () => void;
};

const temaEstudantes = portalGridTheme.withParams({ rowHeight: 52 });

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
  const { usuario } = useAuth();
  const basePath = accessProfiles[usuario?.perfil ?? "COORDENADOR"].basePath;
  const podeEditar = !!usuario && canAccess(usuario, "estudantes.editar");
  const [painel, setPainel] = useState<{ estudante: Estudante; modo: "acoes" | "pendencias" } | null>(null);
  const [alteracoes, setAlteracoes] = useState<Record<number, Estudante>>({});
  const [confirmandoCadastro, setConfirmandoCadastro] = useState(false);
  const cadastroPendente = useRef(false);

  function abrirAnamnese(estudante?: Estudante) {
    const destino = `${basePath}/anamnese`;

    navigate(
      estudante
        ? `${destino}?estudanteId=${encodeURIComponent(String(estudante.id))}`
        : destino,
    );
  }

  const abrirPerfilEstudante = useCallback((estudante: Estudante) => {
    if (onAbrirEstudante) onAbrirEstudante(estudante);
    else navigate(`${basePath}/estudantes/${encodeURIComponent(String(estudante.id))}`);
  }, [navigate, basePath, onAbrirEstudante]);
  async function novoEstudante() {
    if (!podeEditar || cadastroPendente.current) return;
    cadastroPendente.current = true; setConfirmandoCadastro(true);
    try {
      if (!await confirmarCadastroEstudante("abrir")) return;
      if (onNovoEstudante) onNovoEstudante(); else abrirAnamnese();
    } finally { cadastroPendente.current = false; setConfirmandoCadastro(false); }
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
            "Não foi possível carregar os estudantes. Verifique sua conexão e tente novamente.",
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

  const estudantes = useMemo(() => (estudantesIniciais ?? estudantesApi).map(e => alteracoes[e.id] ?? e), [estudantesIniciais, estudantesApi, alteracoes]);
  const carregando = carregandoInicial || carregandoApi;
  const erro = erroInicial || erroApi;

  const [quantidadeVisivel, setQuantidadeVisivel] = useState(0);

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
        headerName: "Ações", colId: "acoes", pinned: "right", width: 208, minWidth: 208, maxWidth: 208,
        sortable: false, filter: false, floatingFilter: false, resizable: false,
        cellRenderer: (params: ICellRendererParams<Estudante>) => {
          const estudante = params.data;
          if (!estudante) return null;
          const classe = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-100 bg-green-50 text-green-800 transition hover:border-green-300 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700";
          return <div className="flex h-full items-center gap-2">
            <button type="button" title="Abrir perfil" aria-label={`Abrir perfil de ${estudante.nome}`} onClick={() => abrirPerfilEstudante(estudante)} className={classe}><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button type="button" title="Etapas e pendências" aria-label={`Ver etapas e pendências de ${estudante.nome}`} onClick={() => setPainel({ estudante, modo: "pendencias" })} className={classe}><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 4H5v17h14V4h-4M9 3h6v3H9M8 11l1 1 2-2M13 11h3M8 16l1 1 2-2M13 16h3"/></svg></button>
            {podeEditar && <button type="button" title="Gerenciar situação" aria-label={`Gerenciar situação de ${estudante.nome}`} onClick={() => setPainel({ estudante, modo: "acoes" })} className={classe}><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h10m4 0h2M4 17h2m4 0h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg></button>}
          </div>;
        },
      },    ],
    [abrirPerfilEstudante, podeEditar],
  );

  const defaultColDef = useMemo<ColDef<Estudante>>(
    () => ({
      sortable: true,
      resizable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      cellDataType: false,
      filterParams: { debounceMs: 200 },
    }),
    [],
  );

return (
  <section className="min-h-full w-full bg-[#f3f6f1] px-1 py-2">
    <div className="w-full space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-bold leading-tight text-primary sm:text-[28px]">
          {usuario?.perfil === "PROFESSOR" ? "Meus estudantes" : usuario?.perfil === "EQUIPE_MULTIDISCIPLINAR" ? "Estudantes acompanhados" : "Gerenciar estudantes"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {usuario?.perfil === "PROFESSOR" || usuario?.perfil === "EQUIPE_MULTIDISCIPLINAR" ? "Consulte os estudantes vinculados pela coordenação ao seu acompanhamento." : "Consulta, filtros e acesso ao perfil completo do estudante."}
        </p>
      </header>

      {podeEditar && usuario && canAccess(usuario, "anamnese") && <div className="flex justify-end">
        <button type="button" disabled={confirmandoCadastro} onClick={() => void novoEstudante()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M19 7v6m-3-3h6"/></svg>
          Novo estudante
        </button>
      </div>}

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
            {quantidadeVisivel === estudantes.length ? estudantes.length : `${quantidadeVisivel} de ${estudantes.length}`} estudante(s)
          </span>
        </div>

        <div className="w-full" style={{ height: 520 }}>
          <AgGridReact<Estudante>
            theme={temaEstudantes}
            rowData={estudantes}
            onModelUpdated={({ api }) => setQuantidadeVisivel(api.getDisplayedRowCount())}
            onFilterChanged={({ api }) => api.paginationGoToFirstPage()}
            loadingOverlayComponent={() => <LoadingState compact />}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowId={(params) => String(params.data.id)}
            loading={carregando}
            pagination
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            localeText={{ ...portalGridLocale, noRowsToShow: "Nenhum estudante encontrado.", loadingOoo: "Consultando dados..." }}
          />
        </div>
      </div>
    </div>
    {painel && <StudentPanel key={`${painel.estudante.id}-${painel.modo}`} estudante={painel.estudante} modo={painel.modo} onClose={() => setPainel(null)} onUpdate={resposta => setAlteracoes(anterior => ({ ...anterior, [resposta.id]: mapearEstudante(resposta) }))} onPerfil={() => { setPainel(null); abrirPerfilEstudante(painel.estudante); }} onCadastro={() => { setPainel(null); abrirAnamnese(painel.estudante); }} />}
  </section>
);
}
