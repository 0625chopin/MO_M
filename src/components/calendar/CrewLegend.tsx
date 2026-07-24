import { crewCertaintyVars } from "@/lib/crew-palette";
import { cn } from "@/lib/utils";

import type { CSSProperties } from "react";

/**
 * 크루 색 스와치 + 크루명 라벨(D-026 "색은 보조 신호일 뿐이며 크루명 텍스트 라벨을 반드시
 * 병기한다") — Task 021B. `CrewFilterPanel`(필터 체크박스 각 행)과 `DayDetailPanel`(모임
 * 목록 각 행)이 함께 쓰는 표현 컴포넌트다. `MeetupBar.tsx`처럼 색 계산은 하지 않는다 —
 * `colorIndex`는 호출자가 이미 결정한 값이다(크루 필터는 `Crew.colorKey` 그대로, `DayDetailPanel`은
 * 그날 셀의 D-026 충돌 회피까지 끝난 값).
 *
 * 서버·클라이언트 어디서든 쓸 수 있도록 `"use client"`를 붙이지 않는다 — 상태도 이벤트 핸들러도
 * 없는 순수 표현 컴포넌트다.
 */
export interface CrewLegendProps {
  crewName: string;
  colorIndex: number;
  /** 필터에서 꺼진 크루처럼 시각적으로 흐리게 보여줄 때. */
  dimmed?: boolean;
  className?: string;
}

export function CrewLegend({ crewName, colorIndex, dimmed, className }: CrewLegendProps) {
  const vars = crewCertaintyVars(colorIndex) as CSSProperties;
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      {/* `certainty-confirmed`(globals.css)이 `--crew-color`를 배경으로 칠한다 — MeetupBar와
       *  같은 유틸리티라 스와치와 바가 항상 같은 값을 그린다(두 곳에 색 계산을 따로 두지 않는다). */}
      <span
        aria-hidden="true"
        className={cn(
          "certainty-confirmed size-2.5 shrink-0 rounded-full",
          dimmed && "opacity-40",
        )}
        style={vars}
      />
      <span
        className={cn("truncate text-sm text-foreground", dimmed && "text-muted-foreground")}
      >
        {crewName}
      </span>
    </span>
  );
}
