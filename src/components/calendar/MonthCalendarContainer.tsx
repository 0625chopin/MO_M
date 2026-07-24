import { MAX_VISIBLE_BARS_PER_DAY } from "@/components/calendar/calendar-types";
import type { CalendarDayData } from "@/components/calendar/calendar-types";
import {
  addMonths,
  buildMonthWeeks,
  currentYearMonthUtc,
  formatMonthParam,
  getMonthRangeIso,
  parseMonthParam,
  todayIsoUtc,
} from "@/components/calendar/date-grid";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { assertAuthenticatedSession } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { listCrewsByProfile, listMeetupsByCrews } from "@/lib/data";
import { resolveCrewColorCollision } from "@/lib/rules/crew-color-hash";
import type { Meetup } from "@/lib/types";

/**
 * Mock 조회 컨테이너(D-030 ①) — Task 021A. `src/app/(app)/calendar/page.tsx`(6일차부터
 * `(app)` 라우트 그룹 소속, D-030 ④·I-025)가 이 컴포넌트를 조립하고, 이 컴포넌트는
 * `lib/data`(배럴)를 호출해 얻은 데이터를 `MonthCalendar`(표현)의 props로 그대로 넘긴다.
 * 실데이터 전환(Task 031) 시 이 파일의 조회 부분만 바뀌고 `MonthCalendar.tsx`는 손대지 않는다.
 *
 * **fail-closed로 전환(6일차, CORE 재검증 E-2)**: 이전 버전은 `session.status !==
 * "authenticated"`일 때 고정된 Mock 프로필(`profile-1`)로 조용히 대체했다 — 로그인 폼이 없던
 * 시절(Task 015A 이전)의 잔재였다. 그 폴백은 "guest면 거부"가 아니라 "guest면 실존 사용자로
 * 대체"라 오늘은 `(app)/layout.tsx`가 인증을 보장해 도달하지 않아도, 레이아웃이 나중에
 * 약해지거나 이 컨테이너가 `(app)` 밖에서 호출되는 코드가 생기면 조용히 `profile-1`의 크루·
 * Meetup을 아무에게나 노출하는 fail-open이었다. `assertAuthenticatedSession`
 * (`@/components/shell/auth-session.ts`)으로 바꿔 `AccountSettingsPage`(E-1)와 같은 형태로
 * 맞췄다 — 두 곳 다 "이 지점은 (app) 레이아웃을 통과했어야 한다"는 같은 불변식을 같은 방식
 * (타입 내로잉용 `throw`, D-030 ③)으로 강제한다.
 */
export interface MonthCalendarContainerProps {
  /** `page.tsx`가 `await searchParams`로 이미 풀어 넘긴 `?month=YYYY-MM` 값. */
  monthParam?: string;
}

export async function MonthCalendarContainer({ monthParam }: MonthCalendarContainerProps) {
  const session = await getAuthSession();
  assertAuthenticatedSession(session);
  const profileId = session.profileId;

  const now = new Date();
  const todayIso = todayIsoUtc(now);
  const { year, month } = parseMonthParam(monthParam, currentYearMonthUtc(now));

  const crews = await listCrewsByProfile(profileId);
  const crewById = new Map(crews.map((c) => [c.id, c]));

  const { from, to } = getMonthRangeIso(year, month);
  const meetups = await listMeetupsByCrews({ crewIds: crews.map((c) => c.id), from, to });

  // 날짜키 → Meetup[] 1회 사전 인덱싱(NFR-005) — React Compiler는 컴포넌트·훅만 메모이즈하므로
  // 여기서 자료구조로 미리 풀어 둔다(useMemo가 아니라 인덱싱으로 해결하라는 지침).
  const meetupsByDate = new Map<string, Meetup[]>();
  for (const meetup of meetups) {
    const list = meetupsByDate.get(meetup.date);
    if (list) list.push(meetup);
    else meetupsByDate.set(meetup.date, [meetup]);
  }

  const weeks: CalendarDayData[][] = buildMonthWeeks(year, month, todayIso).map((week) =>
    week.map((day): CalendarDayData => {
      const dayMeetups = (meetupsByDate.get(day.iso) ?? [])
        .slice()
        .sort(
          (a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "") || a.id.localeCompare(b.id),
        );

      // D-026 같은 날짜 셀 충돌 회피 — 셀마다 새로 계산한다(전역 유일성은 보장하지 않는다).
      // 크루당 한 번만 판정하고(같은 크루의 여러 Meetup은 항상 같은 색), 처리 순서는 위에서
      // 정한 정렬(시작 시각 → id) 순이라 매 렌더 같은 결과가 나온다.
      const occupiedIndices: number[] = [];
      const colorIndexByCrewId = new Map<string, number>();
      for (const meetup of dayMeetups) {
        if (colorIndexByCrewId.has(meetup.crewId)) continue;
        const baseIndex = crewById.get(meetup.crewId)?.colorKey ?? 0;
        const resolved = resolveCrewColorCollision(baseIndex, occupiedIndices);
        occupiedIndices.push(resolved);
        colorIndexByCrewId.set(meetup.crewId, resolved);
      }

      const visible = dayMeetups.slice(0, MAX_VISIBLE_BARS_PER_DAY);

      return {
        iso: day.iso,
        day: day.day,
        isCurrentMonth: day.isCurrentMonth,
        isToday: day.isToday,
        bars: visible.map((meetup) => ({
          id: meetup.id,
          crewName: crewById.get(meetup.crewId)?.name ?? "",
          title: meetup.title,
          colorIndex: colorIndexByCrewId.get(meetup.crewId) ?? 0,
        })),
        overflowCount: Math.max(0, dayMeetups.length - MAX_VISIBLE_BARS_PER_DAY),
        allMeetupSummaries: dayMeetups.map((meetup) => ({
          crewName: crewById.get(meetup.crewId)?.name ?? "",
          title: meetup.title,
        })),
      };
    }),
  );

  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);

  return (
    <MonthCalendar
      year={year}
      month={month}
      weeks={weeks}
      prevMonthHref={`/calendar?month=${formatMonthParam(prev.year, prev.month)}`}
      nextMonthHref={`/calendar?month=${formatMonthParam(next.year, next.month)}`}
      isEmpty={meetups.length === 0}
    />
  );
}
