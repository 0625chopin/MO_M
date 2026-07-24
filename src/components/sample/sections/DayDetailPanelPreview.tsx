"use client";

import { useState } from "react";

import type { CalendarMeetupDetail } from "@/components/calendar/calendar-types";
import { DayDetailPanel } from "@/components/calendar/DayDetailPanel";
import { Button } from "@/components/ui/button";


const SAMPLE_MEETUPS: CalendarMeetupDetail[] = [
  {
    id: "sample-meetup-running",
    crewId: "sample-crew-running",
    crewName: "새벽 러닝 크루",
    title: "한강 5km 정기런",
    colorIndex: 5,
    startTime: "07:00",
    place: "한강공원 반포지구",
    attendingCount: 12,
    capacity: 20,
    isCancelled: false,
    postHref: "#",
  },
  {
    id: "sample-meetup-hiking",
    crewId: "sample-crew-hiking",
    crewName: "주말 등산 모임",
    title: "북한산 둘레길 완주",
    colorIndex: 6,
    startTime: "09:00",
    place: "북한산 둘레길",
    attendingCount: 6,
    capacity: null,
    isCancelled: false,
    postHref: "#",
  },
  {
    id: "sample-meetup-cancelled",
    crewId: "sample-crew-boardgame",
    crewName: "보드게임 소모임",
    title: "월례 정기모임",
    colorIndex: 9,
    startTime: null,
    place: null,
    attendingCount: 0,
    capacity: 10,
    isCancelled: true,
    postHref: null,
  },
];

/**
 * `/sample` 전용 클라이언트 경계 — `DayDetailPanel`은 `open`/`onOpenChange`를 부모가 제어하는
 * 표현 컴포넌트라, 여는 상태를 갖는 트리거가 있어야 실제로 열어 볼 수 있다(`overlays.tsx`의
 * `ToastTriggerPreview`와 같은 이유 — 서버 컴포넌트인 `sections/calendar.tsx`가 `useState`를
 * 가질 수 없다). 네 버튼이 4상태와 1:1 대응한다 — "기본"은 취소 배지 1건을 포함한 3건, "빈
 * 상태"는 그날 Meetup이 0건(FR-063 E1), "로딩"·"오류"는 `DayDetailPanel`의 `status` prop을
 * 그 값으로 고정해 연다(CORE 재검증 지적, 7일차 — 처음엔 이 둘이 없어 2/4 커버리지였다).
 * `status`는 `/sample` 전용이고 실제 호출부(`MonthCalendar.tsx`)는 쓰지 않는다(`DayDetailPanel.tsx`
 * 모듈 docstring 참고).
 */
export function DayDetailPanelPreview() {
  const [openState, setOpenState] = useState<"default" | "empty" | "loading" | "error" | null>(
    null,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setOpenState("default")}>
        기본 상태 열기 (Meetup 3건, 그중 1건 취소)
      </Button>
      <Button variant="outline" size="sm" onClick={() => setOpenState("empty")}>
        빈 상태 열기 (Meetup 0건)
      </Button>
      <Button variant="outline" size="sm" onClick={() => setOpenState("loading")}>
        로딩 상태 열기
      </Button>
      <Button variant="outline" size="sm" onClick={() => setOpenState("error")}>
        오류 상태 열기
      </Button>

      <DayDetailPanel
        open={openState === "default"}
        onOpenChange={(open) => !open && setOpenState(null)}
        dateLabel="8월 14일 금요일"
        meetups={SAMPLE_MEETUPS}
      />
      <DayDetailPanel
        open={openState === "empty"}
        onOpenChange={(open) => !open && setOpenState(null)}
        dateLabel="8월 15일 토요일"
        meetups={[]}
      />
      <DayDetailPanel
        open={openState === "loading"}
        onOpenChange={(open) => !open && setOpenState(null)}
        dateLabel="8월 16일 일요일"
        meetups={[]}
        status="loading"
      />
      <DayDetailPanel
        open={openState === "error"}
        onOpenChange={(open) => !open && setOpenState(null)}
        dateLabel="8월 17일 월요일"
        meetups={[]}
        status="error"
      />
    </div>
  );
}
