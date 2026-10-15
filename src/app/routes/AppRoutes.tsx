import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario } from "../../config/routes";
import { Navigate, Route, Routes } from "react-router";

import LoginPage from "../../pages/auth/LoginPage";
import HomePage from "../../pages/home/HomePage";
import NotFoundPage from "../../pages/not-found/NotFoundPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import AppLayout from "../../layouts/AppLayout";
import DashboardCoordenador from "../../pages/coordenador/DashboardCoordenador";
import { accessProfiles } from "../../config/access";
import type { PerfilUsuario } from "../../types/auth";
import { routes } from "../../config/routes";
import { institutionalDocuments } from "../../config/institutionalDocuments";
import InstitutionalDocumentPage from "../../pages/institutional/InstitutionalDocumentPage";

function PerfilRoute({ perfil }: { perfil: PerfilUsuario }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" replace />;
  if (usuario.perfil !== perfil) return <Navigate to={destinoUsuario(usuario)} replace />;
  return <AppLayout>{perfil === "COORDENADOR" ? <DashboardCoordenador /> : <HomePage />}</AppLayout>;
}

function HomeRedirect() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? destinoUsuario(usuario) : "/"} replace />;
}
export default function AppRoutes() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomeRedirect />} />
      <Route path={routes.lgpd} element={<InstitutionalDocumentPage document={institutionalDocuments.lgpd} />} />
      <Route path={routes.legislacao} element={<InstitutionalDocumentPage document={institutionalDocuments.legislacao} />} />

      {/* Área do coordenador */}
      {(Object.keys(accessProfiles) as PerfilUsuario[]).map(perfil => (
        <Route key={perfil} path={`${accessProfiles[perfil].basePath}/dashboard`} element={<PerfilRoute perfil={perfil} />} />
      ))}

      {/* Página não encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
