import { type ReactNode } from "react";
import PageErrorBoundary from "../../components/common/PageErrorBoundary";
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
import DashboardCoordenador from "../../pages/coordenador/DashboardCoordenador";
import InstitutionalDocumentPage from "../../pages/institutional/InstitutionalDocumentPage";
import { institutionalDocuments } from "../../config/institutionalDocuments";
import GerenciarEstudantes from "../../pages/coordenador/estudantes/GerenciarEstudantes";
import AnamnesePage from "../../pages/coordenador/estudantes/AnamnesePage";
import PerfilEstudantePage from "../../pages/coordenador/estudantes/PerfilEstudantePage";


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
    (perfil === "COORDENADOR" ? <DashboardCoordenador /> : <HomePage />);

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

      {/* Página não encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </PageErrorBoundary>
  );
}
