import {
  ROUTINE_BLOCKS,
  CATEGORIES,
  COURSES,
  GIS_DAY_ROADMAP,
  MILESTONES,
  GRID,
  ROUTINE_META,
  PILLARS,
} from "./data.js";
import { MESSAGES, DAY_NAMES, DAY_SHORT } from "./i18n.js";

const state = {
  lang: localStorage.getItem("routine-lang") || "en",
  view: localStorage.getItem("routine-view") || "week",
};

function parseTime(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(str) {
  const [h, m] = str.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatTimeJa(str) {
  const [h, m] = str.split(":").map(Number);
  return `${h}:${String(m).padStart(2, "0")}`;
}

function t(key) {
  return MESSAGES[state.lang][key] ?? key;
}

function dayName(i) {
  return DAY_NAMES[state.lang][i];
}

function dayShort(i) {
  return DAY_SHORT[state.lang][i];
}

function blockTitle(block) {
  return state.lang === "ja" ? block.titleJa : block.titleEn;
}

function blockNote(block) {
  return (state.lang === "ja" ? block.noteJa : block.noteEn) || "";
}

function timeFmt(str) {
  return state.lang === "ja" ? formatTimeJa(str) : formatTime(str);
}

function getTodayIndex() {
  const js = new Date().getDay();
  return js === 0 ? 6 : js - 1;
}

function blockStyle(block) {
  const startMin = parseTime(block.start);
  const endMin = parseTime(block.end);
  const gridStart = GRID.startHour * 60;
  const totalMin = (GRID.endHour - GRID.startHour) * 60;
  const top = ((startMin - gridStart) / totalMin) * 100;
  const height = ((endMin - startMin) / totalMin) * 100;
  const color = CATEGORIES[block.cat]?.color || "#64748b";
  return { top: `${top}%`, height: `${Math.max(height, 1.8)}%`, background: color };
}

function blockHtml(block) {
  return `
    <span class="block-title">${blockTitle(block)}</span>
    <span class="block-time">${timeFmt(block.start)} – ${timeFmt(block.end)}</span>
    ${blockNote(block) ? `<span class="block-note">${blockNote(block)}</span>` : ""}
    ${block.optional ? `<span class="block-note">${t("optional")}</span>` : ""}`;
}

function sumHours(filter) {
  return ROUTINE_BLOCKS.filter(filter).reduce(
    (sum, b) => sum + (parseTime(b.end) - parseTime(b.start)) / 60,
    0
  );
}

function hourLabel(h) {
  if (state.lang === "ja") return `${h}:00`;
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

function renderLegend() {
  return Object.values(CATEGORIES)
    .map(
      (cat) => `
      <div class="legend-item">
        <span class="legend-swatch" style="background:${cat.color}"></span>
        <span>${state.lang === "ja" ? cat.labelJa : cat.labelEn}</span>
      </div>`
    )
    .join("");
}

function renderCourses() {
  return COURSES.map(
    (c) => `
    <div class="course-row">
      <span class="priority-badge">${c.priority}</span>
      <div>
        <strong>${c.code}</strong> · ${c.units} ${t("units")}
        <div class="course-meta">${state.lang === "ja" ? c.scheduleJa : c.scheduleEn}</div>
      </div>
    </div>`
  ).join("");
}

function renderGisDayRoadmap() {
  return GIS_DAY_ROADMAP.map(
    (m) => `
    <div class="milestone">
      <strong>Phase ${m.phase}</strong>
      <span>${m.weeks}</span>
      <div class="course-meta">${state.lang === "ja" ? m.ja : m.en}</div>
    </div>`
  ).join("");
}

function renderMilestones() {
  return MILESTONES.map(
    (m) => `
    <div class="milestone">
      <strong>${m.weeks}</strong>
      <span>${state.lang === "ja" ? m.ja : m.en}</span>
    </div>`
  ).join("");
}

function renderBudget() {
  const rows = [
    { label: t("budgetStudy"), hrs: sumHours((b) => b.cat === "study"), color: CATEGORIES.study.color },
    { label: t("budgetAtlas"), hrs: sumHours((b) => b.cat === "atlas"), color: CATEGORIES.atlas.color },
    {
      label: t("budgetClub"),
      hrs: sumHours((b) => b.cat === "club" && !b.optional),
      color: CATEGORIES.club.color,
    },
    {
      label: t("budgetWorkout"),
      hrs: sumHours((b) => b.cat === "workout"),
      color: CATEGORIES.workout.color,
    },
    { label: t("budgetClass"), hrs: sumHours((b) => b.cat === "class"), color: CATEGORIES.class.color },
  ];
  const max = Math.max(...rows.map((r) => r.hrs), 1);
  return rows
    .map(
      (r) => `
      <div class="budget-row">
        <span>${r.label}</span>
        <span>${r.hrs.toFixed(1)} ${t("hours")}</span>
        <div class="budget-track">
          <div class="budget-fill" style="width:${(r.hrs / max) * 100}%;background:${r.color}"></div>
        </div>
      </div>`
    )
    .join("");
}

function renderPillars() {
  return PILLARS.map(
    (p) => `<div class="milestone"><span>${state.lang === "ja" ? p.ja : p.en}</span></div>`
  ).join("");
}

function renderRules() {
  return `<ol class="rules">
    <li>${t("rule1")}</li>
    <li>${t("rule2")}</li>
    <li>${t("rule3")}</li>
    <li>${t("rule4")}</li>
    <li>${t("rule5")}</li>
  </ol>`;
}

function renderWeekGrid() {
  const today = getTodayIndex();
  const totalHours = GRID.endHour - GRID.startHour;
  const hours = Array.from({ length: totalHours }, (_, i) => GRID.startHour + i);

  const heads = Array.from({ length: 7 }, (_, i) => {
    const col = i + 2;
    return `<div class="day-col-head${i === today ? " today" : ""}" style="grid-column:${col}">${dayShort(i)}</div>`;
  }).join("");

  const timeAxis = `<div class="time-axis">${hours.map((h) => `<div class="hour-label">${hourLabel(h)}</div>`).join("")}</div>`;

  const dayCols = Array.from({ length: 7 }, (_, day) => {
    const col = day + 2;
    const cls = day === today ? "day-col today-col" : "day-col";
    const blocks = ROUTINE_BLOCKS.filter((b) => b.day === day)
      .map((block) => {
        const style = blockStyle(block);
        return `<div class="block${block.optional ? " optional" : ""}" style="top:${style.top};height:${style.height};background:${style.background}">${blockHtml(block)}</div>`;
      })
      .join("");
    return `<div class="${cls}" style="grid-column:${col}">${blocks}</div>`;
  }).join("");

  return `<div class="week-grid" style="--total-hours:${totalHours}"><div class="corner"></div>${heads}${timeAxis}${dayCols}</div>`;
}

function renderListView() {
  const today = getTodayIndex();
  return Array.from({ length: 7 }, (_, day) => {
    const items = ROUTINE_BLOCKS.filter((b) => b.day === day)
      .map((block) => {
        const color = CATEGORIES[block.cat]?.color || "#64748b";
        return `
          <div class="list-item">
            <div class="list-time">${timeFmt(block.start)}<br>${timeFmt(block.end)}</div>
            <div class="list-dot" style="background:${color}"></div>
            <div class="list-body">
              <strong>${blockTitle(block)}</strong>
              ${blockNote(block) ? `<span>${blockNote(block)}</span>` : ""}
              ${block.optional ? `<span>${t("optional")}</span>` : ""}
            </div>
          </div>`;
      })
      .join("");
    return `
      <section class="day-list">
        <div class="day-list-head${day === today ? " today" : ""}">${dayName(day)}</div>
        ${items}
      </section>`;
  }).join("");
}

function bindControls(root) {
  root.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      localStorage.setItem("routine-view", state.view);
      render();
    });
  });

  root.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.setLang;
      localStorage.setItem("routine-lang", state.lang);
      document.documentElement.lang = state.lang === "ja" ? "ja" : "en";
      render();
    });
  });
}

