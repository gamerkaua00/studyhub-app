// ============================================================
// StudyHub — App.jsx
// Roteamento principal da aplicação
// ============================================================

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ContentForm from "./pages/ContentForm";
import SubjectsPage from "./pages/SubjectsPage";
import styles from "./styles/App.module.css";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/novo"      element={<ContentForm />} />
        <Route path="/editar/:id" element={<ContentForm />} />
        <Route path="/materias"  element={<SubjectsPage />} />
        {/* Redireciona rotas desconhecidas para o dashboard */}
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
