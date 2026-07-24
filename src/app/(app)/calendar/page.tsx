import { MonthCalendarContainer } from "@/components/calendar/MonthCalendarContainer";
import { PageHeader } from "@/components/shell/PageHeader";
import { strings } from "@/lib/strings";

/**
 * 통합 캘린더 페이지 (SC-16, PRD §6 "통합 캘린더 페이지", F030~F033·F035) — Task 021A.
 * 이번 회차는 `MonthCalendar` 격자 + `MeetupBar`까지다. 크루 필터·`DayDetailPanel`·홈
 * 대시보드는 Task 021B(다음 회차) 몫이다. 날짜·바 클릭은 조회 전용이며 데이터를 생성하지
 * 않는다(D-012) — 이번 회차는 클릭 시 열리는 패널 자체가 아직 없다.
 *
 * Next.js 16 — `searchParams`는 비동기라 `await`한다.
 */
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title={strings.calendar.month.title} />
      <div className="p-4">
        <MonthCalendarContainer monthParam={params.month} />
      </div>
    </main>
  );
}
