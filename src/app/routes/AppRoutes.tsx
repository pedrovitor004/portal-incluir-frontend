import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario } from "../../config/routes";
import { Navigate, Route, Routes } from "react-router";

import LoginPage from "../../pages/auth/LoginPage";
import HomePage from "../../pages/home/HomePage";
import NotFoundPage from "../../pages/not-found/NotFoundPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import CoordenadorLayout from "../../layouts/CoordenadorLayout";
import DashboardCoordenador from "../../pages/coordenador/DashboardCoordenador";

function CoordenadorRoute() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" replace />;
  if (usuario.perfil !== "COORDENADOR") return <Navigate to={destinoUsuario(usuario)} replace />;
  return <CoordenadorLayout><DashboardCoordenador /></CoordenadorLayout>;
}
export default function AppRoutes() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />

      {/* Área do coordenador */}
      <Route
        path="/coordenador/dashboard"
        element={
          <CoordenadorRoute />
        }
      />

      {/* Página não encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}