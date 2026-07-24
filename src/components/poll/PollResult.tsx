import Link from "next/link";

import { PollStatusBadge } from "@/components/board/PollStatusBadge";
import { PollTally } from "@/components/poll/PollTally";
import { isPollTie } from "@/lib/rules/poll-decision";
import { strings } from "@/lib/strings";
import type { PollOutcome, PollStatus, PollTally as PollTallyCounts } from "@/lib/types";

export interface PollResultProps {
  status: PollStatus;
  /** 진행 중(`open`)이면 `null`이 아니라 이 컴포넌트 자체가 렌더되지 않는다 — `PollPanel`이
   *  `status`로 이미 갈라 호출한다(상태 전이 UI). `cancelled`(FR-046 철회)도 `null`이다 —
   *  철회는 찬반 판정이 아니라 그 자체로 사유 문구가 없다. */
  outcome: PollOutcome | null;
  tally: PollTallyCounts;
  eligibleVoterCount: number;
  votedCount: number;
  quorumRequired: number;
  quorumMet: boolean;
  /** FR-060 1:1 — 가결(`closed_passed`) Meetup 리소스 ID로 조립한 경로(R-016). Meetup 생성
   *  파이프라인(Task 034)이 아직 없어 가결이어도 `null`일 수 있다(정상 상태). */
  meetupHref: string | null;
}

/**
 * 종료된 투표의 최종 결과(FR-042 AC3 · FR-044). `PollPanel`이 `poll.status !== "open"`일 때만
 * 골라 렌더하는 표현 컴포넌트다 — 진행 중 집계(`PollTally`)와 마감 카운트다운(`PollCountdown`)을
 * 대체한다(상태 전이 UI). 집계 표시 자체는 `PollTally`를 그대로 재사용한다 — 종료된 투표는
 * 인원수와 무관하게 항상 상세 집계를 보여주므로(D-031, "진행 중"만 가린다) `showDetailed`를
 * 항상 `true`로 고정해 넘긴다.
 *
 * **판정을 다시 하지 않는다(NFR-036, R-015)**: 이 컴포넌트가 받는 `outcome`·`tally`는
 * `decidePollOutcome`(`lib/rules/poll-decision.ts`)이 이미 확정한 값이다. 아래 `resolveResultReason`은
 * 그 확정된 값 중 어느 안내 **문구**를 고를지만 정할 뿐 — "정족수 충족 여부"·"찬반 비교" 자체를
 * 다시 계산하지 않는다(`PollCountdown`이 `status`로 문구를 고르는 것과 같은 자리, 판정이 아니라
 * 표시 분기). "동수였는지"만 한 번 더 알아야 하는데(`outcome`은 "부결"만 알려주고 사유는 모른다),
 * 그 비교식을 여기 인라인하면 `decidePollOutcome`의 동수 판정식과 저장소 두 곳에 같은 식이
 * 생겨 하나가 바뀌면 나머지가 조용히 갈리는 R-015 위험이 된다 — 그래서 `lib/rules/poll-decision.ts`가
 * 내부적으로 쓰는 `isPollTie`를 그대로 호출만 한다(8일차 CREW 교차검증 지적으로 추출).
 */
export function PollResult({
  status,
  outcome,
  tally,
  eligibleVoterCount,
  votedCount,
  quorumRequired,
  quorumMet,
  meetupHref,
}: PollResultProps) {
  const reason = resolveResultReason(outcome, tally);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PollStatusBadge status={status} />
        {meetupHref && (
          <Link
            href={meetupHref}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {strings.meetup.detail.viewConfirmed}
          </Link>
        )}
      </div>

      {reason && <p className="text-sm text-foreground">{reason}</p>}

      <PollTally
        tally={tally}
        eligibleVoterCount={eligibleVoterCount}
        votedCount={votedCount}
        quorumRequired={quorumRequired}
        quorumMet={quorumMet}
        showDetailed
      />
    </div>
  );
}

function resolveResultReason(outcome: PollOutcome | null, tally: PollTallyCounts): string | null {
  if (outcome === null) return null; // cancelled(FR-046) — 철회는 사유 문구를 갖지 않는다
  if (outcome === "invalid") return strings.vote.resultReason.invalidQuorum;
  if (outcome === "passed") return strings.vote.resultReason.passed;
  return isPollTie(tally) ? strings.vote.resultReason.rejectedTie : strings.vote.resultReason.rejectedMajority;
}
