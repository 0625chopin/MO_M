"use client";

import { useSyncExternalStore } from "react";

/**
 * 여러 도메인이 공유하는 뷰포트 미디어 쿼리 훅 — 첫 소비처는 `DayDetailPanel`(Task 021B,
 * FR-063 "데스크톱: 사이드 / 모바일: 바텀시트")이다. `useSyncExternalStore`를 쓰는 이유는
 * `useState` + `useEffect` 조합보다 이 훅의 실제 요구사항(외부 브라우저 상태를 구독하고,
 * 서버 렌더와 첫 클라이언트 렌더가 반드시 일치해야 함)에 더 정확히 맞기 때문이다 —
 * `getServerSnapshot`이 항상 `false`를 반환해 SSR·하이드레이션 시점에는 "데스크톱 아님"으로
 * 통일하고, 실제 값은 마운트 후 `matchMedia` 리스너가 갱신한다(하이드레이션 불일치 경고 방지,
 * `I-037`이 지적한 "정적 검사로 못 잡는 런타임 결함" 사례를 재발시키지 않으려는 선택).
 *
 * React Compiler가 훅 자체를 메모이즈하므로 내부에서 수동 `useMemo`/`useCallback`을 쓰지
 * 않는다(D-029) — `subscribe`/`getSnapshot` 클로저는 매 렌더 새로 만들어도 `useSyncExternalStore`
 * 계약상 문제가 없다(구독은 `useEffect`와 같은 타이밍에 정리·재구독된다).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
