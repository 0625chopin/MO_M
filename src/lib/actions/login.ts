"use server";

import { redirect } from "next/navigation";

import { setMockSessionCookie } from "@/components/shell/set-mock-session-cookie";
import { evaluateLoginLockout, isValidEmailFormat } from "@/lib/rules/auth-credentials";
import { strings } from "@/lib/strings";

/**
 * FR-002 로그인 Server Action. `LoginForm`이 `useActionState(loginAction, ...)`로 건다.
 *
 * **Mock 데모 계정** — 실 계정 저장소가 없는 이유는 `signup.ts` 모듈 docstring과 같다
 * (CON-06, Task 026 이전). `profileId`는 `fixtures.ts` 시드와 값을 맞췄다 — 이 계정으로
 * 로그인하면 이미 데이터가 채워진 크루·게시글·알림을 그대로 볼 수 있다.
 *
 * **`CLAUDE.md`의 「테스트계정」과는 용도가 다르다.** 그쪽 1번(`chopin0625`/`0625chopin`)은
 * 실제 Supabase Auth 연동(Task 026 이후) 대상이고, 여기 있는 계정은 그 전까지 Mock 로그인
 * 흐름(화면 상태 시연)만을 위한 것이다. `CLAUDE.md`는 이 값을 복사하지 않고 이 파일을
 * 가리키기만 한다 — **`MOCK_DEMO_ACCOUNTS`가 Mock 데모 계정의 단일 소스다.** 값을 바꾸면
 * 여기만 고치면 되고, Task 026에서 실 인증으로 교체할 때 이 상수를 통째로 제거한다.
 */
const MOCK_DEMO_ACCOUNTS: ReadonlyArray<{
  email: string;
  password: string;
  profileId: string;
  displayName: string;
}> = [
  {
    email: "seo_runs@example.com",
    password: "runrun25",
    profileId: "profile-1",
    displayName: "서지훈",
  },
  {
    email: "yuna_book@example.com",
    password: "runrun25",
    profileId: "profile-2",
    displayName: "김유나",
  },
];

/** FR-002 E2·AC4(D-020) 잠금 화면 상태 데모 전용 예약 이메일. 비밀번호와 무관하게 항상
 *  잠금 결과를 반환한다 — 실제 5회 실패 카운터는 없다("v0.1(Mock)에서는 잠금 화면 상태만
 *  만든다"). `evaluateLoginLockout`(재사용 대상 순수 함수)에는 5회의 최근 실패 이력을
 *  합성해 넘긴다. */
const MOCK_LOCKED_DEMO_EMAIL = "locked-demo@example.com";

export interface LoginFormState {
  formError?: string;
}

// 초기 상태 상수는 여기 두지 않는다 — `'use server'` 파일은 async 함수만 export할 수 있다
// (signup.ts 모듈 docstring 참고). `LoginForm`이 `LoginFormState` 타입만 가져다 직접 만든다.

/** `redirectTo`는 hidden input을 통해 클라이언트가 넘기는 값이라 신뢰할 수 없다(Next.js
 *  Server Actions 문서 "Validate inputs"). 오픈 리다이렉트를 막기 위해 앱 내부의 단일
 *  슬래시 경로만 허용한다 — `//evil.com`(프로토콜 상대 URL)·`https://...` 전부 거부하고
 *  기본값(`/home`)으로 대체한다. */
function sanitizeRedirectTarget(candidate: string): string {
  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }
  return "/home";
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = sanitizeRedirectTarget(String(formData.get("redirectTo") ?? ""));

  if (!isValidEmailFormat(email) || password.length === 0) {
    // FR-002 E1 — 형식이 애초에 틀려도 "어느 필드가 문제인지"는 알려주지 않는다.
    return { formError: strings.auth.login.genericError };
  }

  if (email.toLowerCase() === MOCK_LOCKED_DEMO_EMAIL) {
    const now = new Date().toISOString();
    const syntheticRecentFailures = Array.from({ length: 5 }, (_, i) => ({
      attemptedAt: new Date(Date.parse(now) - i * 60_000).toISOString(),
      succeeded: false,
    }));
    if (evaluateLoginLockout(syntheticRecentFailures, now).locked) {
      return { formError: strings.auth.login.lockedNotice };
    }
  }

  const account = MOCK_DEMO_ACCOUNTS.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
  );
  if (!account || account.password !== password) {
    // 계정 없음과 비밀번호 불일치를 같은 메시지로 합친다(FR-002 E1 "구분하지 않는 단일 메시지").
    return { formError: strings.auth.login.genericError };
  }

  await setMockSessionCookie({
    profileId: account.profileId,
    displayName: account.displayName,
    // 데모 계정은 이미 가입을 마친 기존 사용자로 취급한다 — 로그인 성공마다 온보딩으로
    // 되돌리면 FR-002 AC1(보호 라우트 접근)을 시연할 수 없다.
    hasCompletedOnboarding: true,
    unreadNotificationCount: 0,
  });

  redirect(redirectTo);
}
