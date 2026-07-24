import { CREW_EXPLORE_PAGE_SIZE } from "@/components/crews/crew-explore-view-models";
import { CrewGrid } from "@/components/crews/CrewGrid";
import { fetchCrewCardsPage } from "@/components/crews/fetch-crew-cards";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { validateCrewSearchQuery } from "@/lib/rules/crew-search-query";

export interface CrewExploreContainerProps {
  /** `page.tsx`가 `searchParams.q`를 그대로 넘긴다 — 아직 검증 전 원본값이다. */
  query?: string;
  category?: string;
}

/**
 * 크루 탐색 결과 컨테이너(FR-014, D-007·D-017, Task 016A, D-030 ①) — 최초 페이지 조회를
 * 소유한다. `BoardListContainer`·`MessageListContainer`와 같은 패턴(async 서버 컴포넌트가
 * 조회 후 클라이언트 컨테이너에 초기 데이터를 내려준다)이지만, 이 라우트(`/crews`)는
 * `(app)` 밖이라 **인증을 요구하지 않는다** — `getAuthSession()`만 호출하고
 * `assertAuthenticatedSession`은 쓰지 않는다(guest가 여기서는 오류가 아니라 유효한
 * 방문자다, `CrewHomeContainer`와 같은 이유).
 *
 * 검색어 최소 길이(FR-014 E2)는 `CrewSearchBar`(클라이언트)가 제출 전에 막지만, 이 컨테이너는
 * `page.tsx`를 통해 searchParams로 직접 호출될 수도 있으므로(URL을 직접 편집해 `?q=a`로 접근하는
 * 경우) 서버에서도 같은 규칙으로 다시 판정한다 — 무효 검색어는 조용히 무시하고 전체 목록으로
 * 폴백한다(fail-safe: "검색 결과 0건"보다 "필터 없이 전체 노출"이 덜 놀랍다고 판단했다).
 */
export async function CrewExploreContainer({ query, category }: CrewExploreContainerProps) {
  const session = await getAuthSession();
  const viewerProfileId = session.status === "authenticated" ? session.profileId : null;

  const trimmedQuery = query?.trim();
  const sanitizedQuery =
    trimmedQuery && validateCrewSearchQuery(trimmedQuery).valid ? trimmedQuery : undefined;

  const page = await fetchCrewCardsPage({
    query: sanitizedQuery,
    category,
    viewerProfileId,
    limit: CREW_EXPLORE_PAGE_SIZE,
  });

  return (
    <CrewGrid
      initialItems={page.items}
      initialCursor={page.nextCursor}
      query={sanitizedQuery}
      category={category}
      hasActiveFilter={Boolean(sanitizedQuery || category)}
    />
  );
}