function render() {
  const app = document.getElementById("app");
  const todayIdx = getTodayIndex();
  const calendar = state.view === "week" ? renderWeekGrid() : renderListView();

  app.innerHTML = `
    <div class="app">
      <header class="header">
        <div>
          <h1>${t("title")}</h1>
          <p>${state.lang === "ja" ? ROUTINE_META.focusJa : ROUTINE_META.focusEn} · ${dayName(todayIdx)} (${t("today")})</p>
        </div>
        <div class="toolbar">
          <button type="button" class="btn ${state.view === "week" ? "active" : ""}" data-view="week">${t("viewWeek")}</button>
          <button type="button" class="btn ${state.view === "list" ? "active" : ""}" data-view="list">${t("viewList")}</button>
          <button type="button" class="btn lang-toggle" data-set-lang="en" aria-pressed="${state.lang === "en"}">EN</button>
          <button type="button" class="btn lang-toggle" data-set-lang="ja" aria-pressed="${state.lang === "ja"}">日本語</button>
          <button type="button" class="btn" onclick="window.print()">${t("print")}</button>
        </div>
      </header>

      <div class="layout">
        <div class="main-panel">
          <div class="panel-head"><h2>${state.view === "week" ? t("viewWeek") : t("viewList")}</h2></div>
          <div class="calendar-view ${state.view === "list" ? "list-view" : ""}">${calendar}</div>
        </div>
        <aside class="side-panel">
          <section><h3>${t("pillars")}</h3>${renderPillars()}</section>
          <section><h3>${t("legend")}</h3><div class="legend">${renderLegend()}</div></section>
          <section><h3>${t("weeklyBudget")}</h3><div class="budget-bar">${renderBudget()}</div></section>
          <section><h3>${t("courses")}</h3>${renderCourses()}</section>
          <section><h3>${t("gisDay")}</h3>${renderGisDayRoadmap()}</section>
          <section><h3>${t("milestones")}</h3>${renderMilestones()}</section>
          <section><h3>${t("rules")}</h3>${renderRules()}</section>
        </aside>
      </div>
    </div>`;

  bindControls(app);
}

document.documentElement.lang = state.lang === "ja" ? "ja" : "en";
render();
