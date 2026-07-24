"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { formatDayLabelKo } from "@/components/calendar/date-grid";
import { DayDetailPanel } from "@/components/calendar/DayDetailPanel";
import { MeetupBar } from "@/components/calendar/MeetupBar";
import { buttonVariants } from "@/components/ui/button";
import { strings, t } from "@/lib/strings";
import { cn } from "@/lib/utils";

import type { CalendarDayData } from "./calendar-types";
import type { KeyboardEvent } from "react";

// `MAX_VISIBLE_BARS_PER_DAY`·`CalendarDayData`·`CalendarBarData`의 단일 소스는
// `calendar-types.ts`다 — **값**(`MAX_VISIBLE_BARS_PER_DAY`)은 여기서 다시 export하지
// 않는다. 이 파일은 `"use client"`라, 서버 컴포넌트(`MonthCalendarContainer`)가 이 파일을
// 거쳐 그 값을 가져가면 실제 숫자가 아니라 클라이언트 레퍼런스 스텁을 받는다 — 산술에 섞이면
// `NaN`이 된다(`calendar-types.ts` 모듈 docstring의 "왜 별도 파일인가" 참고, 실측으로 확인한
// 버그). 컨테이너·`/sample`은 반드시 `calendar-types.ts`에서 직접 값을 가져온다. **타입**은
// 컴파일 타임에 지워지므로 재수출해도 안전하다.
export type { CalendarBarData, CalendarDayData } from "./calendar-types";

export interface MonthCalendarProps {
  year: number;
  /** 1-12. */
  month: number;
  /** 6주(42칸) 고정 격자 — `date-grid.ts`의 `buildMonthWeeks`가 만든 뼈대에 바를 채운 것. */
  weeks: CalendarDayData[][];
  prevMonthHref: string;
  nextMonthHref: string;
  /** FR-061 E1 — 이번 달 전체에 Meetup이 0건일 때만 `true`로 넘긴다. */
  isEmpty?: boolean;
  className?: string;
}

function cellDomId(iso: string): string {
  return `month-calendar-cell-${iso}`;
}

function cellDescId(iso: string): string {
  return `month-calendar-desc-${iso}`;
}

/**
 * 통합 캘린더 월간 격자(FR-060~063) — Task 021A. 표현 컴포넌트(D-030 ①) — 데이터는 전부
 * props로 받고 `lib/data`를 import하지 않는다. 색도 계산하지 않는다(`MeetupBar.tsx` 참고) —
 * `colorIndex`는 호출자가 이미 결정한 값이다.
 *
 * **키보드 셀 내비(NFR-020)**: roving tabindex 패턴이다 — 42칸 중 정확히 하나만
 * `tabIndex=0`이고 나머지는 `-1`이다. 방향키(←→↑↓)·Home·End로 `activeIso`를 옮기고 실제
 * DOM 포커스도 함께 옮긴다. `Enter`/`Space`(WAI-ARIA APG grid 패턴의 셀 활성화 키)와 클릭은
 * `DayDetailPanel`(Task 021B, FR-063)을 연다 — 021A가 남겨 둔 지점을 이번 회차에 채웠다.
 * 패널이 여는 데이터(`day.meetups`)는 이미 이 컴포넌트가 props로 받아 둔 값이라 클릭 시
 * 새로 조회하지 않는다(D-012 조회 전용 원칙 그대로 — 클릭은 이미 있는 데이터를 보여줄
 * 뿐 아무것도 만들지 않는다).
 *
 * **360px 무-가로스크롤(NFR-005·026)**: 셀 폭에 고정 px를 쓰지 않는다 — `grid-cols-7` +
 * `min-w-0`으로 셀이 부모 폭을 따라 줄어들게 하고, 바 텍스트는 `truncate`로 말줄임한다.
 */
