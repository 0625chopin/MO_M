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
 * This module intentionally does NOT implement `hash(crew.id) mod 12`, nor
 * (as of Task 009B, 3일차) the D-026 same-cell collision walk anymore —
 * both are "judgment" functions and now live in
 * `src/lib/rules/crew-color-hash.ts` (`crewColorIndex`,
 * `resolveCrewColorCollision`, `assignCrewColorForDateCell`). This module
 * keeps only the palette **data** (hex/luminance/contrast/token, index-locked
 * to `globals.css`) and `normalizePaletteIndex` — the latter stays here
 * (not moved to `lib/rules/`) because it's a bounds-wrap over this array's
 * own size (`CREW_PALETTE_SIZE`), used by the plain data-lookup function
 * `getCrewColor` below regardless of any hashing/collision decision. Moving
 * it would make this data module depend on the judgment module, which is
 * backwards — `lib/rules/crew-color-hash.ts` importing `CREW_PALETTE_SIZE`/
 * `normalizePaletteIndex` **from here** is the natural direction. See that
 * file's module doc for the full 1일차→3일차 migration rationale, and
 * `docs/CONVENTIONS.md` / `src/lib/rules/README.md` for the record.
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
  /**
   * Which text color to put ON TOP of this color when it is used as a FILL —
   * the `certainty-confirmed` state in `globals.css` (see the design-language
   * doc). `"ink"` = the dark ink (`--crew-text-ink`), `"paper"` = the light one
   * (`--crew-text-paper`).
   *
   * Why this is data and not a runtime calculation: the 12 luminances span
   * 0.1365–0.2725, so no single text color clears 4.5:1 (NFR-018 text) on all
   * of them. The thresholds are Y <= 0.175 -> paper and Y >= 0.1833 -> ink, and
   * no palette entry falls in the gap between them. Measured contrast for the
   * chosen color is in {@link contrastOnFill}; the worst case is 4.68.
   *
   * Like the palette itself, this is a SINGLE value for light and dark mode
   * (D-026) — it depends only on the fill color, not on the page background.
   */
  readonly textOn: "ink" | "paper";
  /** CSS custom property backing {@link textOn}, ready to drop into `--crew-text`. */
  readonly textCssVar: "--crew-text-ink" | "--crew-text-paper";
  /** Contrast ratio of the {@link textOn} color against this color as a fill. */
  readonly contrastOnFill: number;
  /** Approximate hue name, for debugging/QA readability only — not for logic. */
  readonly approxHueName: string;
  /**
   * Korean color name for screen-reader-facing labels (e.g. a color-swatch radio's
   * `aria-label`) — a direct Korean translation of {@link approxHueName}. This is palette
   * *data* colocated with `hex`/`approxHueName`, not a UI copy string, so it lives here
   * instead of `lib/strings/ko.ts` (10일차 접근성 QA 후속 조치, Task 017B 이슈 D — team-lead
   * directive: this module is the crew-domain shared source, and the name is tied 1:1 to
   * the fixed palette entry rather than varying per feature/screen like normal UI copy).
   * If a non-Korean locale is ever added, these 12 values need their own translation pass
   * same as any other locale-bound string.
   */
  readonly nameKo: string;
}

/**
 * Canonical 12-color palette, in collision-walk order (see module doc).
 * Source: docs/design/calendar-palette.md (deuteranopia CIEDE2000 +
 * farthest-point ordering, window Y in [0.109, 0.300] derived from this
 * repo's actual --background tokens). All 12 pass >= 3:1 (NFR-018
 * non-text) against both the light and dark --background token.
 */
