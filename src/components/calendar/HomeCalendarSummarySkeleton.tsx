import { Skeleton } from "@/components/ui/skeleton";

/**
 * `/home`의 "다가오는 모임" 요약 최초 진입 로딩 상태 — `Suspense` fallback과 `/sample` 양쪽이
 * 공유한다(`MonthCalendarSkeleton`과 같은 이유·같은 회차에 CORE 재검증으로 추가). 실제
 * `HomeCalendarSummary`의 헤더(제목+"모두 보기" 링크) + 행 2~3개 모양을 흉내 낸다.
 */
export function HomeCalendarSummarySkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
