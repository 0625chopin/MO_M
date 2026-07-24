/**
 * 크루 카테고리 고정 taxonomy — 순수 데이터 + 판정 (NFR-036, Task 016B). FR-010 개설 폼의
 * 카테고리 선택지이자, FR-014 크루 탐색(Task 016A, 같은 담당자 후속 회차)의 카테고리 필터가
 * 재사용할 같은 목록이다 — 개설 폼과 탐색 필터가 서로 다른 카테고리 어휘를 쓰면 "이 카테고리로
 * 만든 크루가 그 카테고리 필터에 안 잡히는" 불일치가 생긴다.
 *
 * 값은 `src/lib/data/mock/seed/content-bank.ts`의 `NEW_CREWS` 시드 데이터가 실제로 쓰는
 * 5개 카테고리와 맞췄다(그 파일은 시드 전용이라 이 목록을 직접 import하지 않는다 — 값만
 * 맞춰 손으로 동기화했다. 시드 카테고리가 바뀌면 이 배열도 함께 확인할 것).
 */
export const CREW_CATEGORIES = ["운동", "취미", "문화", "스터디", "반려동물"] as const;

export type CrewCategory = (typeof CREW_CATEGORIES)[number];

export function isValidCrewCategory(value: string): value is CrewCategory {
  return (CREW_CATEGORIES as readonly string[]).includes(value);
}
