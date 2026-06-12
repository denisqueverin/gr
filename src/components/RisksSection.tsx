import { MEMBER_COLORS, type TeamMember } from "../data/spData";
import {
  MEMBER_RISKS,
  SEVERITY_LABELS,
  TEAM_RISKS,
  type RiskSeverity,
} from "../data/risks";
import type { WidgetId } from "../data/dashboardWidgets";
import type { SectionWidgetProps } from "../types/sections";
import FavoriteWidget from "./FavoriteWidget";

function RiskCard({
  title,
  severity,
  description,
  mitigation,
}: {
  title: string;
  severity: RiskSeverity;
  description: string;
  mitigation?: string;
}) {
  return (
    <article className={`risk-card risk-${severity}`}>
      <div className="risk-header">
        <h4>{title}</h4>
        <span className={`badge-sev badge-sev-${severity}`}>
          {SEVERITY_LABELS[severity]}
        </span>
      </div>
      <p>{description}</p>
      {mitigation && (
        <p className="risk-mitigation">
          <strong>Митигация:</strong> {mitigation}
        </p>
      )}
    </article>
  );
}

export default function RisksSection({
  onlyWidgets,
  compact = false,
}: SectionWidgetProps = {}) {
  const show = (id: WidgetId) =>
    onlyWidgets === undefined || onlyWidgets.includes(id);
  const embedded = compact || onlyWidgets !== undefined;
  const fav = { showTitleInToolbar: embedded };
  const highTeam = TEAM_RISKS.filter((r) => r.severity === "high").length;

  return (
    <div className="risks-section">
      {!compact && (
        <header className="pi-header">
          <h2>Риски</h2>
          <p>
            По динамике SP, составу команды и отчётам по инициативам. Высоких
            рисков по команде: <strong>{highTeam}</strong>.
          </p>
        </header>
      )}

      {show("risks-team") && (
        <FavoriteWidget {...fav} id="risks-team">
          <h3>Команда в целом</h3>
          <div className="risk-grid">
            {TEAM_RISKS.map((r) => (
              <RiskCard key={r.id} {...r} />
            ))}
          </div>
        </FavoriteWidget>
      )}

      {show("risks-members") && (
        <FavoriteWidget {...fav} id="risks-members">
          <h3>По сотрудникам</h3>
          <div className="member-risks-grid">
            {MEMBER_RISKS.map((block) => (
              <div key={block.member} className="member-risk-block">
                <h4>
                  <span
                    className="dot"
                    style={{
                      background: MEMBER_COLORS[block.member as TeamMember],
                    }}
                  />
                  {block.member}
                </h4>
                {block.risks.map((r) => (
                  <RiskCard key={r.id} {...r} />
                ))}
              </div>
            ))}
          </div>
        </FavoriteWidget>
      )}
    </div>
  );
}
