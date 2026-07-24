import type { AuthAttempt, ISODateTimeString } from "@/lib/types";

/**
 * 비밀번호·이메일 형식 검증 + 로그인 잠금 판정 — 순수 함수 (NFR-036, R-015, Task 015A).
 * `handle-validation.ts`와 달리 이 모듈은 인증 화면(SignupForm·LoginForm) 전용이라 다른
 * Task가 재사용을 전제하지 않는다. 그래도 zone 1 규칙(React·Next·데이터 레이어 미의존)은
 * 동일하게 지킨다 — 실제 검증 이력 조회는 호출자(Server Action)의 몫이다.
 */

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordFormatViolation = "too_short";

export interface PasswordFormatCheckResult {
  valid: boolean;
  violations: PasswordFormatViolation[];
}

/**
 * FR-001 AC3 — "비밀번호 8자 미만 → 오류". 요구사항이 명시한 기준은 최소 길이 하나뿐이라
 * 그 이상의 복잡도 규칙(대소문자·특수문자 조합)은 추가하지 않았다 — 명세에 없는 제약을
 * 넣으면 AC3 시나리오("8자 이상이면 통과")와 충돌한다. `violations`를 배열로 둔 것은 향후
 * 정책이 늘어도(예: 이메일과 동일 금지) `SignupForm`이 "위반 항목을 개별 표시"(FR-001 E3)
 * 하는 구조를 지금부터 갖추기 위해서다.
 */
export function validatePasswordFormat(password: string): PasswordFormatCheckResult {
  const violations: PasswordFormatViolation[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    violations.push("too_short");
  }
  return { valid: violations.length === 0, violations };
}

/** RFC 5322를 완전히 구현하지 않는다 — 서버 측 최종 검증은 실제 인증 스택(Task 026 이후)의
 *  몫이고, 여기서는 "명백히 이메일이 아닌 값"만 클라이언트에서 조기에 걸러낸다. */
const EMAIL_FORMAT_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_FORMAT_PATTERN.test(email);
}

/** D-020 — 계정 단위 로그인 잠금. 5회 연속 실패 시 마지막 실패로부터 15분 잠금. */
export const LOGIN_LOCKOUT_FAILURE_THRESHOLD = 5;
export const LOGIN_LOCKOUT_WINDOW_MINUTES = 15;

export interface LoginLockoutState {
  locked: boolean;
  /** locked===true일 때 잠금이 풀리는 시각. locked===false면 null. */
  unlocksAt: ISODateTimeString | null;
}

/**
 * D-020 — "5회 연속 실패 → 15분 잠금", "자격 증명이 맞아도 거부"(FR-002 AC4)를 판정하는
 * 순수 함수. `attempts`는 **판정 대상 계정(identifier) 하나로 이미 필터링된** 시도 이력이다
 * — 이 함수는 identifier로 필터링하지 않는다(그건 `lib/data`/Server Action이 쿼리 시점에
 * 할 일). 최근 순으로 정렬해 맨 앞에서부터 연속 실패 횟수를 센다.
 *
 * v0.1(Mock)에서는 `attempts`가 실제 `auth_attempt` 테이블 조회 결과가 아니라 로그인
 * Server Action이 심어 둔 고정 데모 배열에서 나온다 — D-020이 "v0.1(Mock)에서는 잠금
 * **화면 상태**만 만든다"고 못박았기 때문이다. Task 026(Supabase 도입) 이후 `attempts`
 * 인자를 실제 조회 결과로 바꾸면 이 함수 자체는 손대지 않고 그대로 재사용된다.
 */
export function evaluateLoginLockout(
  attempts: readonly Pick<AuthAttempt, "attemptedAt" | "succeeded">[],
  now: ISODateTimeString,
): LoginLockoutState {
  const sorted = [...attempts].sort(
    (a, b) => Date.parse(b.attemptedAt) - Date.parse(a.attemptedAt),
  );

  let consecutiveFailures = 0;
  for (const attempt of sorted) {
    if (attempt.succeeded) break;
    consecutiveFailures += 1;
  }

  if (consecutiveFailures < LOGIN_LOCKOUT_FAILURE_THRESHOLD) {
    return { locked: false, unlocksAt: null };
  }

  const lastFailure = sorted[0];
  const unlocksAt = new Date(
    Date.parse(lastFailure.attemptedAt) + LOGIN_LOCKOUT_WINDOW_MINUTES * 60_000,
  ).toISOString();
  const locked = Date.parse(now) < Date.parse(unlocksAt);

  return { locked, unlocksAt: locked ? unlocksAt : null };
}
