import { Route, Routes } from "react-router";

import LoginPage from "../../pages/login/LoginPage";
import HomePage from "../../pages/home/HomePage";
import NotFoundPage from "../../pages/not-found/NotFoundPage";
import RegisterPage from "../../pages/register/RegisterPage";
import Layout from "../../components/Layout";
import DashboardCoordenador from "../../pages/menu/DashboardCoordenador";

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
          <Layout>
            <DashboardCoordenador />
          </Layout>
        }
      />

      {/* Página não encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}