export function MonthCalendar({
  year,
  month,
  weeks,
  prevMonthHref,
  nextMonthHref,
  isEmpty,
  className,
}: MonthCalendarProps) {
  const days = weeks.flat();
  const initialFocusIso =
    days.find((d) => d.isToday)?.iso ?? days.find((d) => d.isCurrentMonth)?.iso ?? days[0]?.iso;
  const [activeIso, setActiveIso] = useState(initialFocusIso);
  /** 열려 있는 `DayDetailPanel`의 날짜(`null`이면 닫힘) — Task 021B, FR-063. */
  const [openIso, setOpenIso] = useState<string | null>(null);
  const openDay = days.find((d) => d.iso === openIso);

  function openDetailPanel(iso: string) {
    setOpenIso(iso);
  }

  function focusIndex(index: number) {
    const clamped = Math.min(Math.max(index, 0), days.length - 1);
    const nextIso = days[clamped]?.iso;
    if (!nextIso) return;
    setActiveIso(nextIso);
    // 실제 DOM 포커스도 옮긴다 — roving tabindex는 tabIndex만으로는 포커스가 이동하지 않는다.
    const el = document.getElementById(cellDomId(nextIso));
    el?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, iso: string) {
    const index = days.findIndex((d) => d.iso === iso);
    if (index === -1) return;
    const rowStart = index - (index % 7);

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        focusIndex(index - 1);
        return;
      case "ArrowRight":
        event.preventDefault();
        focusIndex(index + 1);
        return;
      case "ArrowUp":
        event.preventDefault();
        focusIndex(index - 7);
        return;
      case "ArrowDown":
        event.preventDefault();
        focusIndex(index + 7);
        return;
      case "Home":
        event.preventDefault();
        focusIndex(rowStart);
        return;
      case "End":
        event.preventDefault();
        focusIndex(rowStart + 6);
        return;
      case "Enter":
      case " ":
        // Space는 기본 동작이 페이지 스크롤이라 반드시 막는다(WAI-ARIA APG grid 패턴 — 셀
        // 활성화 키는 Enter/Space 둘 다다).
        event.preventDefault();
        openDetailPanel(iso);
        return;
      default:
        return;
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="tnum font-mono text-base font-semibold text-foreground">
          {t((s) => s.calendar.month.monthLabel, { year, month })}
        </h2>
        <div className="flex items-center gap-1">
          <Link
            href={prevMonthHref}
            aria-label={strings.calendar.month.prevMonth}
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          >
            <ChevronLeft aria-hidden="true" />
          </Link>
          <Link
            href={nextMonthHref}
            aria-label={strings.calendar.month.nextMonth}
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          >
            <ChevronRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      {isEmpty && (
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          {strings.calendar.month.empty}
        </p>
      )}

      <div className="@container">
        <div role="grid" aria-label={t((s) => s.calendar.month.monthLabel, { year, month })}>
          <div role="row" className="grid grid-cols-7 gap-1 pb-1">
            {strings.calendar.month.weekdayShort.map((label) => (
              <div
                key={label}
                role="columnheader"
                className="min-w-0 text-center text-xs font-medium text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            // 주(week)는 안정적인 자연키가 없고 격자 안 순서 자체가 의미라 인덱스 키를 쓴다.
            <div key={weekIndex} role="row" className="grid grid-cols-7 gap-1">
              {week.map((day) => (
                <div
                  key={day.iso}
                  id={cellDomId(day.iso)}
                  role="gridcell"
                  tabIndex={day.iso === activeIso ? 0 : -1}
                  aria-label={t((s) => s.calendar.month.dayAriaLabel, {
                    date: formatDayLabelKo(day.iso),
                    count: day.bars.length + day.overflowCount,
                  })}
                  aria-describedby={day.meetups.length > 0 ? cellDescId(day.iso) : undefined}
                  aria-current={day.isToday ? "date" : undefined}
                  onFocus={() => setActiveIso(day.iso)}
                  onKeyDown={(event) => handleKeyDown(event, day.iso)}
                  onClick={() => openDetailPanel(day.iso)}
                  className={cn(
                    "flex min-h-16 min-w-0 flex-col gap-0.5 rounded-md border border-transparent p-1 text-left outline-none @sm:min-h-20",
                    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
                    !day.isCurrentMonth && "opacity-40",
                    day.isToday && "border-border bg-muted/40",
                  )}
                >
                  <span className="tnum text-xs font-medium text-foreground">{day.day}</span>
                  <div className="flex min-w-0 flex-col gap-0.5" aria-hidden="true">
                    {day.bars.map((bar) => (
                      <MeetupBar
                        key={bar.id}
                        crewName={bar.crewName}
                        title={bar.title}
                        colorIndex={bar.colorIndex}
                        hideOwnLabel
                      />
                    ))}
                    {day.overflowCount > 0 && (
                      <span className="tnum px-1.5 text-xs text-muted-foreground">
                        {t((s) => s.calendar.month.overflowLabel, { n: day.overflowCount })}
                      </span>
                    )}
                  </div>
                  {day.meetups.length > 0 && (
                    <span id={cellDescId(day.iso)} className="sr-only">
                      {day.meetups
                        .map((m) =>
                          t((s) => s.calendar.month.barAriaLabel, {
                            crewName: m.crewName,
                            title: m.title,
                          }),
                        )
                        .join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <DayDetailPanel
        open={openIso !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIso(null);
        }}
        dateLabel={openIso ? formatDayLabelKo(openIso) : ""}
        meetups={openDay?.meetups ?? []}
      />
    </div>
  );
}
