"use server";

import { CREW_EXPLORE_PAGE_SIZE, type CrewCardViewModel } from "@/components/crews/crew-explore-view-models";
import { fetchCrewCardsPage } from "@/components/crews/fetch-crew-cards";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { validateCrewSearchQuery } from "@/lib/rules/crew-search-query";
import type { Id } from "@/lib/types";

export interface LoadMoreCrewsInput {
  query?: string;
  category?: string;
  /** 직전 페이지 마지막 항목의 id(D-023과 같은 커서 규약). */
  cursor: Id;
}

export interface LoadMoreCrewsResult {
  items: CrewCardViewModel[];
  nextCursor: Id | null;
}

/**
 * 크루 탐색 무한 스크롤 다음 페이지(FR-014 AC3, Task 016A). `CrewGrid`(클라이언트 컨테이너)가
 * `loadEarlierMessagesAction`(Task 020A)과 같은 패턴으로 `startTransition` 안에서 직접
 * 호출하는, 폼이 없는 읽기 전용 Server Action이다.
 *
 * **인증 게이트를 두지 않는다** — FR-014의 행위자는 "회원 및 비로그인 방문자"다(D-007).
 * `search-user-by-handle.ts`가 경고하는 "Server Action은 페이지를 거치지 않고 직접 호출될 수
 * 있다"는 위험이 여기서는 성립하지 않는다 — `fetchCrewCardsPage`(→ `listCrews`)가
 * `viewerProfileId`(비로그인이면 null) 기준으로 `private` 크루를 이미 걸러내므로(D-017·D-028),
 * 어떤 role로 호출해도 데이터 접근 규칙이 같은 결과를 낸다. 막을 "그 이상의 허용/거부"가
 * 애초에 없다.
 *
 * 검색어는 여기서 한 번 더 검증한다(방어적 재검증, `join-request-eligibility.ts`와 같은 원칙) —
 * `CrewSearchBar`가 2자 미만 제출을 막지만, 이 액션은 페이지를 거치지 않고 직접 호출될 수
 * 있으므로 클라이언트 판정을 그대로 믿지 않는다. 무효 검색어는 조용히 무시하고 검색어 없이
 * 조회한다(전체 목록 브라우징으로 폴백 — 존재하지 않는 크루를 보여주는 것보다 안전하다).
 */
export async function loadMoreCrewsAction(input: LoadMoreCrewsInput): Promise<LoadMoreCrewsResult> {
  const session = await getAuthSession();
  const viewerProfileId = session.status === "authenticated" ? session.profileId : null;

  const trimmedQuery = input.query?.trim();
  const sanitizedQuery =
    trimmedQuery && validateCrewSearchQuery(trimmedQuery).valid ? trimmedQuery : undefined;

  const page = await fetchCrewCardsPage({
    query: sanitizedQuery,
    category: input.category,
    viewerProfileId,
    cursor: input.cursor,
    limit: CREW_EXPLORE_PAGE_SIZE,
  });

  return page;
}
