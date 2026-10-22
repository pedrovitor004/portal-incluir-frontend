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
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to={routes.login} replace />;
  }

  if (usuario.perfil !== perfil) {
    return <NotFoundPage codigo={403} />;
  }

  if (permission && !canAccess(usuario.perfil, permission)) {
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
      {(Object.keys(accessProfiles) as PerfilUsuario[]).map((perfil) => (
        <Route
          key={perfil}
          path={`${accessProfiles[perfil].basePath}/dashboard`}
          element={<PerfilRoute perfil={perfil} />}
        />
      ))}

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
