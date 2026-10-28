import { lazy, Suspense, type ReactNode } from "react";
import PageErrorBoundary from "../../components/common/PageErrorBoundary";
import LoadingState from "../../components/common/LoadingState";
import { Navigate, Route, Routes, useLocation } from "react-router";

import { useAuth } from "../../hooks/useAuth";
import { routes } from "../../config/routes";
import { accessProfiles, canAccess, type Permission } from "../../config/access";
import type { PerfilUsuario } from "../../types/auth";

import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import HomePage from "../../pages/home/HomePage";
import NotFoundPage from "../../pages/not-found/NotFoundPage";
import AppLayout from "../../layouts/AppLayout";
import DashboardProfessor from "../../pages/professor/DashboardProfessor";
import DashboardEquipeMultidisciplinar from "../../pages/equipe-multidisciplinar/DashboardEquipeMultidisciplinar";
import DashboardCoordenador from "../../pages/coordenador/DashboardCoordenador";
import InstitutionalDocumentPage from "../../pages/institutional/InstitutionalDocumentPage";
import { institutionalDocuments } from "../../config/institutionalDocuments";
import GerenciarEstudantes from "../../pages/coordenador/estudantes/GerenciarEstudantes";
import AnamnesePage from "../../pages/coordenador/estudantes/AnamnesePage";
import PerfilEstudantePage from "../../pages/coordenador/estudantes/PerfilEstudantePage";
import PlanoAcaoPage from "../../pages/coordenador/estudantes/PlanoAcaoPage";

const RelatoriosPage = lazy(() => import("../../pages/coordenador/relatorios/RelatoriosPage"));
const DocumentosPage = lazy(() => import("../../pages/coordenador/documentos/DocumentosPage"));
const AuditoriasPage = lazy(() => import("../../pages/coordenador/auditorias/AuditoriasPage"));

const UsuariosPage = lazy(() => import("../../pages/coordenador/administracao/UsuariosPage"));
const PermissoesPage = lazy(() => import("../../pages/coordenador/administracao/PermissoesPage"));
const GestaoAcompanhamentoPage = lazy(() => import("../../pages/coordenador/acompanhamento/GestaoAcompanhamentoPage"));
const ResponsaveisPage = lazy(() => import("../../pages/coordenador/acompanhamento/ResponsaveisPage"));

type PerfilRouteProps = {
  perfil: PerfilUsuario;
  children?: ReactNode;
  permission?: Permission;
};

function PerfilRoute({
  perfil,
  children,
  permission,
}: PerfilRouteProps) {
  const { usuario, carregando, erroSessao, atualizarSessao } = useAuth();

  if (carregando) return <LoadingState label="Confirmando sua sessão..." />;
  if (erroSessao && !usuario) return <div role="alert" className="mx-auto max-w-xl space-y-4 p-8"><p>Não foi possível confirmar sua sessão. {erroSessao}</p><button type="button" onClick={() => void atualizarSessao()} className="min-h-11 font-semibold text-green-800 underline">Tentar novamente</button></div>;

  if (!usuario) {
    return <Navigate to={routes.login} replace />;
  }

  if (usuario.perfil !== perfil) {
    return <NotFoundPage codigo={403} />;
  }

  if (permission && !canAccess(usuario, permission)) {
    return <NotFoundPage codigo={403} />;
  }

  const pagina =
    children ??
    (perfil === "COORDENADOR" ? <DashboardCoordenador /> : perfil === "PROFESSOR" ? <DashboardProfessor /> : perfil === "EQUIPE_MULTIDISCIPLINAR" ? <DashboardEquipeMultidisciplinar /> : <HomePage />);

  return <AppLayout>{pagina}</AppLayout>;
}

