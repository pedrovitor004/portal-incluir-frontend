import { AuthProvider } from "./contexts/AuthProvider";
import { BrowserRouter } from "react-router";
import AppRoutes from "./app/routes/AppRoutes";
import Accessibility from "./components/Accessibility";
import AccessRequestReminder from "./components/notifications/AccessRequestReminder";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Accessibility />
        <AccessRequestReminder />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
