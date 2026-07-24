import { toCrewCardViewModel, type CrewCardViewModel } from "@/components/crews/crew-explore-view-models";
import { listCrewMembers, listCrews, listCrewsByProfile, type ListCrewsQuery } from "@/lib/data";
import { isActiveMembership } from "@/lib/rules/crew-membership-transition";
import type { Id } from "@/lib/types";

export interface FetchCrewCardsPageResult {
  items: CrewCardViewModel[];
  nextCursor: Id | null;
}

/**
 * 크루 탐색 카드 목록 조회(FR-014, Task 016A) — `CrewExploreContainer`(최초 페이지)와
 * `loadMoreCrewsAction`(무한 스크롤 다음 페이지)이 똑같이 필요로 하는 "`Crew[]` →
 * `CrewCardViewModel[]`" 조인을 한 곳에 모은다. 흩어 두면 "가입됨" 배지 판정이 두 곳에서
 * 각자 계산되다가 어긋나는 R-015류 위험이 생긴다 — `resolve-board-viewer.ts`가 게시판
 * 컨테이너 둘(목록·상세)이 공유하는 조회를 한 곳에 모은 것과 같은 이유다.
 *
 * `.ts`(비-`.tsx`) 파일이라 `eslint.config.mjs` zone 6으로 떨어져 `@/lib/data` 배럴 import가
 * 허용된다 — `resolve-board-viewer.ts`와 같은 위치·같은 취급이다(`docs/CONVENTIONS.md`
 * "그 외 src/**" 행 참고).
 */
export async function fetchCrewCardsPage(
  query: ListCrewsQuery,
): Promise<FetchCrewCardsPageResult> {
  const [page, memberCrews] = await Promise.all([
    listCrews(query),
    query.viewerProfileId ? listCrewsByProfile(query.viewerProfileId) : Promise.resolve([]),
  ]);
  const memberCrewIds = new Set(memberCrews.map((c) => c.id));

  const items = await Promise.all(
    page.items.map(async (crew) => {
      const members = await listCrewMembers(crew.id);
      const memberCount = members.filter((m) => isActiveMembership(m.status)).length;
      return toCrewCardViewModel(crew, memberCount, memberCrewIds.has(crew.id));
    }),
  );

  return { items, nextCursor: page.nextCursor };
}
