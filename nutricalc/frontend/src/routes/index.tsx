import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import RecipeEditorPage from "../pages/RecipeEditorPage";
import RecipeViewPage from "../pages/RecipeViewPage";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/login" element={<LoginPage />} />

                <Route path="/register" element={<RegisterPage />} />

                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Criar receita */}
                <Route
                    path="/recipes/new"
                    element={<RecipeEditorPage />}
                />

                {/* Editar receita */}
                <Route
                    path="/recipes/:id"
                    element={<RecipeEditorPage />}
                />

                {/* Criar receita */}
                <Route
                    path="/recipes/:id/view"
                    element={<RecipeViewPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}