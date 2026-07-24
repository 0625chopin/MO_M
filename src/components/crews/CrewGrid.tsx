"use client";

import { Loader2Icon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import type { CrewCardViewModel } from "@/components/crews/crew-explore-view-models";
import { CREW_EXPLORE_HREF } from "@/components/crews/crew-links";
import { CrewCard } from "@/components/crews/CrewCard";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ErrorState } from "@/components/ui/error-state";
import { loadMoreCrewsAction } from "@/lib/actions/load-more-crews";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

export interface CrewGridProps {
  initialItems: CrewCardViewModel[];
  initialCursor: Id | null;
  /** 다음 페이지 요청 시 그대로 되돌려 보낼 현재 필터 — 서버가 검증을 마친 값이다. */
  query?: string;
  category?: string;
  /** 검색어·카테고리 중 하나라도 걸려 있는지 — 빈 상태에서 "전체 목록 보기" 링크를 보여줄지
   *  정한다(E1 "빈 상태 UI + 카테고리 둘러보기 유도"). */
  hasActiveFilter: boolean;
}

/**
 * 크루 탐색 결과 그리드 + 무한 스크롤(FR-014 AC3, Task 016A). `MessageRoomContainer`
 * (Task 020A)와 같은 패턴 — 서버 컴포넌트(`CrewExploreContainer`)가 최초 페이지를 조회해
 * props로 내려주고, 이 클라이언트 컨테이너는 그 이후의 "아래로 이어 로드"만 담당한다.
 *
 * **스크롤 컨테이너가 채팅과 다르다**: `MessageList`는 고정 높이 패널 안에서 스크롤하지만,
 * 이 그리드는 페이지 본문 자체라 뷰포트 스크롤을 그대로 쓴다 — `IntersectionObserver`의
 * `root`를 지정하지 않는다(기본값 = 뷰포트).
 *
 * 검색어·카테고리가 바뀌면 `page.tsx`가 `Suspense`의 `key`를 바꿔 이 컴포넌트 자체를
 * 새로 마운트한다 — props가 바뀌었다고 이 컴포넌트 안에서 상태를 다시 동기화할 필요가 없다
 * (리마운트가 그 역할을 대신한다).
 */
export function CrewGrid({ initialItems, initialCursor, query, category, hasActiveFilter }: CrewGridProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingMore, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set(initialItems.map((item) => item.id)));

  function handleLoadMore() {
    if (!cursor) return;
    setLoadError(null);
    startTransition(async () => {
      try {
        const result = await loadMoreCrewsAction({ query, category, cursor });
        setItems((prev) => {
          const fresh = result.items.filter((item) => !seenIds.current.has(item.id));
          fresh.forEach((item) => seenIds.current.add(item.id));
          return [...prev, ...fresh];
        });
        setCursor(result.nextCursor);
      } catch {
        setLoadError(strings.crew.explore.errors.loadMoreFailed);
      }
    });
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !cursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // cursor가 바뀔 때마다(페이지를 새로 불러올 때마다) 최신 클로저로 다시 구독한다 —
    // MessageList.tsx의 onLoadMoreRef 트릭과 달리 여기서는 이 컴포넌트 자신이 상태를 갖고
    // 있어 effect 재실행만으로 충분하다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{strings.crew.explore.empty.title}</EmptyTitle>
          {hasActiveFilter && <EmptyDescription>{strings.crew.explore.empty.description}</EmptyDescription>}
        </EmptyHeader>
        {hasActiveFilter && (
          <EmptyContent>
            <Link href={CREW_EXPLORE_HREF} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {strings.crew.explore.empty.resetLink}
            </Link>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <div className="@container flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
        {items.map((crew) => (
          <CrewCard key={crew.id} crew={crew} />
        ))}
      </div>

      {cursor && (
        <div ref={sentinelRef} className="flex justify-center py-2" aria-hidden={!isLoadingMore}>
          {isLoadingMore && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2Icon aria-hidden="true" className="size-3.5 animate-spin" />
              {strings.crew.explore.loadingMore}
            </span>
          )}
        </div>
      )}

      {loadError && (
        <ErrorState
          title={loadError}
          onRetry={handleLoadMore}
          retryLabel={strings.common.actions.retry}
        />
      )}
    </div>
  );
}
