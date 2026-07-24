/**
 * 표시 이름 형식 검증 — 순수 함수 (NFR-036, R-015, Task 015A). FR-001(가입 시 표시 이름
 * 설정)·FR-004(표시 이름 수정)가 공유하는 최소 제약이라 `SignupForm`·`OnboardingForm`
 * 둘 다 이 함수를 쓴다 — CREW의 프로필 화면(Task 015B)이 표시 이름 필드를 다룰 때도
 * 같은 함수를 재사용할 수 있다.
 */

export const DISPLAY_NAME_MIN_LENGTH = 1;
export const DISPLAY_NAME_MAX_LENGTH = 30;

export type DisplayNameViolation = "required" | "too_long";

export interface DisplayNameCheckResult {
  valid: boolean;
  violations: DisplayNameViolation[];
}

/** 앞뒤 공백은 트림 후 판정한다 — 공백만 입력한 값이 "입력됨"으로 통과하지 않게 한다. */
export function validateDisplayName(displayName: string): DisplayNameCheckResult {
  const trimmed = displayName.trim();
  const violations: DisplayNameViolation[] = [];

  if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
    violations.push("required");
  }
  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    violations.push("too_long");
  }

  return { valid: violations.length === 0, violations };
}
