import { useState } from "react";
import { INITIATIVE_SUMMARY, MEMBER_EXPERTISE } from "../data/expertise";
import { MEMBER_COLORS } from "../data/spData";
import type { WidgetId } from "../data/dashboardWidgets";
import type { SectionWidgetProps } from "../types/sections";
import FavoriteWidget from "./FavoriteWidget";

export default function ExpertiseSection({
  onlyWidgets,
  compact = false,
}: SectionWidgetProps = {}) {
  const show = (id: WidgetId) =>
    onlyWidgets === undefined || onlyWidgets.includes(id);
  const embedded = compact || onlyWidgets !== undefined;
  const fav = { showTitleInToolbar: embedded };
  const [selected, setSelected] = useState(MEMBER_EXPERTISE[0]?.member);

  const profile = MEMBER_EXPERTISE.find((m) => m.member === selected);

  return (
    <div className="expertise-section">
      {!compact && (
        <header className="pi-header">
          <h2>Экспертные зоны</h2>
          <p>
            По отчётам Jira и PI (спр. 42–62): основные домены, инициативы и
            подтверждённые задачи каждого сотрудника.
          </p>
        </header>
      )}

      {show("expertise-initiatives") && (
        <FavoriteWidget {...fav} id="expertise-initiatives">
          <h3>Инициативы команды</h3>
          <ul className="initiative-list">
            {INITIATIVE_SUMMARY.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </FavoriteWidget>
      )}

      {show("expertise-zones") && (
        <FavoriteWidget {...fav} id="expertise-zones" className="card expertise-zones-widget">
          <div className="expertise-layout">
            <aside className="member-nav">
              <h3>Сотрудники</h3>
              <ul className="member-nav-list">
                {MEMBER_EXPERTISE.map((m) => (
                  <li key={m.member}>
                    <button
                      type="button"
                      className={
                        selected === m.member
                          ? "member-nav-btn active"
                          : "member-nav-btn"
                      }
                      onClick={() => setSelected(m.member)}
                    >
                      <span
                        className="dot"
                        style={{ background: MEMBER_COLORS[m.member] }}
                      />
                      <span>
                        <strong>{m.member}</strong>
                        <span className="role-tag">{m.role}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            {profile && (
              <div className="expertise-detail">
                <h3>
                  {profile.member}
                  <span className="role-tag">{profile.role}</span>
                </h3>
                <div className="zone-grid">
                  {profile.zones.map((zone) => (
                    <article
                      key={zone.id}
                      className={`zone-card zone-${zone.level}`}
                    >
                      <div className="zone-header">
                        <h4>{zone.title}</h4>
                        <span className={`badge-level badge-${zone.level}`}>
                          {zone.level === "primary" ? "Основная" : "Доп."}
                        </span>
                      </div>
                      <div className="zone-initiatives">
                        {zone.initiatives.map((i) => (
                          <span key={i} className="chip chip-init">
                            {i}
                          </span>
                        ))}
                      </div>
                      <ul className="evidence-list">
                        {zone.evidence.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FavoriteWidget>
      )}
    </div>
  );
}
