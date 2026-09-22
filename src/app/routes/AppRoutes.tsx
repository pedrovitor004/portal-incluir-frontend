import { Route, Routes } from "react-router";
import HomePage from "../../pages/home/HomePage";
import NotFoundPage from "../../pages/not-found/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
