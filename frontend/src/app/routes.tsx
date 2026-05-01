import { createBrowserRouter } from "react-router";

// Đã thêm ngoặc nhọn {} cho tất cả các import để khớp với Named Export
import { Homepage } from "./pages/Homepage/Homepage";
import { Login } from "./pages/Auth/Login/Login";
import { Register } from "./pages/Auth/Register/Register";
import { ForgotPassword } from "./pages/Auth/ForgotPass/ForgotPass";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { ShoppingList } from "./pages/ShoppingList/ShoppingList";
import { Inventory } from "./pages/Inventory/Inventory";
import { MealPlan } from "./pages/MealPlan/MealPlan";
import { Recipes } from "./pages/Recipes/Recipes";
import { Reports } from "./pages/Reports/Reports";
import { FamilyMembers } from "./pages/FamilyMembers/FamilyMembers";
import { Settings } from "./pages/Settings/Settings";

import { AdminLogin } from "./pages/Admin/Auth/Login/AdminLogin";
import { AdminDashboard } from "./pages/Admin/Dashboard/AdminDashboard";
import { Users } from "./pages/Admin/Users/Users";
import { MasterData } from "./pages/Admin/MasterData/MasterData";
import { AuditLogs } from "./pages/Admin/AuditLogs/AuditLogs";
import { AdminReports } from "./pages/Admin/Reports/AdminReports";
import { AdminSettings } from "./pages/Admin/Settings/AdminSettings";

import { GuestLayout } from "./layouts/GuestLayout/GuestLayout";
import { AuthLayout } from "./layouts/AuthLayout/AuthLayout";
import { MainLayout } from "./layouts/MainLayout/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      { index: true, element: <Homepage /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },
  {
    path: "/app",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "shopping-list", element: <ShoppingList /> },
      { path: "inventory", element: <Inventory /> },
      { path: "meal-plan", element: <MealPlan /> },
      { path: "recipes", element: <Recipes /> },
      { path: "reports", element: <Reports /> },
      { path: "family", element: <FamilyMembers /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "login", element: <AdminLogin /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <Users /> },
      { path: "master-data", element: <MasterData /> },
      { path: "audit-logs", element: <AuditLogs /> },
      { path: "reports", element: <AdminReports /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
]);