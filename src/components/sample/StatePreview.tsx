"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import type { ReactNode } from "react";


const STATE_ORDER = ["default", "loading", "empty", "error"] as const;
export type SampleState = (typeof STATE_ORDER)[number];

// /sample은 SC-01~22 제품 화면이 아니라 내부 개발 도구 페이지라, 이 토글 라벨은
// NFR-023(문자열 모듈 경유) 적용 대상 밖이다(팀장 판정 완료, 2026-07-24) — 근거는
// sample/page.tsx 상단 주석 참고. 제품 컴포넌트 문구까지 이 예외를 넓혀 쓰지 말 것.
const STATE_LABELS: Record<SampleState, string> = {
  default: "기본",
  loading: "로딩",
  empty: "빈",
  error: "오류",
};

/**
 * 등록된 컴포넌트의 **기본·로딩·빈·오류** 4상태를 토글로 보여준다(`docs/CONVENTIONS.md`
 * "`/sample` 4상태 규칙"). 호출부(Server Component일 수 있는 `sample/page.tsx`)가 상태별로
 * 이미 렌더링한 `ReactNode`를 `panels`로 넘긴다 — 함수(render prop)를 넘기지 않는 이유는
 * Server → Client Component 경계에서 함수 props가 직렬화되지 않기 때문이다. 일부 상태만
 * 의미가 있는 컴포넌트는 `panels`에서 해당 키를 생략하면 토글에서도 빠진다.
 */
export function StatePreview({
  panels,
  className,
}: {
  panels: Partial<Record<SampleState, ReactNode>>;
  className?: string;
}) {
  const available = STATE_ORDER.filter((s) => panels[s] !== undefined);
  const [state, setState] = useState<SampleState>(available[0] ?? "default");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div role="tablist" aria-label="상태 전환" className="flex flex-wrap gap-1.5">
        {available.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={state === s}
            onClick={() => setState(s)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              state === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {STATE_LABELS[s]}
          </button>
        ))}
      </div>
      <div role="tabpanel">{panels[state]}</div>
    </div>
  );
}
