/**
 * Crew calendar 12-color palette — Task 002 (CON-04, D-026, D-006, FR-062).
 *
 * This is the canonical, index-locked source for the 12 crew colors. The
 * CSS custom properties in `src/app/globals.css` (`--crew-1`..`--crew-12`,
 * exposed as Tailwind tokens `--color-crew-1`..`--color-crew-12`) define
 * the SAME 12 hex values in the SAME order. There is no build step that
 * derives one from the other (Tailwind v4's CSS-first `@theme` has no JS
 * export), so **the two lists must be kept in sync by hand**. If you
 * change one, change the other and re-check
 * `docs/design/calendar-palette.md` (it has the derivation script that
 * produced both, plus the contrast/CVD numbers that justify this order).
 *
 * Why the array is in THIS order (not hue order):
 * D-026 requires the same-day-cell collision rule (FR-062 AC3 — "the
 * other crew gets a non-adjacent index") to walk indices that are far
 * apart in *perceptual* distance under deuteranopia (2형 색각), not just
 * numerically adjacent. The order below is a greedy farthest-point
 * (maximin) sequencing over deuteranopia-simulated CIEDE2000 distance:
 * index i -> index i+1 (mod 12) is close to the best achievable jump at
 * that point in the sequence. Reordering this array breaks that
 * property — don't sort it, don't insert into the middle.
 *
 * This module intentionally does NOT implement `hash(crew.id) mod 12`.
 * That assignment function belongs to CREW's domain layer (a React-free
 * pure function per CLAUDE.md — the compiler only memoizes components/
 * hooks, not domain logic like this). This module only owns: the palette
 * itself, and the pure collision-resolution walk that D-026 defines,
 * both of which are "palette" concerns, not "how do we hash a crew id"
 * concerns.
 */

export interface CrewPaletteColor {
  /** 0-based index into the palette; matches --crew-{index+1} in globals.css. */
  readonly index: number;
  /** sRGB hex value, identical to the corresponding --crew-N custom property. */
  readonly hex: string;
  /** Tailwind v4 theme color token name, usable as e.g. `bg-crew-1`, `text-crew-1`. */
  readonly tailwindToken: string;
  /** CSS custom property name backing the token (defined in :root). */
  readonly cssVar: string;
  /** WCAG relative luminance (0..1) of `hex`. */
  readonly relativeLuminance: number;
  /** Contrast ratio against the light-mode background (oklch(1 0 0) / #fff). */
  readonly contrastVsLightBg: number;
  /** Contrast ratio against the dark-mode background (oklch(0.145 0 0) / ~#0a0a0a). */
  readonly contrastVsDarkBg: number;
  /** Approximate hue name, for debugging/QA readability only — not for logic. */
  readonly approxHueName: string;
}

/**
 * Canonical 12-color palette, in collision-walk order (see module doc).
 * Source: docs/design/calendar-palette.md (deuteranopia CIEDE2000 +
 * farthest-point ordering, window Y in [0.109, 0.300] derived from this
 * repo's actual --background tokens). All 12 pass >= 3:1 (NFR-018
 * non-text) against both the light and dark --background token.
 */
