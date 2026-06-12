import type { ReactNode } from "react";
import type { WidgetId } from "../data/dashboardWidgets";
import { WIDGET_BY_ID } from "../data/dashboardWidgets";
import { useFavorites } from "../context/FavoritesContext";

interface Props {
  id: WidgetId;
  title?: string;
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  showStar?: boolean;
  /** Подпись в тулбаре (вкладка «Избранное») */
  showTitleInToolbar?: boolean;
}

export default function FavoriteWidget({
  id,
  title,
  children,
  className = "card",
  as = "section",
  showStar = true,
  showTitleInToolbar = false,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const meta = WIDGET_BY_ID[id];
  const favorite = isFavorite(id);
  const Tag = as;

  const starBtn = (
    <button
      type="button"
      className={
        favorite ? "favorite-star active" : "favorite-star"
      }
      onClick={() => toggleFavorite(id)}
      title={
        favorite ? "Убрать из избранного" : "Добавить в избранное"
      }
      aria-label={
        favorite ? "Убрать из избранного" : "Добавить в избранное"
      }
      aria-pressed={favorite}
    >
      {favorite ? "★" : "☆"}
    </button>
  );

  return (
    <Tag className={`favorite-widget ${className}`.trim()}>
      {showStar &&
        (showTitleInToolbar ? (
          <div className="favorite-widget-toolbar">
            <span className="favorite-widget-title">
              {title ?? meta.title}
            </span>
            {starBtn}
          </div>
        ) : (
          <div className="favorite-star-float">{starBtn}</div>
        ))}
      <div className="favorite-widget-body">{children}</div>
    </Tag>
  );
}
