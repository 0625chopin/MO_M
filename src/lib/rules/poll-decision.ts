import type { PollDecisionInput, PollDecisionResult, PollOutcome } from "@/lib/types/poll.types";

/**
 * 투표 최종 판정 (D-003).
 *
 * 판정 트리는 정확히 세 갈래이며, 문서에 없는 결과 코드(`PollOutcome` 3종 외)는
 * 추가하지 않는다:
 *
 * 1. **정족수 미달 → `invalid`** (FR-044 AC3). 찬반 집계와 무관하게 우선한다.
 * 2. **정족수 충족 + 동수(찬성 === 반대) → `rejected`** ("동수 처리: 부결", D-003).
 *    캘린더는 확정된 일정만 담아야 하므로 애매한 상태를 통과시키지 않는다는 것이
 *    근거다 — 오너 결선 투표 같은 타이브레이커는 두지 않는다.
 * 3. **정족수 충족 + 찬성 > 반대 → `passed`** (FR-044 AC1). 그 외(찬성 < 반대)는
 *    2와 같은 `rejected`로 합류한다.
 *
 * 기권(`tally.abstainCount`)은 이 비교에 전혀 관여하지 않는다 — 정족수 분모에는
 * 포함되지만(`quorum.ts`의 `countVotedForQuorum`) 가결 조건에서는 제외된다(D-003).
 */
export function decidePollOutcome(input: PollDecisionInput): PollDecisionResult {
  const { tally, quorum } = input;

  let outcome: PollOutcome;
  if (!quorum.met) {
    outcome = "invalid"; // FR-044 AC3
  } else if (tally.forCount === tally.againstCount) {
    outcome = "rejected"; // D-003 동수 처리
  } else if (tally.forCount > tally.againstCount) {
    outcome = "passed"; // FR-044 AC1
  } else {
    outcome = "rejected"; // 찬성 < 반대
  }

  return { outcome, quorum, tally };
}
