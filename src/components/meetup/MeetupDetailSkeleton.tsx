import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Meetup 상세 최초 진입 로딩 상태(Task 022) — `MonthCalendarSkeleton`·`HomeCalendarSummarySkeleton`
 * 과 같은 이유로 `Suspense` fallback과 `/sample` 양쪽이 공유하는 별도 컴포넌트로 뽑았다(7일차
 * CORE 재검증 지적 — 손그림 스켈레톤을 두 곳에 각각 두면 어긋난다). `MeetupDetail.tsx`의 카드
 * 골격(배지 줄 → 제목 → 날짜/시각/장소 → 본문 → 참석자 목록 → 액션)을 흉내 낸다.
 */
export function MeetupDetailSkeleton() {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-2/3" />
        <div className="flex flex-col gap-1.5 pt-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Skeleton className="h-4 w-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}
