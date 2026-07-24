/**
 * 크루명 형식·금칙어 검증 — 순수 함수 (NFR-036, R-015, Task 016B). FR-010 정상 흐름 ③이
 * "제출"에서 검사하고, E3("금칙어 포함 → 거부")가 이 판정의 근거다.
 *
 * **글자 수 상한(`CREW_NAME_MAX_LENGTH`)과 금칙어 목록(`BANNED_WORDS`)은 요구사항 문서에 값이
 * 없다** — `bio-validation.ts`의 `BIO_MAX_LENGTH`(I-034)·`handle-validation.ts`의
 * `HANDLE_PATTERN`(I-033)과 같은 성격의 잠정값이다. 상한은 `displayName`(30자, FR-001/004)과
 * 나란히 맞췄고, 금칙어 목록은 "검사 자체가 존재함"을 보이는 최소 데모 집합이지 실제 운영
 * 사전이 아니다 — **`docs/ISSUES.md` I-038에 등재**, 고객 확인 후 교체 대상이다.
 */

export const CREW_NAME_MIN_LENGTH = 1;
export const CREW_NAME_MAX_LENGTH = 30;

/**
 * 데모용 최소 금칙어 집합(대소문자 무시, 부분 일치). 실제 운영 사전이 아니다 — I-038 참고.
 * 값 자체보다 "검사 지점이 존재한다"는 것이 이 배열의 목적이다.
 */
const BANNED_WORDS: readonly string[] = ["씨발", "병신", "좆", "지랄", "fuck", "shit"];

export type CrewNameViolation = "required" | "too_long" | "banned_word";

export interface CrewNameCheckResult {
  valid: boolean;
  violations: CrewNameViolation[];
}

/** 앞뒤 공백은 트림 후 판정한다. 크루명 중복은 여기서 다루지 않는다 — D-008 E1이 "허용"으로
 *  확정했으므로(목록에서 오너 핸들 병기) 검증 대상이 아니다. */
export function validateCrewName(name: string): CrewNameCheckResult {
  const trimmed = name.trim();
  const violations: CrewNameViolation[] = [];

  if (trimmed.length < CREW_NAME_MIN_LENGTH) {
    violations.push("required");
  }
  if (trimmed.length > CREW_NAME_MAX_LENGTH) {
    violations.push("too_long");
  }
  const lower = trimmed.toLowerCase();
  if (BANNED_WORDS.some((word) => lower.includes(word.toLowerCase()))) {
    violations.push("banned_word");
  }

  return { valid: violations.length === 0, violations };
}
