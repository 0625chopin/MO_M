import type { ISODateString, ISODateTimeString } from "@/lib/types/common.types";

import {
  isPollClosingBeforeMeetupDate,
  isPollExpired,
  toZonedDateString,
  validatePollDuration,
} from "./poll-timezone";

/**
 * 모임 제안글 날짜 검증 — 순수 함수 (NFR-036, R-015, Task 018B, D-013).
 *
 * FR-034 예외 흐름 E1~E3(AC2·AC3)의 판정을 조립한다. **타임존 경계 처리를 새로 만들지
 * 않는다** — Task 009A가 만든 `poll-timezone.ts`의 `isPollExpired`(E3 — 마감이 이미
 * 과거)·`isPollClosingBeforeMeetupDate`(E2 — 마감이 예정일 이전이어야 한다, D-003
 * 원문 그대로)·`toZonedDateString`(E1 — "오늘" 판정)·`validatePollDuration`(D-003 투표
 * 기한 허용 범위 1시간~14일 — FR-034 E1~E3에는 명시되어 있지 않지만, 모임 제안글 등록이
 * Poll을 만드는 유일한 경로(FR-040 "행위자: 시스템, FR-034에 종속")라 이 지점 말고는
 * 이 규칙을 강제할 곳이 없다) 그대로를 조립만 한다.
 *
 * v0.1은 한국 단독 시장이고(D-011) `Profile`에 사용자별 타임존 필드가 없어(2026-07-24
 * 시점 스키마 확인), "오늘"·"과거" 판정 기준 타임존을 고정값 `Asia/Seoul`(KST)로 둔다 —
 * NFR-025가 교차 검증 대상으로 요구하는 3개 타임존(UTC·KST·UTC-8) 중 실제 서비스
 * 타임존이다. 사용자별 타임존이 나중에 생기면 `timeZone` 인자를 그 값으로 바꿔 호출하면
 * 된다 — 이 함수 자체는 고정값을 강제하지 않는다(선택적 인자, 기본값만 KST).
 *
 * React·Next·데이터 레이어를 import하지 않는다(zone 1, `eslint.config.mjs`).
 */

/** v0.1 고정 서비스 타임존(D-011). 사용자별 설정이 생기기 전까지의 기본값. */
export const MEETUP_PROPOSAL_TIME_ZONE = "Asia/Seoul";

export type MeetupProposalScheduleField = "scheduledDate" | "voteDeadline";

export type MeetupProposalScheduleReason =
  /** scheduledDate: FR-034 E1(예정일이 과거) / voteDeadline: E3(마감이 이미 과거). */
  | "in_past"
  /** voteDeadline: FR-034 E2·AC3 — 마감이 예정일 이후(D-003 "예정일 이전이어야 한다"). */
  | "after_schedule_date"
  /** voteDeadline: D-003 최소 투표 기간(1시간) 미달. */
  | "too_short"
  /** voteDeadline: D-003 최대 투표 기간(14일) 초과. */
  | "too_long";

export interface MeetupProposalScheduleViolation {
  field: MeetupProposalScheduleField;
  reason: MeetupProposalScheduleReason;
}

export interface MeetupProposalScheduleInput {
  /** 모임 예정일(시각 없음). */
  scheduledDate: ISODateString;
  /** 투표 마감 시각. */
  voteDeadline: ISODateTimeString;
  /** 판정 기준 "지금" — 순수 함수 유지를 위해 호출부가 넘긴다(Task 009A 원칙 그대로). */
  nowIso: ISODateTimeString;
  timeZone?: string;
}

/**
 * 위반 목록을 반환한다(빈 배열이면 유효). **필드당 최우선 위반 하나만** 보고한다 —
 * 마감이 이미 과거면 "기간이 너무 짧다"(음수 duration)도 동시에 참이 되는 경우가 있어
 * 같은 필드에 원인이 다른 메시지를 동시에 띄우면 사용자가 무엇부터 고쳐야 할지
 * 혼란스럽다. 우선순위: in_past → after_schedule_date → too_short/too_long.
 */
export function validateMeetupProposalSchedule(
  input: MeetupProposalScheduleInput,
): MeetupProposalScheduleViolation[] {
  const timeZone = input.timeZone ?? MEETUP_PROPOSAL_TIME_ZONE;
  const violations: MeetupProposalScheduleViolation[] = [];

  const today = toZonedDateString(input.nowIso, timeZone);
  if (input.scheduledDate < today) {
    violations.push({ field: "scheduledDate", reason: "in_past" });
  }

  // `voteDeadline`은 `toZonedDateString`(내부에서 `Intl.DateTimeFormat.format`을 쓴다)로
  // 넘어가는데, 파싱 불가능한 문자열(빈 값 포함)을 그 함수에 주면 `RangeError: Invalid time
  // value`로 **예외를 던진다**(Server Action은 페이지를 거치지 않고 직접 호출될 수 있어
  // 신뢰할 수 없는 입력이 들어올 수 있다 — 실측 확인함). `isPollExpired`(단순 epoch 비교)는
  // 이런 입력에도 조용히 `false`를 반환할 뿐 던지지 않지만, 그다음 분기에서 여전히
  // `toZonedDateString`을 타므로 이 함수 진입 시점에 먼저 걸러낸다.
  if (Number.isNaN(new Date(input.voteDeadline).getTime())) {
    violations.push({ field: "voteDeadline", reason: "in_past" });
  } else if (isPollExpired(input.voteDeadline, input.nowIso)) {
    violations.push({ field: "voteDeadline", reason: "in_past" });
  } else if (!isPollClosingBeforeMeetupDate(input.voteDeadline, input.scheduledDate, timeZone)) {
    violations.push({ field: "voteDeadline", reason: "after_schedule_date" });
  } else {
    const duration = validatePollDuration(input.nowIso, input.voteDeadline);
    if (!duration.valid) {
      violations.push({ field: "voteDeadline", reason: duration.reason });
    }
  }

  return violations;
}
