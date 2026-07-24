import { Skeleton } from "@/components/ui/skeleton";

/**
 * `PollPanelContainer` 최초 진입 로딩 상태 — `MeetupDetailSkeleton`과 같은 이유로 `Suspense`
 * fallback과 `/sample` 양쪽이 공유하는 별도 컴포넌트로 뽑았다(손그림 스켈레톤을 두 곳에 각각
 * 두면 어긋난다). `PollPanel`의 "open" 갈래(집계 카드 → 카운트다운 → 투표 버튼 3개) 골격을
 * 흉내 낸다.
 */
export function PollPanelSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
