import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  FAVORITES_STORAGE_KEY,
  WIDGET_BY_ID,
  type WidgetId,
} from "../data/dashboardWidgets";

function readFavorites(): WidgetId[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is WidgetId => typeof id === "string" && id in WIDGET_BY_ID,
    );
  } catch {
    return [];
  }
}

function writeFavorites(ids: WidgetId[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

let favoritesCache = readFavorites();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return favoritesCache;
}

function setFavorites(ids: WidgetId[]) {
  favoritesCache = ids;
  writeFavorites(ids);
  listeners.forEach((l) => l());
}

interface FavoritesContextValue {
  favorites: WidgetId[];
  isFavorite: (id: WidgetId) => boolean;
  toggleFavorite: (id: WidgetId) => void;
  removeFavorite: (id: WidgetId) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const isFavorite = useCallback(
    (id: WidgetId) => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback((id: WidgetId) => {
    const next = favoritesCache.includes(id)
      ? favoritesCache.filter((x) => x !== id)
      : [...favoritesCache, id];
    setFavorites(next);
  }, []);

  const removeFavorite = useCallback((id: WidgetId) => {
    setFavorites(favoritesCache.filter((x) => x !== id));
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
