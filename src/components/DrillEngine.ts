import * as React from "react";

/* ================= TYPES ================= */
export type DrillPath = string;

/* ================= HOOK ================= */
export function useDrillState() {
  const [expanded, setExpanded] = React.useState<Set<DrillPath>>(new Set());

  const toggle = React.useCallback((path: DrillPath) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const isOpen = React.useCallback((path: DrillPath) => expanded.has(path), [expanded]);

  return { expanded, toggle, isOpen };
}

/* ================= HELPERS ================= */
type PathSegment = { type: string; id: string } | string;

export function createRowPath(input: PathSegment | PathSegment[]): DrillPath {
  if (typeof input === "string") return input;
  if (!Array.isArray(input)) return `${input.type}:${input.id}`;
  return input
    .map(seg => (typeof seg === "string" ? seg : `${seg.type}:${seg.id}`))
    .join("|");
}