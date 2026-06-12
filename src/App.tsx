import { lazy, Suspense, useState } from "react";
import { FavoritesProvider } from "./context/FavoritesContext";
import FavoritesSection from "./components/FavoritesSection";
import HistorySection from "./components/HistorySection";
import LoginGate, { useLogout } from "./components/LoginGate";
import PiTargetsSection from "./components/PiTargetsSection";
import { useFavorites } from "./context/FavoritesContext";
import { REMAINING_TEAM } from "./data/spData";
import type { AppTab } from "./types/app";

const ExpertiseSection = lazy(() => import("./components/ExpertiseSection"));
const RisksSection = lazy(() => import("./components/RisksSection"));

const TABS: { id: AppTab; label: string }[] = [
  { id: "favorites", label: "Избранное" },
  { id: "pi", label: "PI: ключи и импакт" },
  { id: "history", label: "История 37–63" },
  { id: "expertise", label: "Экспертные зоны" },
  { id: "risks", label: "Риски" },
];

function AppHeader({
  tab,
  setTab,
}: {
  tab: AppTab;
  setTab: (t: AppTab) => void;
}) {
  const { favorites } = useFavorites();
  const logout = useLogout();

  return (
    <header className="header">
      <div className="header-top">
        <h1>Growth — динамика SP</h1>
        <button type="button" className="logout-btn" onClick={logout}>
          Выйти
        </button>
      </div>
      <p>Команда: {REMAINING_TEAM.join(", ")}.</p>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === "favorites" && favorites.length > 0
              ? ` (${favorites.length})`
              : ""}
          </button>
        ))}
      </nav>
    </header>
  );
}

function AppContent() {
  const [tab, setTab] = useState<AppTab>("pi");

  return (
    <div className="app">
      <AppHeader tab={tab} setTab={setTab} />

      {tab === "favorites" && <FavoritesSection />}
      {tab === "pi" && <PiTargetsSection />}
      {tab === "history" && <HistorySection />}
      {tab === "expertise" && (
        <Suspense fallback={<p className="hint">Загрузка…</p>}>
          <ExpertiseSection />
        </Suspense>
      )}
      {tab === "risks" && (
        <Suspense fallback={<p className="hint">Загрузка…</p>}>
          <RisksSection />
        </Suspense>
      )}

      <footer className="footer">
        Запуск: <code>npm run dev</code> · Сборка: <code>npm run build</code>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LoginGate>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </LoginGate>
  );
}
