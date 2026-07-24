import type { PollStatus } from "@/lib/types/poll.types";

/**
 * FR-042 AC4 · D-031 — 진행 중 투표의 집계 공개 범위 판정.
 *
 * D-003은 "집계만 공개, 개인 선택은 비공개"를 정했지만, 대상자가 2~3명인 크루에서는
 * 집계에서 자기 표 하나를 빼는 것만으로 타인의 선택이 드러난다 — `PollVote` 행을 RLS로
 * 막아도 **집계 자체가 누설**되므로 접근 제어로는 풀 수 없다(D-031). 그래서 **대상자
 * 5명 미만이면 진행 중에는 "N명 참여"만 노출**하고, 종료 시점에는 인원수와 무관하게
 * 공개한다 — D-031이 뒤집는 것은 "진행 중" 한정이지 D-003의 "집계 공개" 원칙 자체가
 * 아니다.
 *
 * 이 임계값(5명)은 Task 019(투표 UI)가 처음 코드로 옮기는 판정이라 `lib/rules/`에 둔다
 * (NFR-036, R-015) — 컴포넌트가 "5"를 매직 넘버로 인라인하면 다음에 이 값이 바뀔 때
 * 컴포넌트 코드를 다시 뒤져야 한다.
 */
const MIN_ELIGIBLE_VOTERS_FOR_LIVE_TALLY = 5;

export function shouldShowDetailedTally(
  eligibleVoterCount: number,
  status: PollStatus,
): boolean {
  if (status === "open") {
    return eligibleVoterCount >= MIN_ELIGIBLE_VOTERS_FOR_LIVE_TALLY;
  }
  // 종료된 투표(closed_*·cancelled)는 인원수와 무관하게 공개한다 — D-031은 "진행 중"만 가린다.
  return true;
}
