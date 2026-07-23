
import { strings } from "@/lib/strings";

import { HeaderNav } from "./HeaderNav";
import { MobileTabBar } from "./MobileTabBar";

import type { AuthSession } from "./auth-session";
import type { ReactNode } from "react";

/**
 * 전역 앱 셸(Task 011, D-030 ④). `src/app/layout.tsx`가 `getAuthSession()`으로 조회한 세션을
 * props로 내려주는 표현 컴포넌트다 — 이 컴포넌트 자신은 데이터를 조회하지 않는다(D-030 ①).
 * `layout.tsx`가 사실상 컨테이너 역할을 하므로 별도 `AppShellContainer.tsx`를 두지 않았다
 * (근거는 보고 "설계 결정" 참고).
 *
 * 360/768/1280 3종 뷰포트(NFR-026)에서 성립해야 한다: 데스크톱은 `HeaderNav`의 인라인 링크,
 * 모바일은 하단 고정 `MobileTabBar`가 1차 내비게이션을 맡는다. 콘텐츠 래퍼에 `pb-16 md:pb-0`을
 * 줘 모바일에서 하단 탭바에 콘텐츠가 가리지 않게 한다.
 *
 * 콘텐츠 래퍼는 `<main>`이 아니라 `<div id="main-content">`다 — 19개 페이지가 이미 각자
 * `<main>`을 렌더링하고 있어(CREW 2일차 산출물), 여기서도 `<main>`을 쓰면 페이지마다 `<main>`
 * 랜드마크가 중첩되어 스크린 리더 내비게이션이 깨진다(HTML 표준상 `<main>` 중첩 금지). 스킵
 * 링크의 이동 대상 역할만 이 `div`가 맡고, 실제 `<main>` 랜드마크 소유권은 각 페이지에 둔다.
 *
 * `showSkipLink`(기본 `true`)를 `false`로 주면 스킵 링크와 `id="main-content"`를 렌더링하지
 * 않는다 — `/sample`이 `PreviewFrame` 안에 이 컴포넌트를 데모로 여러 번 그릴 때 쓴다. 실제
 * 페이지를 감싸는 루트 인스턴스(`src/app/layout.tsx`)는 항상 기본값(`true`)을 쓴다. 이 스위치가
 * 없으면 `id="main-content"`가 문서에 중복되고(HTML 표준 위반) 스킵 링크도 두 벌 생겨 키보드
 * 사용자가 Tab 첫 포커스에서 어디로 이동하는지 예측할 수 없다(3일차 교차검증, CREW 실측 지적).
 */
export function AppShell({
  session,
  children,
  showSkipLink = true,
}: {
  session: AuthSession;
  children: ReactNode;
  showSkipLink?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {showSkipLink && (
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground"
        >
          {strings.common.actions.skipToContent}
        </a>
      )}

      <HeaderNav session={session} />

      {/* 모바일 하단 여백은 탭바 높이(3.5rem)와 iOS 홈 인디케이터 영역을 함께 비운다 —
          `MobileTabBar`가 같은 `env(safe-area-inset-bottom)`을 쓰므로 두 값은 함께 움직인다.
          개편 전 고정 `pb-16`은 safe-area가 있는 기기에서 마지막 콘텐츠가 탭바에 가렸다. */}
      <div
        id={showSkipLink ? "main-content" : undefined}
        className="flex flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0"
      >
        {children}
      </div>

      <MobileTabBar session={session} />
    </div>
  );
}
