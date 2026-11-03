import { AuthProvider } from "./contexts/AuthProvider";
import { BrowserRouter } from "react-router";
import AppRoutes from "./app/routes/AppRoutes";
import Accessibility from "./components/Accessibility";
import LoginNotificationSummary from "./components/notifications/LoginNotificationSummary";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Accessibility />
        <LoginNotificationSummary />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
