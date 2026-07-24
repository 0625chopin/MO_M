import { Badge } from "@/components/ui/badge";
import { strings, t } from "@/lib/strings";
import type { PollTally as PollTallyCounts } from "@/lib/types";

export interface PollTallyProps {
  tally: PollTallyCounts;
  eligibleVoterCount: number;
  votedCount: number;
  quorumRequired: number;
  quorumMet: boolean;
  /** D-031 — `false`면 대상자 5명 미만인 진행 중 투표라 선택지별 집계를 숨긴다. */
  showDetailed: boolean;
}

/**
 * 진행 중 투표 현황(FR-042 AC1). 순수 표현 컴포넌트.
 *
 * **D-031**: 대상자가 5명 미만이면 진행 중에는 "N명 참여"만 보여주고 찬성/반대/기권 개별
 * 집계는 숨긴다 — RLS로 `PollVote` 행 자체를 막아도 집계에서 자기 표 하나를 빼는 것만으로
 * 타인의 선택이 드러나는 소규모 크루의 구조적 문제라(D-031 맥락), 이 컴포넌트가 `showDetailed`
 * 여부와 무관하게 항상 볼 수 있는 것은 참여자 "수"뿐이다. `showDetailed` 자체는
 * `lib/rules/poll-tally-visibility.ts`의 `shouldShowDetailedTally`가 판정해 컨테이너가
 * 넘긴다 — 이 컴포넌트는 그 결과를 분기만 한다(판정을 다시 하지 않는다, NFR-036).
 *
 * **10일차 접근성 QA(Task 024, NFR-021 "투표 집계")**: 루트에 `aria-live="polite"`를
 * 둔다 — 실시간 구독으로 표가 들어와 이 블록이 다시 그려질 때마다 참여자 수·정족수 배지가
 * 스크린 리더에도 갱신 안내된다. 블록 하나가 작아 통째로 다시 읽혀도 소음이 되지 않는다
 * (채팅 메시지 목록처럼 계속 자라는 목록과 달리 `aria-atomic`으로 묶어도 안전하다).
 */
export function PollTally({
  tally,
  eligibleVoterCount,
  votedCount,
  quorumRequired,
  quorumMet,
  showDetailed,
}: PollTallyProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm tnum">
          {t((s) => s.vote.summary.participants, { voted: votedCount, total: eligibleVoterCount })}
        </p>
        <Badge variant={quorumMet ? "default" : "secondary"}>
          {quorumMet ? strings.vote.summary.quorumMet : strings.vote.summary.quorumNotMet}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground tnum">
        {t((s) => s.vote.summary.quorum, { quorum: quorumRequired })}
      </p>

      {showDetailed && (
        <dl className="mt-1 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{strings.vote.choice.approve}</dt>
            <dd className="text-base font-semibold tnum">{tally.forCount}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{strings.vote.choice.reject}</dt>
            <dd className="text-base font-semibold tnum">{tally.againstCount}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{strings.vote.choice.abstain}</dt>
            <dd className="text-base font-semibold tnum">{tally.abstainCount}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
