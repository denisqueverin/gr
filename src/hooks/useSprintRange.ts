import { useMemo, useState } from "react";
import {
  ALL_DATA_SPRINTS,
  PERIOD_PRESETS,
  sprintsInRange,
  sprintsForPreset,
} from "../data/periodPresets";

export function useSprintRange(defaultPresetId = "pi10-11") {
  const [presetId, setPresetId] = useState(defaultPresetId);
  const [customFrom, setCustomFrom] = useState(55);
  const [customTo, setCustomTo] = useState(64);

  const sprints = useMemo(() => {
    if (presetId === "custom") {
      return sprintsInRange(customFrom, customTo);
    }
    return sprintsForPreset(presetId);
  }, [presetId, customFrom, customTo]);

  const label = useMemo(() => {
    if (presetId === "custom") {
      return `Спр. ${customFrom}–${customTo}`;
    }
    return PERIOD_PRESETS.find((p) => p.id === presetId)?.label ?? "Период";
  }, [presetId, customFrom, customTo]);

  return {
    presetId,
    setPresetId,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    sprints,
    label,
    minSprint: ALL_DATA_SPRINTS[0],
    maxSprint: ALL_DATA_SPRINTS.at(-1) ?? 63,
    presets: PERIOD_PRESETS,
  };
}
