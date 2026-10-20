import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";

import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario, routes } from "../../config/routes";
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
    return <Navigate to="/" replace />;
  }

  if (usuario.perfil !== perfil) {
    return <Navigate to={destinoUsuario(usuario)} replace />;
  }

  if (permission && !canAccess(usuario.perfil, permission)) {
    return <Navigate to={destinoUsuario(usuario)} replace />;
  }

  const pagina =
    children ??
    (perfil === "COORDENADOR" ? <DashboardCoordenador /> : <HomePage />);

  return <AppLayout>{pagina}</AppLayout>;
}

function HomeRedirect() {
  const { usuario } = useAuth();

  return (
    <Navigate
      to={usuario ? destinoUsuario(usuario) : "/"}
      replace
    />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomeRedirect />} />

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

      {/* Página não encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
