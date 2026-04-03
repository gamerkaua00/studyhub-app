// ============================================================
// StudyHub — pages/Dashboard.jsx
// Página principal: controles de mês, calendário, lista e modal
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import Calendar from "../components/Calendar";
import ContentCard from "../components/ContentCard";
import DayModal from "../components/DayModal";
import { contentApi } from "../utils/api";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();

  // Estado do mês atual exibido no calendário
  const [currentDate, setCurrentDate] = useState(new Date());

  // Conteúdos do mês atual
  const [contents, setContents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Filtros
  const [filterType, setFilterType]       = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // Modal de detalhe do dia clicado
  const [modalDay, setModalDay]           = useState(null);
  const [modalEvents, setModalEvents]     = useState([]);

  // ── Busca conteúdos do mês atual ──────────────────────────
  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const month = currentDate.getMonth() + 1;
      const year  = currentDate.getFullYear();
      const res   = await contentApi.getAll({ month, year });
      setContents(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  // ── Navegar entre meses ────────────────────────────────────
  const prevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const nextMonth = () => setCurrentDate((d) => addMonths(d, 1));
  const goToday   = () => setCurrentDate(new Date());

  // ── Excluir conteúdo ───────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await contentApi.delete(id);
      setContents((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  // ── Clique em um dia do calendário ─────────────────────────
  const handleDayClick = (day, events) => {
    setModalDay(day);
    setModalEvents(events);
  };

  // ── Filtros aplicados à lista lateral ─────────────────────
  const filteredContents = contents
    .filter((c) => (filterType    ? c.type    === filterType    : true))
    .filter((c) => (filterSubject ? c.subject === filterSubject : true))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Extrai matérias únicas para o select de filtro
  const subjects = [...new Set(contents.map((c) => c.subject))].sort();

  // Stats do mês
  const stats = {
    total:   contents.length,
    aula:    contents.filter((c) => c.type === "Aula").length,
    revisao: contents.filter((c) => c.type === "Revisão").length,
    prova:   contents.filter((c) => c.type === "Prova").length,
  };

  return (
    <div className={styles.page}>
      {/* ── Stats rápidas ─────────────────────────────────── */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={`${styles.stat} ${styles.statAula}`}>
          <span className={styles.statValue}>{stats.aula}</span>
          <span className={styles.statLabel}>📖 Aulas</span>
        </div>
        <div className={`${styles.stat} ${styles.statRevisao}`}>
          <span className={styles.statValue}>{stats.revisao}</span>
          <span className={styles.statLabel}>🔄 Revisões</span>
        </div>
        <div className={`${styles.stat} ${styles.statProva}`}>
          <span className={styles.statValue}>{stats.prova}</span>
          <span className={styles.statLabel}>📝 Provas</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── Coluna esquerda: calendário ───────────────── */}
        <div className={styles.calendarCol}>
          {/* Controles de navegação do mês */}
          <div className={styles.calNav}>
            <button className={styles.navBtn} onClick={prevMonth}>‹</button>
            <div className={styles.monthTitle}>
              <h2 className={styles.monthName}>
                {format(currentDate, "MMMM", { locale: ptBR })}
              </h2>
              <span className={styles.year}>{format(currentDate, "yyyy")}</span>
            </div>
            <button className={styles.navBtn} onClick={nextMonth}>›</button>
            <button className={styles.todayBtn} onClick={goToday}>Hoje</button>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <span className={styles.spinner} />
              Carregando...
            </div>
          ) : error ? (
            <div className={styles.error}>
              ⚠️ {error}
              <button onClick={fetchContents} className={styles.retryBtn}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <Calendar
              currentDate={currentDate}
              contents={contents}
              onDayClick={handleDayClick}
            />
          )}
        </div>

        {/* ── Coluna direita: lista de conteúdos ────────── */}
        <div className={styles.listCol}>
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>
              Conteúdos do Mês
              <span className={styles.listCount}>{filteredContents.length}</span>
            </h3>
            <button
              className={styles.addBtn}
              onClick={() => navigate("/novo")}
            >
              + Novo
            </button>
          </div>

          {/* Filtros */}
          <div className={styles.filters}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos os tipos</option>
              <option value="Aula">📖 Aula</option>
              <option value="Revisão">🔄 Revisão</option>
              <option value="Prova">📝 Prova</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas as matérias</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Lista */}
          <div className={styles.list}>
            {filteredContents.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📭</span>
                <p>Nenhum conteúdo para este mês.</p>
                <button
                  className={styles.emptyAdd}
                  onClick={() => navigate("/novo")}
                >
                  Adicionar conteúdo
                </button>
              </div>
            ) : (
              filteredContents.map((content) => (
                <ContentCard
                  key={content._id}
                  content={content}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalhe do dia */}
      {modalDay && (
        <DayModal
          day={modalDay}
          events={modalEvents}
          onClose={() => setModalDay(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
