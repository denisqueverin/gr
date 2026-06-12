/** Ключевые целевые значения команды Growth */
export const TEAM_TARGETS = {
  /** Минимальный SP за спринт без категории BUG (задачи + короткие) */
  spKeyNoBug: 67.5,
  /** Ключ себестоимости SP (база PI 10, спр. 55) */
  costKey: 15.1,
  /** Целевая себестоимость PI 11 */
  costTargetPi11: 10.4,
  /** Рост SP за PI, % */
  piGrowthPct: 30,
} as const;