export default function AppRoutes() {
  const location = useLocation();
  return (
    <PageErrorBoundary key={location.pathname}>
    <Routes>
      <Route path="/coordenador/adaptacoes" element={<PerfilRoute perfil="COORDENADOR" permission="pedagogico.consultar"><Suspense fallback={<LoadingState />}><GestaoAcompanhamentoPage key="adaptacoes" visao="adaptacoes" /></Suspense></PerfilRoute>} />
      <Route path="/coordenador/conteudo-academico" element={<PerfilRoute perfil="COORDENADOR" permission="academico.gerar"><Suspense fallback={<LoadingState />}><GestaoAcompanhamentoPage key="conteudo" visao="conteudo" /></Suspense></PerfilRoute>} />
      <Route path="/coordenador/atendimentos" element={<PerfilRoute perfil="COORDENADOR" permission="suporte.consultar"><Suspense fallback={<LoadingState />}><GestaoAcompanhamentoPage key="atendimentos" visao="atendimentos" /></Suspense></PerfilRoute>} />
      <Route path="/coordenador/responsaveis" element={<PerfilRoute perfil="COORDENADOR" permission="estudantes.vincular"><Suspense fallback={<LoadingState />}><ResponsaveisPage /></Suspense></PerfilRoute>} />
      {(Object.keys(accessProfiles) as PerfilUsuario[]).flatMap(perfil => [
        <Route key={`${perfil}-usuarios`} path={`${accessProfiles[perfil].basePath}/administracao/usuarios`} element={<PerfilRoute perfil={perfil} permission="usuarios"><Suspense fallback={<LoadingState />}><UsuariosPage /></Suspense></PerfilRoute>} />,
        <Route key={`${perfil}-permissoes`} path={`${accessProfiles[perfil].basePath}/administracao/permissoes`} element={<PerfilRoute perfil={perfil} permission="permissoes"><Suspense fallback={<LoadingState />}><PermissoesPage /></Suspense></PerfilRoute>} />,
        ...(["PROFESSOR", "EQUIPE_MULTIDISCIPLINAR"].includes(perfil) ? [
          <Route key={`${perfil}-estudantes`} path={`${accessProfiles[perfil].basePath}/estudantes`} element={<PerfilRoute perfil={perfil} permission="estudantes.consultar"><GerenciarEstudantes /></PerfilRoute>} />,
          <Route key={`${perfil}-perfil`} path={`${accessProfiles[perfil].basePath}/estudantes/:id`} element={<PerfilRoute perfil={perfil} permission="estudantes.consultar"><PerfilEstudantePage /></PerfilRoute>} />,
          <Route key={`${perfil}-anamnese`} path={`${accessProfiles[perfil].basePath}/anamnese`} element={<PerfilRoute perfil={perfil} permission="anamnese"><AnamnesePage /></PerfilRoute>} />,
          <Route key={`${perfil}-auditorias`} path={`${accessProfiles[perfil].basePath}/administracao/auditorias`} element={<PerfilRoute perfil={perfil} permission="auditorias"><Suspense fallback={<LoadingState />}><AuditoriasPage /></Suspense></PerfilRoute>} />,
        ] : []),
        ...(perfil !== "COORDENADOR" ? [
          <Route key={`${perfil}-documentos`} path={`${accessProfiles[perfil].basePath}/documentos`} element={<PerfilRoute perfil={perfil} permission="documentos"><Suspense fallback={<LoadingState />}><DocumentosPage /></Suspense></PerfilRoute>} />,
          <Route key={`${perfil}-relatorios`} path={`${accessProfiles[perfil].basePath}/relatorios`} element={<PerfilRoute perfil={perfil} permission="relatorios"><Suspense fallback={<LoadingState />}><RelatoriosPage /></Suspense></PerfilRoute>} />,
        ] : []),
      ])}

      {/* Páginas públicas */}
      <Route path={routes.home} element={<HomePage />} />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Navigate to={routes.home} replace />} />
      {([401, 403, 404, 500, 503] as const).map(codigo => <Route key={codigo} path={`/${codigo}`} element={<NotFoundPage codigo={codigo} />} />)}

      <Route
        path={routes.lgpd}
        element={
          <InstitutionalDocumentPage
            document={institutionalDocuments.lgpd}
          />
        }
      />

      <Route
        path={routes.legislacao}
        element={
          <InstitutionalDocumentPage
            document={institutionalDocuments.legislacao}
          />
        }
      />

      {/* Documentos e relatórios da coordenação */}
      <Route path={routes.relatoriosCoordenador} element={<PerfilRoute perfil="COORDENADOR" permission="relatorios"><Suspense fallback={<LoadingState label="Carregando relatórios..." />}><RelatoriosPage /></Suspense></PerfilRoute>} />
      <Route path={routes.documentosCoordenador} element={<PerfilRoute perfil="COORDENADOR" permission="documentos"><Suspense fallback={<LoadingState label="Carregando documentos..." />}><DocumentosPage /></Suspense></PerfilRoute>} />

      {/* Dashboards por perfil */}
      <Route path={routes.auditoriasCoordenador} element={<PerfilRoute perfil="COORDENADOR" permission="auditorias"><Suspense fallback={<LoadingState label="Carregando auditorias..." />}><AuditoriasPage /></Suspense></PerfilRoute>} />
      <Route path="/administrador/administracao/auditorias" element={<PerfilRoute perfil="ADMINISTRADOR" permission="auditorias"><Suspense fallback={<LoadingState label="Carregando auditorias..." />}><AuditoriasPage /></Suspense></PerfilRoute>} />
      {(Object.keys(accessProfiles) as PerfilUsuario[]).map((perfil) => (
        <Route
          key={perfil}
          path={`${accessProfiles[perfil].basePath}/dashboard`}
          element={<PerfilRoute perfil={perfil} />}
        />
      ))}

      <Route path="/administrador/estudantes" element={<PerfilRoute perfil="ADMINISTRADOR" permission="estudantes.consultar"><GerenciarEstudantes /></PerfilRoute>} />
      <Route path="/administrador/estudantes/:id" element={<PerfilRoute perfil="ADMINISTRADOR" permission="estudantes.consultar"><PerfilEstudantePage /></PerfilRoute>} />
      <Route path="/administrador/anamnese" element={<PerfilRoute perfil="ADMINISTRADOR" permission="anamnese"><AnamnesePage /></PerfilRoute>} />
      {/* Gerenciamento de estudantes */}
      <Route
        path={routes.estudantesCoordenador}
        element={
          <PerfilRoute
            perfil="COORDENADOR"
            permission="estudantes.consultar"
          >
            <GerenciarEstudantes />
          </PerfilRoute>
        }
      />

      <Route
         path={routes.perfilEstudante}
         element={
           <PerfilRoute
             perfil="COORDENADOR"
             permission="estudantes.consultar"
           >
             <PerfilEstudantePage />
           </PerfilRoute>
         }
      />

      <Route
        path={routes.anamneseCoordenador}
        element={
          <PerfilRoute
            perfil="COORDENADOR"
            permission="anamnese"
          >
            <AnamnesePage />
          </PerfilRoute>
        }
      />

      <Route
        path={routes.planoAcaoCoordenador}
        element={
          <PerfilRoute
            perfil="COORDENADOR"
            permission="estudantes.consultar"
          >
            <PlanoAcaoPage />
          </PerfilRoute>
        }
      />

      {/* Página não encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </PageErrorBoundary>
  );
}
