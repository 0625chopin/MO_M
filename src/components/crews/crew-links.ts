import type { Id } from "@/lib/types";

/**
 * 크루 관련 경로 조립 — 항상 `crewId` **리소스 ID**로부터 계산한다(R-016·FR-052,
 * `components/board/board-links.ts`와 같은 패턴). 게시판 경로(`/crews/{crewId}/board`)는
 * 이 파일에서 새로 만들지 않고 `board-links.ts`의 `getBoardListHref`를 그대로 재사용한다 —
 * 같은 문자열을 두 곳에서 조립하면 라우트 규칙이 바뀔 때 한쪽을 빠뜨리기 쉽다.
 */
export function getCrewHomeHref(crewId: Id): string {
  return `/crews/${crewId}`;
}

export function getCrewChatHref(crewId: Id): string {
  return `/crews/${crewId}/chat`;
}

export function getCrewMembersHref(crewId: Id): string {
  return `/crews/${crewId}/members`;
}

export function getCrewSettingsHref(crewId: Id): string {
  return `/crews/${crewId}/settings`;
}

export const CREW_CREATE_HREF = "/crews/new";
export const CREW_EXPLORE_HREF = "/crews";
