// ============================================================
// StudyHub v2 — utils/api.js
// Axios com token de autenticação automático
// ============================================================

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// Injeta o token em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyhub_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trata erros globalmente
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("studyhub_token");
      localStorage.removeItem("studyhub_user");
      window.location.href = "/studyhub-app/login";
    }
    const message = err.response?.data?.message || err.message || "Erro de conexão";
    return Promise.reject(new Error(message));
  }
);

export const contentApi = {
  getAll:      (params) => api.get("/api/contents", { params }),
  getById:     (id)     => api.get(`/api/contents/${id}`),
  getToday:    ()       => api.get("/api/contents/today"),
  getUpcoming: (limit)  => api.get("/api/contents/upcoming", { params: { limit } }),
  getExams:    ()       => api.get("/api/contents/exams"),
  create:      (data)   => api.post("/api/contents", data),
  update:      (id, d)  => api.put(`/api/contents/${id}`, d),
  delete:      (id)     => api.delete(`/api/contents/${id}`),
};

export const subjectApi = {
  getAll:  ()        => api.get("/api/subjects"),
  create:  (data)    => api.post("/api/subjects", data),
  update:  (id, d)   => api.put(`/api/subjects/${id}`, d),
  delete:  (id)      => api.delete(`/api/subjects/${id}`),
};

export default api;
