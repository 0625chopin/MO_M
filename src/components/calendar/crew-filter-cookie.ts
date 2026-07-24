import { cookies } from "next/headers";

import { CREW_FILTER_COOKIE_NAME } from "@/components/calendar/calendar-types";

/**
 * 크루 필터 선택 쿠키의 서버 쪽 읽기 — Task 021B(FR-061 AC5, D-014·R-017).
 *
 * `next/headers`(서버 전용 API)를 쓰므로 서버 컴포넌트에서만 import한다 —
 * `get-auth-session.ts`와 같은 이유로 값(함수) 전용 모듈을 분리했다(그 파일의 모듈 docstring
 * 참고). 쓰기는 이 파일에 없다 — 이 쿠키는 인증·세션과 달리 **평범한 UI 선호도**(어떤 크루를
 * 필터에서 켜 뒀는지)일 뿐이라 `httpOnly`도 아니고 Server Action을 거칠 이유도 없다.
 * `CrewFilterPanel.tsx`(클라이언트 컴포넌트)가 토글할 때마다 `document.cookie`로 직접 쓰고
 * `router.refresh()`로 서버 재렌더를 요청한다 — 다음 방문(쿠키가 이미 브라우저에 있는 새
 * 요청)에도 이 함수가 그 값을 그대로 읽으므로 AC5 "선택은 다음 방문까지 유지된다"가 성립한다.
 *
 * 반환값은 **원본 문자열 그대로**(파싱·검증 없음) — 실제 소속 크루 id 집합과의 교집합·기본값
 * 결정은 판정 함수인 `@/lib/rules/crew-filter-selection`의 `parseCrewFilterSelection`이
 * 맡는다(이 파일은 `next/headers` 의존 때문에 단위 테스트하기 불편한 경계만 최소로 남긴다).
 */
export async function getCrewFilterCookieRaw(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CREW_FILTER_COOKIE_NAME)?.value;
}
