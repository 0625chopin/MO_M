"use client";

import { useState, useTransition } from "react";

import type { PollBallotViewer } from "@/components/poll/poll-view-models";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { castVoteAction } from "@/lib/actions/cast-vote";
import { strings } from "@/lib/strings";
import type { Id, VoteChoice } from "@/lib/types";

export interface PollBallotProps {
  crewId: Id;
  pollId: Id;
  /** `poll.status === "open" && !isAwaitingClosure`(D-024) — 컨테이너가 이미 판정해 넘긴다. */
  isVotable: boolean;
  viewer: PollBallotViewer;
}

const CHOICES: { value: VoteChoice; label: string }[] = [
  { value: "for", label: strings.vote.choice.approve },
  { value: "against", label: strings.vote.choice.reject },
  { value: "abstain", label: strings.vote.choice.abstain },
];

const INELIGIBLE_MESSAGE: Record<"not_crew_member" | "not_in_snapshot", string> = {
  not_crew_member: strings.vote.errors.notEligibleNotMember,
  not_in_snapshot: strings.vote.errors.notEligibleNotInSnapshot,
};

/**
 * 투표 참여 UI(FR-041). 유일한 클라이언트 경계 — 버튼 클릭이 곧 제출이다("① 상세 → ② 찬성·
 * 반대·기권 중 선택 → ③ 즉시 반영", 별도 확인 다이얼로그 없음). `castVoteAction`을
 * `useTransition`으로 직접 호출한다(성공해도 같은 화면에 남는 폼이라 `useActionState`가 아니라
 * `docs/CONVENTIONS.md` "Server Action 폼 상태 관리"의 두 번째 갈래 — `PostActions.tsx`와
 * 같은 패턴).
 *
 * **낙관적 반영 + 롤백(FR-041 AC1·E4)**: 클릭 즉시 로컬 선택을 바꾸고, 서버가 실패를 돌려주면
 * 이전 선택으로 되돌린다.
 */
export function PollBallot({ crewId, pollId, isVotable, viewer }: PollBallotProps) {
  const [choice, setChoice] = useState<VoteChoice | null>(viewer.myChoice);
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const disabled = !isVotable || !viewer.canVote || pending;

  function handleSelect(next: VoteChoice) {
    if (disabled || next === choice) return;
    const previous = choice;
    setChoice(next); // 낙관적 반영
    setErrorMessage(null);
    startTransition(async () => {
      const result = await castVoteAction({ crewId, pollId, choice: next });
      if (!result.ok) {
        setChoice(previous); // 롤백(E4)
        setErrorMessage(result.error.message || strings.vote.errors.submitFailed);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {!isVotable && <p className="text-sm text-muted-foreground">{strings.vote.errors.votingClosed}</p>}
      {isVotable && !viewer.canVote && viewer.ineligibleReason && (
        <p className="text-sm text-muted-foreground">{INELIGIBLE_MESSAGE[viewer.ineligibleReason]}</p>
      )}

      <div role="group" aria-label={strings.vote.choice.approve} className="grid grid-cols-3 gap-2">
        {CHOICES.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={choice === value ? "default" : "outline"}
            aria-pressed={choice === value}
            disabled={disabled}
            onClick={() => handleSelect(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {errorMessage && (
        <ErrorState title={strings.error.network.title} description={errorMessage} />
      )}
    </div>
  );
}
