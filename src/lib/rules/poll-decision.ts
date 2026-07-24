import type {
  PollDecisionInput,
  PollDecisionResult,
  PollOutcome,
  PollTally,
} from "@/lib/types/poll.types";

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
  } else if (isPollTie(tally)) {
    outcome = "rejected"; // D-003 동수 처리
  } else if (tally.forCount > tally.againstCount) {
    outcome = "passed"; // FR-044 AC1
  } else {
    outcome = "rejected"; // 찬성 < 반대
  }

  return { outcome, quorum, tally };
}

/**
 * 찬반 동수 여부(D-003 "동수 처리: 부결"). 위 `decidePollOutcome`이 내부적으로 쓰고,
 * `PollResult`(Task 019, `components/poll/PollResult.tsx`)도 부결 사유 문구(동수 vs 반대
 * 우세)를 고르는 데 이 함수를 그대로 호출한다 — 최종 판정(`outcome`)은 이미
 * `decidePollOutcome`이 확정해 넘기므로 `PollResult`가 이 함수로 다시 "부결인지"를 판정하는
 * 것은 아니다(그건 `outcome === "rejected"`로 이미 안다). 다만 "그 부결이 동수였는지"는
 * `outcome`이 담지 않는 정보라 표시 문구를 고르려면 같은 비교가 한 번 더 필요한데, 그 비교식
 * 자체를 이 파일 밖에 다시 적으면(예: `tally.forCount === tally.againstCount`를 컴포넌트에
 * 인라인) 이 식이 바뀔 때 두 곳이 조용히 갈리는 R-015 위험이 생긴다 — 그래서 비교식 자체를
 * 이 함수 하나로 뽑아 저장소 전체에서 단 한 곳만 갖게 했다(8일차 CREW 교차검증 지적, minor).
 */
export function isPollTie(tally: PollTally): boolean {
  return tally.forCount === tally.againstCount;
}
