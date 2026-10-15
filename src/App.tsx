import { AuthProvider } from "./contexts/AuthProvider";
import { BrowserRouter } from "react-router";
import AppRoutes from "./app/routes/AppRoutes";
import Accessibility from "./components/Accessibility";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Accessibility />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
