import { crewCertaintyVars } from "@/lib/crew-palette";
import { cn } from "@/lib/utils";

import type { CSSProperties } from "react";

/**
 * 크루의 배정된 팔레트 색을 작은 점으로 보여준다(D-006·D-026). `MeetupBar.tsx`와 같은 이유로
 * 색 계산은 여기 없다 — 호출자가 이미 결정한 `colorIndex`(크루의 `colorKey`)를 조회만 한다.
 * `--background`/`--card` 표면 위에서만 쓴다(디자인 토큰 규칙 — UI 크롬에 유채색을 쓰지
 * 않는다, 예외는 크루색 자신).
 *
 * **`certainty-confirmed` 유틸리티(`globals.css`)를 그대로 쓴다** — `MeetupBar.tsx`·
 * `CrewLegend.tsx`(Task 021B, DESIGN)와 같은 이유다. 처음엔 `backgroundColor:
 * "var(--crew-color)"`를 직접 인라인했는데, 텍스트가 없는 점 하나라 시각 결과는 같아도
 * 크루색 채움을 매번 이 유틸리티 하나로 통일해 둔 규칙(D-026)에서 벗어난 재구현이었다 —
 * DESIGN의 `CrewLegend`를 검증하다 발견해 이 파일에서 바로잡았다.
 */
export function CrewColorDot({ colorIndex, className }: { colorIndex: number; className?: string }) {
  const vars = crewCertaintyVars(colorIndex) as CSSProperties;
  return (
    <span
      aria-hidden="true"
      className={cn("certainty-confirmed inline-block size-3 shrink-0 rounded-full", className)}
      style={vars}
    />
  );
}
