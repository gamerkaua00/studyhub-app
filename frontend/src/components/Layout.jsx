// ============================================================
// StudyHub — components/Layout.jsx
// Sidebar + Header + área de conteúdo principal
// ============================================================

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Layout.module.css";

const NAV_ITEMS = [
  { to: "/",         icon: "🗓️",  label: "Dashboard" },
  { to: "/novo",     icon: "➕",  label: "Novo Conteúdo" },
  { to: "/materias", icon: "🎨",  label: "Matérias" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Título dinâmico da página
  const pageTitle = NAV_ITEMS.find((n) => n.to === location.pathname)?.label || "StudyHub";

  return (
    <div className={styles.root}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>StudyHub</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.footerText}>
            🤖 Bot Discord ativo
          </span>
          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Configurar →
          </a>
        </div>
      </aside>

      {/* Área principal */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <div className={styles.headerRight}>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Online
            </span>
          </div>
        </header>

        {/* Conteúdo da rota */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
