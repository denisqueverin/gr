import { lazy, Suspense } from "react";
import { WIDGET_BY_ID } from "../data/dashboardWidgets";
import { useFavorites } from "../context/FavoritesContext";
import HistorySection from "./HistorySection";
import PiTargetsSection from "./PiTargetsSection";
import type { WidgetId } from "../data/dashboardWidgets";

const ExpertiseSection = lazy(() => import("./ExpertiseSection"));
const RisksSection = lazy(() => import("./RisksSection"));

function groupByTab(ids: WidgetId[]) {
  const pi: WidgetId[] = [];
  const history: WidgetId[] = [];
  const expertise: WidgetId[] = [];
  const risks: WidgetId[] = [];
  for (const id of ids) {
    const tab = WIDGET_BY_ID[id].tab;
    if (tab === "pi") pi.push(id);
    else if (tab === "history") history.push(id);
    else if (tab === "expertise") expertise.push(id);
    else if (tab === "risks") risks.push(id);
  }
  return { pi, history, expertise, risks };
}

export default function FavoritesSection() {
  const { favorites, clearFavorites } = useFavorites();
  const groups = groupByTab(favorites);

  return (
    <div className="favorites-section">
      <header className="pi-header">
        <h2>Избранное</h2>
        <p>
          Соберите свой дашборд: нажмите ☆ на любом блоке в других вкладках.
          Выбор сохраняется в браузере.
        </p>
        {favorites.length > 0 && (
          <div className="view-mode-row">
            <span className="hint" style={{ margin: 0 }}>
              Блоков: <strong>{favorites.length}</strong>
            </span>
            <button type="button" className="tab" onClick={clearFavorites}>
              Очистить всё
            </button>
          </div>
        )}
      </header>

      {favorites.length === 0 ? (
        <section className="card favorites-empty">
          <p>Пока ничего не добавлено.</p>
          <p className="hint">
            Откройте вкладку PI, История или другую — и отметьте нужные графики
            и таблицы звёздочкой.
          </p>
        </section>
      ) : (
        <>
          {groups.pi.length > 0 && (
            <PiTargetsSection onlyWidgets={groups.pi} compact />
          )}
          {groups.history.length > 0 && (
            <HistorySection onlyWidgets={groups.history} compact />
          )}
          {groups.expertise.length > 0 && (
            <Suspense fallback={<p className="hint">Загрузка…</p>}>
              <ExpertiseSection onlyWidgets={groups.expertise} compact />
            </Suspense>
          )}
          {groups.risks.length > 0 && (
            <Suspense fallback={<p className="hint">Загрузка…</p>}>
              <RisksSection onlyWidgets={groups.risks} compact />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
