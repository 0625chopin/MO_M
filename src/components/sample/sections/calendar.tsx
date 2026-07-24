import type { CalendarDayData } from "@/components/calendar/calendar-types";
import { MAX_VISIBLE_BARS_PER_DAY } from "@/components/calendar/calendar-types";
import {
  buildMonthWeeks,
  type BareCalendarDay,
} from "@/components/calendar/date-grid";
import { MeetupBar } from "@/components/calendar/MeetupBar";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { defineSection } from "@/components/sample/showcase-types";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveCrewColorCollision } from "@/lib/rules/crew-color-hash";
import { strings } from "@/lib/strings";

/**
 * 통합 캘린더 격자 + Meetup 막대(FR-060~063) — Task 021A. 이 파일은 서버 컴포넌트라 클라이언트
 * 컴포넌트(`MonthCalendar`·`ErrorState`)에 함수 prop을 넘길 수 없다(`primitives.tsx`의
 * `ErrorState` 데모와 같은 이유) — 데이터만 준비해서 내려준다.
 *
 * **색은 여기서도 계산하지 않는다** — 실제 계산은 `resolveCrewColorCollision`
 * (`lib/rules/crew-color-hash.ts`, D-026)이 아래 모듈 스코프에서 한 번 끝내고,
 * `MonthCalendar`·`MeetupBar`는 그 결과 `colorIndex`만 받는다. `MonthCalendarContainer`
 * (실제 페이지)가 하는 일과 같은 순서다 — 다만 이 파일은 `@/lib/data`를 import할 수 없는
 * 표현 전용 구역(`docs/CONVENTIONS.md` zone 4)이라 Mock 조회 대신 손으로 데이터를 짰다.
 */

const DEMO_YEAR = 2026;
const DEMO_MONTH = 8;
/** 실제 Mock 시드의 R-017/D-026 강제 충돌 데모 날짜(`generate-meetups.ts`의
 *  `forcedCollisionDate` = SEED_NOW + 21일 = 2026-08-14)와 맞췄다 — 우연이 아니다. */
const DEMO_TODAY_ISO = "2026-08-14";

/**
 * D-006 `hash(crewId) mod 12`가 두 크루를 같은 버킷에 떨어뜨린 상황을 재현한다. 실제 해시가
 * 우연히 충돌할 확률은 낮아(1/12) 데모로는 `generate-meetups.ts`가 이미 하는 것과 같은 방식으로
 * "일부러" 같은 기본 인덱스를 준다.
 */
const RUNNING_CREW_BASE_INDEX = 5; // periwinkle
const HIKING_CREW_BASE_INDEX = RUNNING_CREW_BASE_INDEX; // 강제 충돌
const hikingResolvedIndex = resolveCrewColorCollision(HIKING_CREW_BASE_INDEX, [
  RUNNING_CREW_BASE_INDEX,
]);

function emptyDay(day: BareCalendarDay): CalendarDayData {
  return { ...day, bars: [], overflowCount: 0, allMeetupSummaries: [] };
}

const baseWeeks = buildMonthWeeks(DEMO_YEAR, DEMO_MONTH, DEMO_TODAY_ISO);

const populatedWeeks: CalendarDayData[][] = baseWeeks.map((week) =>
  week.map((day): CalendarDayData => {
    if (day.iso === "2026-08-14") {
      const bars = [
        {
          id: "demo-meetup-running",
          crewName: "새벽 러닝 크루",
          title: "한강 5km 정기런",
          colorIndex: RUNNING_CREW_BASE_INDEX,
        },
        {
          id: "demo-meetup-hiking",
          crewName: "주말 등산 모임",
          title: "북한산 둘레길 완주",
          colorIndex: hikingResolvedIndex,
        },
      ];
      return {
        ...day,
        bars,
        overflowCount: 0,
        allMeetupSummaries: bars.map(({ crewName, title }) => ({ crewName, title })),
      };
    }
    if (day.iso === "2026-08-20") {
      const all = [
        { crewName: "보드게임 소모임", title: "월례 정기모임" },
        { crewName: "사진 동호회", title: "야경 출사" },
        { crewName: "북클럽", title: "8월 지정 도서 토론" },
        { crewName: "스터디 크루", title: "알고리즘 스터디" },
        { crewName: "홈베이킹 모임", title: "레시피 공유회" },
      ];
      const bars = all.slice(0, MAX_VISIBLE_BARS_PER_DAY).map((meetup, index) => ({
        id: `demo-overflow-${index}`,
        ...meetup,
        colorIndex: (index * 2) % 12,
      }));
      return {
        ...day,
        bars,
        overflowCount: all.length - MAX_VISIBLE_BARS_PER_DAY,
        allMeetupSummaries: all,
      };
    }
    return emptyDay(day);
  }),
);

