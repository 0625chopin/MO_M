/**
 * `MonthCalendar`/`MeetupBar`가 공유하는 순수 데이터 타입 + 상수 — Task 021A.
 *
 * **왜 별도 파일인가**: `MonthCalendar.tsx`는 roving tabindex 상태 때문에 `"use client"`다.
 * Next.js는 `"use client"` 모듈의 export를 "클라이언트 레퍼런스"로 바꾸는데, 이 변환은
 * React 컴포넌트가 아닌 일반 값(`MAX_VISIBLE_BARS_PER_DAY` 같은 상수)에도 적용된다 —
 * 서버 컴포넌트(`MonthCalendarContainer`)가 그 값을 가져다 산술 연산에 쓰면 실제 숫자가 아니라
 * 클라이언트 레퍼런스 스텁을 받아 `NaN`이 된다(실측: "일정 NaN건"으로 렌더된 것을 컨테이너
 * 통합 후 실제로 재현·확인했다). 타입(`interface`)은 컴파일 타임에 지워져 이 문제가 없지만,
 * **값**은 서버·클라이언트 양쪽이 다 참조해야 하면 `"use client"`가 아닌 모듈에 둬야 한다.
 * 그래서 `MonthCalendar.tsx`·`MonthCalendarContainer.tsx`·`/sample`의 `calendar.tsx` 셋 다
 * 이 파일에서 가져다 쓴다.
 */

/** 하루 셀에 실제로 그리는 최대 바 개수(FR-061 AC2 "바 3개 + '+2'"). */
export const MAX_VISIBLE_BARS_PER_DAY = 3;

export interface CalendarBarData {
  /** React key + `aria-describedby` 텍스트 매칭용. 보통 Meetup id. */
  id: string;
  crewName: string;
  title: string;
  /** 이 날짜 셀에서 이미 D-026 충돌 회피까지 끝난 최종 팔레트 인덱스. */
  colorIndex: number;
}

export interface CalendarDayData {
  /** YYYY-MM-DD. */
  iso: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  /** 이미 {@link MAX_VISIBLE_BARS_PER_DAY}로 잘린 목록 — `MonthCalendar`는 자르지 않는다. */
  bars: CalendarBarData[];
  /** 잘려서 안 보이는 나머지 건수(0이면 "+N" 칩을 그리지 않는다). */
  overflowCount: number;
  /**
   * 이 날짜의 Meetup 전체(오버플로 포함) 크루명·제목 — 스크린 리더 설명(`aria-describedby`)에
   * 쓴다. 시각적으로는 3개만 보여도 접근성 정보는 전체를 전달한다(FR-061 AC3).
   */
  allMeetupSummaries: Array<{ crewName: string; title: string }>;
}
