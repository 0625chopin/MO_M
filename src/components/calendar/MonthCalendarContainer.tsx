import { getPostDetailHref } from "@/components/board/board-links";
import { MAX_VISIBLE_BARS_PER_DAY } from "@/components/calendar/calendar-types";
import type { CalendarDayData, CrewFilterOption } from "@/components/calendar/calendar-types";
import { getCrewFilterCookieRaw } from "@/components/calendar/crew-filter-cookie";
import { CrewFilterPanel } from "@/components/calendar/CrewFilterPanel";
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
import { getPollById, listCrewsByProfile, listMeetupsByCrews } from "@/lib/data";
import { resolveCrewColorCollision } from "@/lib/rules/crew-color-hash";
import { parseCrewFilterSelection } from "@/lib/rules/crew-filter-selection";
import type { Meetup } from "@/lib/types";

/**
 * Mock 조회 컨테이너(D-030 ①) — Task 021A(격자·바)에 Task 021B(크루 필터·`DayDetailPanel`
 * 상세 데이터·홈 대시보드는 별도 컨테이너)가 이어서 채웠다. `src/app/(app)/calendar/page.tsx`
 * (6일차부터 `(app)` 라우트 그룹 소속, D-030 ④·I-025)가 이 컴포넌트를 조립하고, 이 컴포넌트는
 * `lib/data`(배럴)를 호출해 얻은 데이터를 `MonthCalendar`·`CrewFilterPanel`(표현)의 props로
 * 그대로 넘긴다. 실데이터 전환(Task 031) 시 이 파일의 조회 부분만 바뀌고 두 표현 컴포넌트는
 * 손대지 않는다.
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
 *
 * **크루 필터 적용 범위(Task 021B, FR-061 AC5·E5, D-014·R-017)**: 필터로 선택한 크루만
 * `listMeetupsByCrews`의 `crewIds`에 넘긴다 — 격자 바뿐 아니라 `DayDetailPanel` 상세 목록도
 * 같은 필터를 받는다(둘 다 이 컨테이너가 한 번 조회한 같은 데이터에서 파생되므로 자동으로
 * 일치한다). 이건 요구사항 문서에 명시된 값이 아니라 "격자에서 숨긴 크루라면 그날 클릭해도
 * 안 보이는 게 자연스럽다"는 판단이다 — 모호했던 지점이라 보고에 남긴다.
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

  // 크루 필터 선택 상태(FR-061 AC5) — 쿠키 원본은 `crew-filter-cookie.ts`가 읽고, 실제
  // 소속 크루와의 교집합·기본값(전체 선택) 결정은 순수 함수(`parseCrewFilterSelection`)가 한다.
  const rawFilterCookie = await getCrewFilterCookieRaw();
  const memberCrewIds = crews.map((c) => c.id);
  const selectedCrewIds = parseCrewFilterSelection(rawFilterCookie, memberCrewIds);

  const { from, to } = getMonthRangeIso(year, month);
  // `includeCancelled: true` — `DayDetailPanel`(FR-063 E3)이 취소된 Meetup도 배지와 함께
  // 보여줘야 하므로, 격자 바 계산에 쓰던 기존 조회 하나에 옵션만 얹어 한 번만 부른다
  // (`ListMeetupsQuery.includeCancelled` 모듈 docstring 참고). 바/오버플로는 이 목록에서
  // 취소분을 뺀 부분집합으로 아래에서 다시 걸러낸다 — 격자 동작은 021A와 동일하게 유지된다.
  const monthMeetups = await listMeetupsByCrews({
    crewIds: selectedCrewIds,
    from,
    to,
    includeCancelled: true,
  });
  const confirmedMonthMeetups = monthMeetups.filter((m) => m.status === "confirmed");

  // Meetup → 원 제안글 경로(FR-063 AC2) — 이 달 전체 분을 한 번에 미리 풀어 둔다(월 최대
  // 60건 기준선, R-017). 개별 날짜 셀 렌더 시점에 다시 조회하지 않는다(NFR-005 사전 인덱싱).
  const polls = await Promise.all(monthMeetups.map((m) => getPollById(m.pollId)));
  const postHrefByMeetupId = new Map<string, string | null>();
  monthMeetups.forEach((meetup, index) => {
    const poll = polls[index];
    postHrefByMeetupId.set(
      meetup.id,
      poll ? getPostDetailHref(meetup.crewId, poll.postId) : null,
    );
  });

  // 날짜키 → Meetup[] 1회 사전 인덱싱(NFR-005) — React Compiler는 컴포넌트·훅만 메모이즈하므로
  // 여기서 자료구조로 미리 풀어 둔다(useMemo가 아니라 인덱싱으로 해결하라는 지침).
  const meetupsByDate = new Map<string, Meetup[]>();
  for (const meetup of monthMeetups) {
    const list = meetupsByDate.get(meetup.date);
    if (list) list.push(meetup);
    else meetupsByDate.set(meetup.date, [meetup]);
  }

  const weeks: CalendarDayData[][] = buildMonthWeeks(year, month, todayIso).map((week) =>
    week.map((day): CalendarDayData => {
      // 취소분 포함 전체(패널용) — 격자 바는 아래에서 이 목록의 confirmed 부분집합만 쓴다.
      const dayMeetups = (meetupsByDate.get(day.iso) ?? [])
        .slice()
        .sort(
          (a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "") || a.id.localeCompare(b.id),
        );

      // D-026 같은 날짜 셀 충돌 회피 — 셀마다 새로 계산한다(전역 유일성은 보장하지 않는다).
      // 크루당 한 번만 판정하고(같은 크루의 여러 Meetup은 항상 같은 색), 처리 순서는 위에서
      // 정한 정렬(시작 시각 → id) 순이라 매 렌더 같은 결과가 나온다. 취소분도 이 순회에
      // 포함시켜야 격자 바(confirmed만)와 패널(전체)이 크루당 같은 색을 쓴다.
      const occupiedIndices: number[] = [];
      const colorIndexByCrewId = new Map<string, number>();
      for (const meetup of dayMeetups) {
        if (colorIndexByCrewId.has(meetup.crewId)) continue;
        const baseIndex = crewById.get(meetup.crewId)?.colorKey ?? 0;
        const resolved = resolveCrewColorCollision(baseIndex, occupiedIndices);
        occupiedIndices.push(resolved);
        colorIndexByCrewId.set(meetup.crewId, resolved);
      }

      const confirmedDayMeetups = dayMeetups.filter((m) => m.status === "confirmed");
      const visible = confirmedDayMeetups.slice(0, MAX_VISIBLE_BARS_PER_DAY);

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
        overflowCount: Math.max(0, confirmedDayMeetups.length - MAX_VISIBLE_BARS_PER_DAY),
        meetups: dayMeetups.map((meetup) => ({
          id: meetup.id,
          crewId: meetup.crewId,
          crewName: crewById.get(meetup.crewId)?.name ?? "",
          title: meetup.title,
          colorIndex: colorIndexByCrewId.get(meetup.crewId) ?? 0,
          startTime: meetup.startTime,
          place: meetup.place,
          attendingCount: meetup.attendingCount,
          capacity: meetup.capacity,
          isCancelled: meetup.status === "cancelled",
          postHref: postHrefByMeetupId.get(meetup.id) ?? null,
        })),
      };
    }),
  );

  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);

  const crewFilterOptions: CrewFilterOption[] = crews.map((c) => ({
    id: c.id,
    name: c.name,
    colorIndex: c.colorKey,
  }));

  return (
    <div className="@container flex flex-col gap-4 @4xl:flex-row @4xl:items-start">
      {crewFilterOptions.length > 0 && (
        <CrewFilterPanel
          crews={crewFilterOptions}
          initialSelectedCrewIds={selectedCrewIds}
          className="@4xl:w-64 @4xl:shrink-0"
        />
      )}
      <MonthCalendar
        year={year}
        month={month}
        weeks={weeks}
        prevMonthHref={`/calendar?month=${formatMonthParam(prev.year, prev.month)}`}
        nextMonthHref={`/calendar?month=${formatMonthParam(next.year, next.month)}`}
        isEmpty={confirmedMonthMeetups.length === 0}
        className="min-w-0 flex-1"
      />
    </div>
  );
}
