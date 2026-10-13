import { AuthProvider } from "./contexts/AuthProvider";
import { BrowserRouter } from "react-router";
import AppRoutes from "./app/routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
