"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  empty: "빈 상태",
  error: "오류",
};

/**
 * 등록된 컴포넌트의 **기본·로딩·빈·오류** 4상태를 토글로 보여준다(`docs/CONVENTIONS.md`
 * "`/sample` 4상태 규칙"). 호출부(Server Component일 수 있는 `sample/page.tsx`)가 상태별로
 * 이미 렌더링한 `ReactNode`를 `panels`로 넘긴다 — 함수(render prop)를 넘기지 않는 이유는
 * Server → Client Component 경계에서 함수 props가 직렬화되지 않기 때문이다. 일부 상태만
 * 의미가 있는 컴포넌트는 `panels`에서 해당 키를 생략하면 토글에서도 빠진다.
 *
 * **디자인 개편에서 바뀐 것**: 손으로 짠 `role="tablist"` + `<button role="tab">` 구현을
 * shadcn `Tabs`(Base UI)로 교체했다. 기존 구현은 ARIA 역할만 붙고 **키보드 동작이 없었다** —
 * 탭 패턴은 좌우 화살표로 탭을 옮기고 Tab 키는 패널로 빠져나가는 roving tabindex가 규약인데,
 * 그게 없으면 스크린 리더 사용자에게 "탭"이라고 알려 놓고 탭처럼 움직이지 않는 위젯이 된다
 * (NFR-020 키보드 전용 조작). 프리미티브가 그 동작을 제공한다.
 */
export function StatePreview({
  panels,
  className,
}: {
  panels: Partial<Record<SampleState, ReactNode>>;
  className?: string;
}) {
  const available = STATE_ORDER.filter((s) => panels[s] !== undefined);
  if (available.length === 0) return null;

  return (
    <Tabs defaultValue={available[0]} className={cn("gap-3", className)}>
      <TabsList aria-label="상태 전환" variant="line">
        {available.map((s) => (
          <TabsTrigger key={s} value={s} className="px-2.5 text-xs">
            {STATE_LABELS[s]}
          </TabsTrigger>
        ))}
      </TabsList>
      {available.map((s) => (
        <TabsContent key={s} value={s}>
          {panels[s]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