export const CREW_PALETTE: readonly CrewPaletteColor[] = [
  { index: 0, hex: "#939300", approxHueName: "olive", nameKo: "올리브색", relativeLuminance: 0.2707, contrastVsLightBg: 3.27, contrastVsDarkBg: 6.05, textOn: "ink", contrastOnFill: 5.93 },
  { index: 1, hex: "#8d1cff", approxHueName: "violet", nameKo: "보라색", relativeLuminance: 0.1371, contrastVsLightBg: 5.61, contrastVsDarkBg: 3.53, textOn: "paper", contrastOnFill: 5.37 },
  { index: 2, hex: "#ff3e9e", approxHueName: "pink", nameKo: "분홍색", relativeLuminance: 0.2717, contrastVsLightBg: 3.26, contrastVsDarkBg: 6.07, textOn: "ink", contrastOnFill: 5.95 },
  { index: 3, hex: "#007475", approxHueName: "teal", nameKo: "청록색", relativeLuminance: 0.1378, contrastVsLightBg: 5.59, contrastVsDarkBg: 3.54, textOn: "paper", contrastOnFill: 5.36 },
  { index: 4, hex: "#3b7500", approxHueName: "green", nameKo: "초록색", relativeLuminance: 0.1365, contrastVsLightBg: 5.63, contrastVsDarkBg: 3.52, textOn: "paper", contrastOnFill: 5.39 },
  { index: 5, hex: "#8080ff", approxHueName: "periwinkle", nameKo: "연보라색", relativeLuminance: 0.2725, contrastVsLightBg: 3.26, contrastVsDarkBg: 6.08, textOn: "ink", contrastOnFill: 5.96 },
  { index: 6, hex: "#00a352", approxHueName: "emerald", nameKo: "에메랄드색", relativeLuminance: 0.2680, contrastVsLightBg: 3.30, contrastVsDarkBg: 6.00, textOn: "ink", contrastOnFill: 5.88 },
  { index: 7, hex: "#009200", approxHueName: "green (deep)", nameKo: "짙은 초록색", relativeLuminance: 0.2056, contrastVsLightBg: 4.11, contrastVsDarkBg: 4.82, textOn: "ink", contrastOnFill: 4.72 },
  { index: 8, hex: "#007af5", approxHueName: "blue", nameKo: "파란색", relativeLuminance: 0.2051, contrastVsLightBg: 4.12, contrastVsDarkBg: 4.81, textOn: "ink", contrastOnFill: 4.72 },
  { index: 9, hex: "#dc00dc", approxHueName: "magenta", nameKo: "마젠타색", relativeLuminance: 0.2038, contrastVsLightBg: 4.14, contrastVsDarkBg: 4.79, textOn: "ink", contrastOnFill: 4.69 },
  { index: 10, hex: "#c36200", approxHueName: "brown/orange", nameKo: "갈색", relativeLuminance: 0.2034, contrastVsLightBg: 4.14, contrastVsDarkBg: 4.78, textOn: "ink", contrastOnFill: 4.68 },
  { index: 11, hex: "#d20000", approxHueName: "red", nameKo: "빨간색", relativeLuminance: 0.1370, contrastVsLightBg: 5.61, contrastVsDarkBg: 3.53, textOn: "paper", contrastOnFill: 5.38 },
].map((c) => ({
  ...c,
  textOn: c.textOn as "ink" | "paper",
  textCssVar: (c.textOn === "ink" ? "--crew-text-ink" : "--crew-text-paper") as
    | "--crew-text-ink"
    | "--crew-text-paper",
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
 * The two inline CSS custom properties that the `certainty-draft` /
 * `certainty-pending` / `certainty-confirmed` utilities in `globals.css` read.
 * Spread the result into a `style` prop:
 *
 * ```tsx
 * <span className="certainty-confirmed" style={crewCertaintyVars(i) as CSSProperties}>
 * ```
 *
 * The cast is needed because React's `CSSProperties` still doesn't admit custom
 * properties. This returns a plain string map (not `CSSProperties`) on purpose —
 * `src/lib/` stays free of React types.
 *
 * Why a helper instead of letting call sites write the two vars themselves: the
 * fill color and the text color on top of it are a MATCHED PAIR (see
 * {@link CrewPaletteColor.textOn}). Picking the fill without the matching text
 * color is how a 4.5:1 violation gets shipped, and it wouldn't be visible in
 * light mode testing alone.
 */
export function crewCertaintyVars(
  index: number,
): Record<"--crew-color" | "--crew-text", string> {
  const color = getCrewColor(index);
  return {
    "--crew-color": `var(${color.cssVar})`,
    "--crew-text": `var(${color.textCssVar})`,
  };
}

// `resolveCrewColorCollision` (FR-062 AC3 / D-026 same-day-cell collision
// resolution) moved to `src/lib/rules/crew-color-hash.ts` in Task 009B
// (3일차) — it's a judgment function (D-026's collision-avoidance decision),
// not palette data. See that file's module doc for the migration rationale
// and `docs/CONVENTIONS.md` / `src/lib/rules/README.md` for the record.
