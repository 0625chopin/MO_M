import { cookies } from "next/headers";

import type { AuthSession } from "./auth-session";

/**
 * Mock 세션 쿠키 **작성** — `get-auth-session.ts`(읽기)와 짝을 이룬다. Task 015A(회원가입·
 * 로그인·온보딩)가 처음으로 실제 "로그인 상태를 만드는" 코드라 이 헬퍼를 새로 뺐다 —
 * 쿠키 이름·JSON 스키마를 이 파일과 `get-auth-session.ts` 두 곳에 흩어 두면 필드 하나만
 * 바뀌어도 어긋나기 쉽다(예: `hasCompletedOnboarding`을 불리언이 아니라 문자열로 잘못
 * 직렬화하면 읽는 쪽만 고쳐서는 못 잡는다).
 *
 * **서버 전용이다** — `next/headers`의 `cookies()`는 Server Action·Route Handler에서만
 * 쓸 수 있다(App Router 문서, 렌더 중 쓰기 불가). `src/lib/actions/signup.ts`·`login.ts`·
 * `complete-onboarding.ts`가 이 함수를 호출한다. `get-auth-session.ts`처럼 "CORE 소관 경계"
 * 규칙을 그대로 따라 `lib/data`는 import하지 않는다 — 이 함수는 세션 *표현*만 다루고, 프로필
 * 레코드 생성·수정은 호출자가 먼저 `lib/data`로 끝낸 뒤 그 결과(`profileId`·`displayName`)를
 * 인자로 넘긴다.
 *
 * 이 함수 **본문만** 실제 Supabase 세션 발급(`supabase.auth.signUp`/`signInWithPassword`
 * 결과의 쿠키 처리)으로 교체될 자리다 — 호출부(Server Action)는 "세션이 확정되면 이 함수를
 * 부른다"는 계약을 유지한 채 그대로 남는다(CLAUDE.md Mock First 원칙).
 */
const MOCK_SESSION_COOKIE = "mo_im_mock_session";

/** 세션 발급 시 넘기는 값 — `AuthSession`의 `authenticated` 분기에서 판별 태그(`status`)만 뺀
 *  나머지다. 태그는 이 함수가 항상 `"authenticated"`로 고정해서 채운다(로그인 성공 없이는
 *  아예 호출되지 않는 함수이므로 다른 값이 들어올 여지가 없다). */
export type MockAuthenticatedSessionInput = Omit<
  Extract<AuthSession, { status: "authenticated" }>,
  "status"
>;

export async function setMockSessionCookie(input: MockAuthenticatedSessionInput): Promise<void> {
  const session: AuthSession = { status: "authenticated", ...input };
  const cookieStore = await cookies();
  cookieStore.set(MOCK_SESSION_COOKIE, JSON.stringify(session), {
    path: "/",
    // 7일 유지 — FR-002 AC2 "브라우저를 닫고 7일 이내 재방문, 재로그인 없이 세션 유지"의
    // Mock 근사치다. 실 세션에서는 Supabase Auth의 refresh token 정책이 이 값을 대체한다.
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
}

/** 온보딩 완료(FR-004 일부)처럼 세션의 일부 필드만 바꿀 때 쓴다 — 전체 세션을 다시 만들지
 *  않고 기존 값에 patch만 얹는다. 인자로 현재 세션을 받는 이유는 이 파일이 `lib/data`를
 *  import하지 않아 스스로 현재 세션을 조회할 수 없기 때문이다(호출자가 `getAuthSession()`
 *  결과를 이미 갖고 있다). */
export async function patchMockSessionCookie(
  current: Extract<AuthSession, { status: "authenticated" }>,
  patch: Partial<MockAuthenticatedSessionInput>,
): Promise<void> {
  await setMockSessionCookie({ ...current, ...patch });
}

export async function clearMockSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_SESSION_COOKIE);
}
