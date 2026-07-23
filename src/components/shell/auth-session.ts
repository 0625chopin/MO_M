import type { Id } from "@/lib/types";

/**
 * 인증 경계(D-030 ④)가 소비하는 세션 타입 + 순수 판정 함수. `next/headers`(서버 전용 API)를
 * import하지 않는다 — `HeaderNav`·`MobileTabBar`·`nav-items.ts`가 전부 `'use client'`라
 * 이 모듈을 값(함수) 단위로 import하며, 서버 전용 API가 섞이면 클라이언트 번들이 깨진다
 * (실제로 처음에는 `getAuthSession()`을 이 파일에 뒀다가 `next build`에서 "next/headers를
 * Pages Router에서 쓴다"는 오류로 드러났다 — 원인은 App Router의 클라이언트 번들링 경계였다).
 * 실제 쿠키 조회 함수는 `get-auth-session.ts`(서버 컴포넌트 전용)로 분리했다.
 *
 * - `loading`: 서버 컴포넌트 렌더 시점에는 실제로 발생하지 않는다(세션은 렌더 전에 이미
 *   동기적으로 확정된다). 다만 이후 클라이언트에서 Supabase Auth 상태 변화를 구독하는 훅이
 *   이 타입을 재사용할 때를 대비해 미리 정의해 둔다. `/sample`에서 로딩 상태 토글로 쓴다.
 * - `error`: 네트워크 실패(`network`)뿐 아니라 RLS 403류의 **도메인 오류**(`forbidden`)를
 *   포함한다(D-030 ③). 셸은 오류 상태에서도 크래시하지 않고 게스트 안전값으로 내비게이션을
 *   내려야 한다 — `nav-items.ts`가 `error`를 `guest`와 동일하게 취급하는 이유다.
 * - `profileId`(`authenticated`에만 존재): `lib/data`의 9개 도메인 함수가 전부 `profileId`를
 *   인자로 받는 계약(CON-06)이라, 다음 회차에 컨테이너를 만드는 사람이 세션에서 바로
 *   꺼내 `lib/data` 호출에 넘길 수 있어야 한다(3일차 교차검증에서 DESIGN이 자체 발견, 팀장
 *   지시로 이번 회차에 처리). **판별 유니온이라 `loading`/`guest`/`error`에는 이 필드 자체가
 *   없다** — 컴파일 타임에 "미인증 상태에서 profileId를 읽으려는" 실수를 막는다.
 */
export type AuthSession =
  | { status: "loading" }
  | { status: "guest" }
  | {
      status: "authenticated";
      profileId: Id;
      displayName: string;
      /** 최초 1회 온보딩 재방문 리다이렉트(PRD §2.2 각주2)에 쓴다. */
      hasCompletedOnboarding: boolean;
      unreadNotificationCount: number;
    }
  | { status: "error"; reason: "network" | "forbidden" };

/** `session.status === "authenticated"`를 좁혀 준다. 로그인 필요 페이지 가드에서 쓴다. */
export function isAuthenticated(
  session: AuthSession,
): session is Extract<AuthSession, { status: "authenticated" }> {
  return session.status === "authenticated";
}