export const CREW_PALETTE: readonly CrewPaletteColor[] = [
  { index: 0, hex: "#939300", approxHueName: "olive", relativeLuminance: 0.2707, contrastVsLightBg: 3.27, contrastVsDarkBg: 6.05 },
  { index: 1, hex: "#8d1cff", approxHueName: "violet", relativeLuminance: 0.1371, contrastVsLightBg: 5.61, contrastVsDarkBg: 3.53 },
  { index: 2, hex: "#ff3e9e", approxHueName: "pink", relativeLuminance: 0.2717, contrastVsLightBg: 3.26, contrastVsDarkBg: 6.07 },
  { index: 3, hex: "#007475", approxHueName: "teal", relativeLuminance: 0.1378, contrastVsLightBg: 5.59, contrastVsDarkBg: 3.54 },
  { index: 4, hex: "#3b7500", approxHueName: "green", relativeLuminance: 0.1365, contrastVsLightBg: 5.63, contrastVsDarkBg: 3.52 },
  { index: 5, hex: "#8080ff", approxHueName: "periwinkle", relativeLuminance: 0.2725, contrastVsLightBg: 3.26, contrastVsDarkBg: 6.08 },
  { index: 6, hex: "#00a352", approxHueName: "emerald", relativeLuminance: 0.2680, contrastVsLightBg: 3.30, contrastVsDarkBg: 6.00 },
  { index: 7, hex: "#009200", approxHueName: "green (deep)", relativeLuminance: 0.2056, contrastVsLightBg: 4.11, contrastVsDarkBg: 4.82 },
  { index: 8, hex: "#007af5", approxHueName: "blue", relativeLuminance: 0.2051, contrastVsLightBg: 4.12, contrastVsDarkBg: 4.81 },
  { index: 9, hex: "#dc00dc", approxHueName: "magenta", relativeLuminance: 0.2038, contrastVsLightBg: 4.14, contrastVsDarkBg: 4.79 },
  { index: 10, hex: "#c36200", approxHueName: "brown/orange", relativeLuminance: 0.2034, contrastVsLightBg: 4.14, contrastVsDarkBg: 4.78 },
  { index: 11, hex: "#d20000", approxHueName: "red", relativeLuminance: 0.1370, contrastVsLightBg: 5.61, contrastVsDarkBg: 3.53 },
].map((c) => ({
  ...c,
  tailwindToken: `crew-${c.index + 1}`,
  cssVar: `--crew-${c.index + 1}`,
}));

export const CREW_PALETTE_SIZE = CREW_PALETTE.length; // 12

/**
 * Normalizes any integer (including a raw `hash(crew.id)` before its own
 * `% 12`, or a negative number) into a valid palette index.
 */
export function normalizePaletteIndex(n: number): number {
  return ((n % CREW_PALETTE_SIZE) + CREW_PALETTE_SIZE) % CREW_PALETTE_SIZE;
}

/** Looks up a palette entry by index (wraps via {@link normalizePaletteIndex}). */
export function getCrewColor(index: number): CrewPaletteColor {
  return CREW_PALETTE[normalizePaletteIndex(index)];
}

/**
 * FR-062 AC3 / D-026 same-day-cell collision resolution.
 *
 * Given the index a crew would normally get (`baseIndex`, from
 * `hash(crew.id) mod 12`) and the set of indices already showing in that
 * date cell (`occupiedIndices`), returns the first free index walking
 * forward through the palette's collision-walk order — i.e. the order
 * this array is already in, which is deuteranopia-ΔE-maximized, not raw
 * numeric adjacency (that was D-006's original rule; D-026 replaced it
 * because index distance != perceptual distance).
 *
 * Pure function: no React, no DOM, no Supabase — safe to call from a
 * server component, a Server Action, or CREW's hashing module.
 *
 * Global uniqueness is NOT guaranteed (impossible past 12 concurrent
 * crews in one cell, D-014/R-017) — this only avoids the collision
 * within the single cell being rendered, retrying up to
 * {@link CREW_PALETTE_SIZE} steps before giving up and returning
 * `baseIndex` unchanged (all colors occupied — caller/UI should already
 * be relying on the crew-name label + aria-label at that point, since
 * NFR-019 treats those as mandatory regardless of color).
 */
export function resolveCrewColorCollision(
  baseIndex: number,
  occupiedIndices: Iterable<number>,
): number {
  const occupied = new Set<number>();
  for (const i of occupiedIndices) occupied.add(normalizePaletteIndex(i));

  const start = normalizePaletteIndex(baseIndex);
  for (let step = 0; step < CREW_PALETTE_SIZE; step++) {
    const candidate = normalizePaletteIndex(start + step);
    if (!occupied.has(candidate)) return candidate;
  }
  return start; // all 12 occupied in this cell; label/aria-label carry the load
}
