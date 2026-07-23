import { cookies } from "next/headers";

import type { AuthSession } from "./auth-session";

/**
 * Mock 세션 조회 — 실제 인증 스택(Task 029A/030, I-016 차단)이 들어오기 전까지의 자리표시자.
 * `next/headers`를 쓰므로 **서버 컴포넌트에서만** import한다(`src/app/layout.tsx`와 로그인
 * 상태 가드가 필요한 4개 페이지: 랜딩·온보딩·로그인·회원가입). 표현 컴포넌트(`HeaderNav`
 * 등)는 이 함수가 아니라 `AuthSession` 타입만 props로 받는다(D-030 ①) — 타입·판정 함수는
 * `auth-session.ts`에 따로 있다(클라이언트 번들에도 안전하게 섞일 수 있게 분리했다).
 *
 * 이 함수 **본문만** 실제 Supabase 세션 조회로 교체될 자리다(예: `supabase.auth.getUser()` 결과를
 * 같은 `AuthSession` 유니온으로 매핑). 호출부(레이아웃·페이지)와 반환 타입은 그대로 두고
 * "데이터 조회 부분만 교체"하는 것이 CLAUDE.md Mock First 원칙의 실제 적용 지점이다.
 *
 * 로그인 폼이 아직 없어(Task 030) 정상 경로로는 항상 `guest`를 반환한다. QA가 인증 상태 화면을
 * 미리 확인하려면 브라우저 쿠키에 `mo_im_mock_session`을
 * `{"status":"authenticated","profileId":"profile-1","displayName":"...","hasCompletedOnboarding":true,"unreadNotificationCount":0}`
 * 형태의 JSON 문자열로 수동 설정한다(제품 기능 아님, 개발 편의 훅). `profileId`를 생략하면
 * `MOCK_FALLBACK_PROFILE_ID`(아래)로 채운다 — `lib/data`의 9개 도메인 함수가 전부 `profileId`를
 * 인자로 받는 계약(CON-06)이라, 다음 회차 컨테이너가 이 필드를 그대로 그 호출에 넘길 수
 * 있어야 한다(3일차 교차검증에서 DESIGN이 자체 발견, 팀장 지시로 처리). 이 파일은 `lib/data`를
 * import하지 않는다(CORE 소관 경계 — Task 011 파일 소유권 규칙) — 아래 상수는 문자열 리터럴로만
 * `src/lib/data/mock/fixtures.ts`의 시드 `profile-1`("서지훈")과 값만 맞춘 것이다.
 */
export async function getAuthSession(): Promise<AuthSession> {
  const MOCK_SESSION_COOKIE = "mo_im_mock_session";
  /** `src/lib/data/mock/fixtures.ts`의 시드 profile-1과 값을 맞췄다(위 docstring 참고). */
  const MOCK_FALLBACK_PROFILE_ID = "profile-1";

  const cookieStore = await cookies();
  const raw = cookieStore.get(MOCK_SESSION_COOKIE)?.value;
  if (!raw) {
    return { status: "guest" };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "status" in parsed &&
      parsed.status === "authenticated" &&
      "displayName" in parsed &&
      typeof parsed.displayName === "string"
    ) {
      const candidate = parsed as Record<string, unknown>;
      return {
        status: "authenticated",
        profileId:
          typeof candidate.profileId === "string" ? candidate.profileId : MOCK_FALLBACK_PROFILE_ID,
        displayName: candidate.displayName as string,
        hasCompletedOnboarding: Boolean(candidate.hasCompletedOnboarding),
        unreadNotificationCount:
          typeof candidate.unreadNotificationCount === "number"
            ? candidate.unreadNotificationCount
            : 0,
      };
    }
  } catch {
    // 잘못된 쿠키 값은 오류를 던지지 않고 게스트로 안전하게 폴백한다.
  }

  return { status: "guest" };
}
