/**
 * 크루 소개(description) 형식 검증 — 순수 함수 (NFR-036, R-015, Task 016B). FR-010 개설 폼의
 * "소개" 필드가 쓴다.
 *
 * **`CREW_DESCRIPTION_MAX_LENGTH`는 요구사항 문서에 값이 없는 잠정값이다** —
 * `bio-validation.ts`의 `BIO_MAX_LENGTH`(150자, I-034)보다 넉넉하게 잡았다(크루 소개는 자기소개
 * 한 줄보다 길게 쓰는 경우가 흔하다는 실용적 판단). **`docs/ISSUES.md` I-038에 등재**.
 */

export const CREW_DESCRIPTION_MIN_LENGTH = 1;
export const CREW_DESCRIPTION_MAX_LENGTH = 300;

export type CrewDescriptionViolation = "required" | "too_long";

export interface CrewDescriptionCheckResult {
  valid: boolean;
  violations: CrewDescriptionViolation[];
}

/** FR-010 정상 흐름은 소개를 필수 입력 항목으로 나열한다 — bio(선택)와 달리 최소 길이가 있다. */
export function validateCrewDescription(description: string): CrewDescriptionCheckResult {
  const trimmed = description.trim();
  const violations: CrewDescriptionViolation[] = [];

  if (trimmed.length < CREW_DESCRIPTION_MIN_LENGTH) {
    violations.push("required");
  }
  if (trimmed.length > CREW_DESCRIPTION_MAX_LENGTH) {
    violations.push("too_long");
  }

  return { valid: violations.length === 0, violations };
}
