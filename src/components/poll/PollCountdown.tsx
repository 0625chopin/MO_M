import { formatPollDeadline, formatRemainingDuration } from "@/components/poll/format-poll-countdown";
import { strings, t } from "@/lib/strings";
import type { PollStatus } from "@/lib/types";

export interface PollCountdownProps {
  status: PollStatus;
  closesAt: string;
  remainingMs: number;
  /** D-024 — 마감은 지났지만 자동 종료가 아직 반영되지 않은 window. */
  isAwaitingClosure: boolean;
}

/**
 * 마감 카운트다운(FR-042 AC1 "남은 시간"). 순수 표현 컴포넌트 — `"use client"`가 아니다.
 *
 * **1초 타이머로 갱신하지 않는다.** `format-post-date.ts`가 이미 같은 이유로 상대 시각
 * 표시를 피한 선례를 따른다 — 서버 렌더 시각과 사용자가 보는 시각이 갈라지고, 하이드레이션
 * 시각차로 값이 흔들릴 위험이 있다. 대신 이 화면은 투표 참여(`castVoteAction`)·조기 종료
 * (`closePollEarlyAction`) 후 `refresh()`로, 또는 다음 페이지 진입 시 서버가 새로 계산해
 * 다시 그린다 — 카운트다운 정확성은 "렌더링 전략"(재검증 시점)으로 확보하지 타이머로
 * 확보하지 않는다(CLAUDE.md 성능 원칙).
 */
export function PollCountdown({ status, closesAt, remainingMs, isAwaitingClosure }: PollCountdownProps) {
  if (isAwaitingClosure) {
    return (
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{strings.vote.status.tallying}</span>
        {" · "}
        {strings.vote.tallyingDescription}
      </p>
    );
  }

  if (status !== "open") {
    return (
      <p className="text-sm text-muted-foreground tnum">
        {t((s) => s.vote.summary.closedAt, { time: formatPollDeadline(closesAt) })}
      </p>
    );
  }

  return (
    <p className="text-sm tnum">
      {t((s) => s.vote.summary.timeLeft, { time: formatRemainingDuration(remainingMs) })}
    </p>
  );
}
