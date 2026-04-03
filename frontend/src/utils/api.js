// ============================================================
// StudyHub — utils/api.js
// Axios configurado para comunicação com o backend
// ============================================================

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Interceptor de resposta: extrai .data automaticamente
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Erro de conexão com o servidor";
    return Promise.reject(new Error(message));
  }
);

// ── Contents ─────────────────────────────────────────────────
export const contentApi = {
  getAll:    (params) => api.get("/api/contents", { params }),
  getById:   (id)     => api.get(`/api/contents/${id}`),
  getToday:  ()       => api.get("/api/contents/today"),
  getUpcoming: (limit = 10) => api.get("/api/contents/upcoming", { params: { limit } }),
  getExams:  ()       => api.get("/api/contents/exams"),
  create:    (data)   => api.post("/api/contents", data),
  update:    (id, data) => api.put(`/api/contents/${id}`, data),
  delete:    (id)     => api.delete(`/api/contents/${id}`),
};

// ── Subjects ─────────────────────────────────────────────────
export const subjectApi = {
  getAll:  ()         => api.get("/api/subjects"),
  create:  (data)     => api.post("/api/subjects", data),
  update:  (id, data) => api.put(`/api/subjects/${id}`, data),
  delete:  (id)       => api.delete(`/api/subjects/${id}`),
};

export default api;
