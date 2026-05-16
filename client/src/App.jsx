import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ChecklistPage from "./pages/ChecklistPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import TradeDetailPage from "./pages/TradeDetailPage.jsx";
import UpgradePage from "./pages/UpgradePage.jsx";
import WeeklyReviewPage from "./pages/WeeklyReviewPage.jsx";
import StrategyPerformancePage from "./pages/StrategyPerformancePage.jsx";
import RuleImpactPage from "./pages/RuleImpactPage.jsx";
import ImportsPage from "./pages/ImportsPage.jsx";

function App() {
  return (
    <Routes>
      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reviews/weekly" element={<WeeklyReviewPage />} />
        <Route path="/reviews/strategies" element={<StrategyPerformancePage />} />
        <Route path="/reviews/rules" element={<RuleImpactPage />} />
        <Route path="/imports" element={<ImportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="/trade/:id" element={<TradeDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/checklist" replace />} />
    </Routes>
  );
}

export default App;
