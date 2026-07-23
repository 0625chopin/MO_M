import { strings } from "@/lib/strings";

/**
 * 통합 캘린더 페이지 (SC-16, PRD §6 "통합 캘린더 페이지", F030~F033·F035). 월간 격자·크루 색
 * Meetup 바·크루 필터·상세 패널은 Task 009B(색 배정 규칙) 이후 채운다. 날짜·바 클릭은 조회
 * 전용이며 데이터를 생성하지 않는다(D-012).
 */
export default function CalendarPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.calendar.month.title}
      </h1>
    </main>
  );
}
