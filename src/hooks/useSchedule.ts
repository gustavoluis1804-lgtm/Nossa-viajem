"use client";

import { useMemo } from "react";
import { useApp } from "@/services/store";
import { useNow } from "@/hooks/useNow";
import { momentsOf, resolveItems } from "@/data/trip";
import {
  durationMin,
  isHappening,
  itemStart,
  minutesTo,
  shiftTime,
  type ItemStatus,
} from "@/lib/time";
import type { TripItem } from "@/lib/types";

export interface AdjustedTime {
  start: string;
  end?: string;
  plusOne: boolean;
}

export function useSchedule(nowInterval = 1000) {
  const { state, secret } = useApp();
  const now = useNow(nowInterval);

  const items = useMemo(() => resolveItems(state), [state]);
  const completedSet = useMemo(() => new Set(state.completed), [state.completed]);

  const nextIndex = items.findIndex((i) => !completedSet.has(i.id));
  const next = nextIndex >= 0 ? items[nextIndex] : undefined;

  const delayApplies = (item: TripItem): boolean =>
    state.delay > 0 &&
    !completedSet.has(item.id) &&
    nextIndex >= 0 &&
    items.indexOf(item) >= nextIndex;

  const statusOf = (item: TripItem): ItemStatus => {
    if (completedSet.has(item.id)) return "done";
    if (now && isHappening(item, now)) return "now";
    if (next && item.id === next.id) return "next";
    return "todo";
  };

  const adjusted = (item: TripItem): AdjustedTime | null => {
    if (!delayApplies(item)) return null;
    const s = shiftTime(item.start, state.delay);
    const e = item.end ? shiftTime(item.end, state.delay) : undefined;
    return {
      start: s.time,
      end: e?.time,
      plusOne: s.plusOne || Boolean(e?.plusOne),
    };
  };

  const moments = useMemo(() => momentsOf(items), [items]);
  const doneMoments = moments.filter((m) => completedSet.has(m.id)).length;

  const minutesToNext = next && now ? minutesTo(now, itemStart(next)) : null;

  return {
    state,
    now,
    items,
    completedSet,
    next,
    nextIndex,
    statusOf,
    delayApplies,
    adjusted,
    moments,
    doneMoments,
    minutesToNext,
    durationMin,
  };
}
