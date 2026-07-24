import { MEETUP_PROPOSAL_TIME_ZONE } from "@/lib/rules/meetup-proposal-schedule";

/**
 * `PollCountdown`의 순수 포맷팅 헬퍼 — `format-post-date.ts`(`components/board/`)와 같은 위치
 * 원칙: 도메인 판정이 아니라 표시 전용 가공이라 `lib/rules/`가 아니라 컴포넌트 옆에 둔다.
 *
 * **타임존 정확성(I-043)**: "지금부터 얼마나 남았는가"(`formatRemainingDuration`)는 두 UTC
 * epoch의 차이라 타임존이 필요 없다 — `lib/rules/poll-timezone.ts`의 `getPollRemainingMs`가
 * 이미 계산해 넘긴 `ms`를 그대로 나눈다. 반면 "언제 마감되는가"를 달력 날짜·시각으로 보여줘야
 * 하는 `formatPollDeadline`은 타임존이 필요하다 — I-043(제안글 날짜 검증의 기준 타임존이
 * 요구사항에 없다는 미결)이 열려 있으므로 **새로 정하지 않고**, 이미 `meetup-proposal-
 * schedule.ts`가 택한 고정값 `MEETUP_PROPOSAL_TIME_ZONE`("Asia/Seoul", D-011 v0.1 한국
 * 단독 시장 근거)을 그대로 재사용한다 — 투표 마감 시각과 모임 예정일은 같은 Poll 한 벌에서
 * 나온 값이라 서로 다른 타임존 기준을 쓸 이유가 없다.
 */

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** "2일 3시간" / "5시간 12분" / "12분" / "1분 미만" 형태. 렌더 시각에 한 번만 계산한다 —
 *  1초 타이머로 값을 갱신하지 않는다(렌더링 전략으로 성능 목표를 맞춘다, CLAUDE.md). */
export function formatRemainingDuration(ms: number): string {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / MS_PER_DAY);
  const hours = Math.floor((clamped % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((clamped % MS_PER_HOUR) / MS_PER_MINUTE);

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  if (minutes > 0) return `${minutes}분`;
  return "1분 미만";
}

/** "7월 31일 23:59" 형태 — `MEETUP_PROPOSAL_TIME_ZONE` 기준(위 docstring 참고). */
export function formatPollDeadline(closesAt: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: MEETUP_PROPOSAL_TIME_ZONE,
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(closesAt));
}
