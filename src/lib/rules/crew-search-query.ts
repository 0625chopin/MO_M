/**
 * 크루 탐색 검색어 최소 길이 판정 — 순수 함수 (FR-014 E2, NFR-036, Task 016A).
 *
 * 검색어를 **아예 입력하지 않으면**(0자) 전체 목록 브라우징이라 유효하다(FR-014 정상 흐름
 * "① 검색 화면 → ② 키워드 입력 또는 카테고리 필터(입력 없이 전체 목록 브라우징도 가능)") —
 * 카테고리만 고르고 싶은 사용자를 막으면 안 된다. **1자만** 입력했을 때만 무효다(E2 "검색어
 * 2자 미만 → 최소 길이 안내"). `CrewSearchBar`(클라이언트)가 제출 버튼을 막는 데 쓰고,
 * `loadMoreCrewsAction`(Server Action)이 같은 상수로 방어적으로 재검증한다 — 클라이언트
 * 판정을 그대로 믿지 않는다(`join-request-eligibility.ts`와 같은 원칙).
 */

export const CREW_SEARCH_MIN_LENGTH = 2;

export type CrewSearchQueryViolation = "too_short";

export interface CrewSearchQueryCheckResult {
  valid: boolean;
  violations: CrewSearchQueryViolation[];
}

export function validateCrewSearchQuery(query: string): CrewSearchQueryCheckResult {
  const trimmed = query.trim();
  const violations: CrewSearchQueryViolation[] = [];

  if (trimmed.length > 0 && trimmed.length < CREW_SEARCH_MIN_LENGTH) {
    violations.push("too_short");
  }

  return { valid: violations.length === 0, violations };
}