const emptyWeeks: CalendarDayData[][] = baseWeeks.map((week) => week.map(emptyDay));

export const calendarSection = defineSection({
  id: "calendar",
  label: "캘린더",
  title: "캘린더 — MonthCalendar · MeetupBar",
  description: (
    <>
      통합 캘린더 월간 격자와 Meetup 막대입니다(FR-060~063, Task 021A). 크루 필터·날짜 상세
      패널·홈 대시보드는 다음 회차(Task 021B) 몫이라 이 섹션에는 없습니다.
    </>
  ),
  items: [
    {
      name: "MonthCalendar",
      note: "프리뷰 프레임 폭을 360으로 내려도 가로 스크롤이 없어야 합니다(NFR-005·026). 날짜 셀에 포커스를 두고 방향키·Home·End로 이동해 보세요(roving tabindex, NFR-020). 8/14는 두 크루가 같은 팔레트 버킷에 강제로 충돌한 뒤 D-026 회피 워크로 서로 다른 색을 받은 예시이고, 8/20은 Meetup 5건 중 3개 + \"+2\"로 요약되는 오버플로 예시입니다.",
      panels: {
        default: (
          <PreviewFrame height={520} resizable>
            <div className="p-3">
              <MonthCalendar
                year={DEMO_YEAR}
                month={DEMO_MONTH}
                weeks={populatedWeeks}
                prevMonthHref="#"
                nextMonthHref="#"
              />
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={520} resizable>
            <div className="flex flex-col gap-3 p-3" aria-busy="true">
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
          </PreviewFrame>
        ),
        empty: (
          <PreviewFrame height={520} resizable>
            <div className="p-3">
              <MonthCalendar
                year={DEMO_YEAR}
                month={DEMO_MONTH}
                weeks={emptyWeeks}
                prevMonthHref="#"
                nextMonthHref="#"
                isEmpty
              />
            </div>
          </PreviewFrame>
        ),
        // onRetry는 함수(클로저)라 이 파일(서버 컴포넌트)에서 만들 수 없다 — Client
        // Component(ErrorState)에 함수 prop을 서버에서 직접 넘기면 직렬화 경계 위반이다
        // (`primitives.tsx`의 ErrorState 데모와 같은 이유). 실제 화면에서는 컨테이너(클라이언트
        // 경계)가 재시도 콜백을 만들어 내려준다.
        error: (
          <div className="flex flex-col gap-3">
            <ErrorState
              title={strings.calendar.month.errorTitle}
              description={strings.calendar.month.errorDescription}
            />
            <ErrorState
              title={strings.calendar.month.forbiddenTitle}
              description={strings.calendar.month.forbiddenDescription}
            />
          </div>
        ),
      },
    },
    {
      name: "MeetupBar",
      note: "크루명 라벨과 색만 받는 표현 컴포넌트입니다. 색 계산(D-026)은 이 컴포넌트 밖에서 이미 끝나 있고, 공간이 부족하면 크루명이 말줄임됩니다(FR-062).",
      content: (
        <div className="flex max-w-xs flex-col gap-1 rounded-lg border border-border bg-background p-3">
          <MeetupBar
            crewName="새벽 러닝 크루"
            title="한강 5km 정기런"
            colorIndex={RUNNING_CREW_BASE_INDEX}
          />
          <MeetupBar
            crewName="주말 등산 모임(같은 날 충돌 회피됨)"
            title="북한산 둘레길 완주"
            colorIndex={hikingResolvedIndex}
          />
          <MeetupBar
            crewName="아주 긴 크루 이름은 이렇게 말줄임됩니다"
            title="정기 모임"
            colorIndex={9}
          />
        </div>
      ),
    },
  ],
});
