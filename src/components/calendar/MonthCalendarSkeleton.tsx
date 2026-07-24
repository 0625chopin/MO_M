import { Skeleton } from "@/components/ui/skeleton";

/**
 * `/calendar` 최초 진입 로딩 상태 — `Suspense` fallback과 `/sample` 양쪽이 공유한다
 * (`MessageListSkeleton`·`BoardListSkeleton`과 같은 패턴, `docs/CONVENTIONS.md`).
 *
 * **왜 이제야 생겼는가(CORE 재검증 지적, 7일차)**: `board`(018A)·`chat`(020A)은 처음부터
 * Suspense+전용 스켈레톤 컴포넌트를 썼는데, `calendar`(021A/021B)만 `/calendar/page.tsx`가
 * `MonthCalendarContainer`(여러 `await` — 크루·Meetup·Poll 조회)를 Suspense 없이 직접
 * 렌더해 왔다. `/sample`에는 로딩 스켈레톤 **모양**이 이미 있었지만(`sections/calendar.tsx`의
 * `MonthCalendar` 항목) 실제 컴포넌트가 아니라 그 항목 파일 안의 손그림 JSX였다 — 이 파일로
 * 뽑아내 두 곳(Suspense fallback·`/sample`)이 같은 컴포넌트를 그리게 했다.
 *
 * `MonthCalendarContainer`가 실제로 반환하는 레이아웃(`@container flex ... @4xl:flex-row`,
 * 왼쪽 크루 필터 + 오른쪽 격자)을 그대로 흉내 낸다 — 로딩 중에 레이아웃이 늦게 뒤바뀌는
 * 것을 피한다(CLS, NFR-001과 같은 방향).
 */
export function MonthCalendarSkeleton() {
  return (
    <div
      className="@container flex flex-col gap-4 @4xl:flex-row @4xl:items-start"
      aria-busy="true"
    >
      <div className="flex flex-col gap-2 @4xl:w-64 @4xl:shrink-0">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-1">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="size-7 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
