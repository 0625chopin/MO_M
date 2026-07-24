import {
  closePoll,
  getPollTally,
  listEligibleVotersWithCurrentStatus,
} from "@/lib/data";
import type { DataResult } from "@/lib/data/contracts";
import { decidePollOutcome } from "@/lib/rules/poll-decision";
import { countQuorumEligibleVoters } from "@/lib/rules/poll-eligibility";
import { computeQuorum, countVotedForQuorum } from "@/lib/rules/quorum";
import type { Id, Poll } from "@/lib/types";

/**
 * 투표 종료 판정 파이프라인 — **프로덕션 코드** (FR-043 종료 처리 + FR-044 판정, D-003).
 *
 * 일반 TS 모듈이다("use server" 지시자 없음) — Server Action이 아니라 `cast-vote.ts`(트리거③)·
 * `close-poll.ts`(트리거②, 트리거①의 Mock 시뮬레이션)가 공유하는 내부 헬퍼다. `lib/actions/`에
 * 있는 이유는 `lib/data`(쓰기)를 호출해야 해서다 — `lib/rules`(zone 1)는 데이터 레이어를 import할
 * 수 없다.
 *
 * **이 함수 자체는 종료 "트리거"가 무엇이었는지 모른다** — 어떤 트리거(기한 도래·조기 종료·
 * 미투표자 0명)로 호출됐든 여기서부터는 완전히 같은 판정을 탄다. 3개 트리거의 "발화 방식"만
 * Mock이고(v0.1엔 pg_cron이 없어 사람이 버튼을 누르거나 다음 투표 직후 동기 체크로 대신한다),
 * 판정 로직 자체(`computeQuorum`·`decidePollOutcome`)는 Task 009A의 순수 함수 그대로다(NFR-036,
 * R-015) — Task 034가 pg_cron 잡을 붙일 때 이 함수를 그대로 재사용하면 되고, 걷어낼 대상은
 * 호출부(트리거 발화 방식)이지 이 함수가 아니다.
 *
 * **Meetup 생성(FR-060)·알림 적재(FR-045)는 여기서 하지 않는다** — Task 019(투표 UI)의 참조
 * 범위는 FR-040~045까지이고, FR-060은 Task 034("투표 자동 종료·판정·Meetup 생성·알림
 * 파이프라인")가 명시적으로 소유한다. 그래서 `closed_passed`가 되어도 Meetup 레코드가 즉시
 * 따라오지 않는다 — `PollResult`가 그 간극을 "Meetup이 아직 없으면 링크를 보여주지 않는다"로
 * 방어적으로 다룬다(`getMeetupByPollId`가 null을 정상 상태로 반환).
 */
export async function decideAndClosePoll(
  pollId: Id,
  closedBy: Id | null,
): Promise<DataResult<Poll>> {
  const [tally, voters] = await Promise.all([
    getPollTally(pollId),
    // 스냅샷×현재 멤버십 조인이 깨지면(정합성 오류) 이 함수가 예외를 던진다 — 의도된 동작이다
    // (poll.ts의 docstring 참고, D-030 ③ "스냅샷 이탈"). 여기서 잡지 않고 호출부까지 그대로
    // 전파한다.
    listEligibleVotersWithCurrentStatus(pollId),
  ]);

  const quorum = computeQuorum({
    eligibleVoterCount: countQuorumEligibleVoters(voters),
    votedCount: countVotedForQuorum(tally),
  });
  const decision = decidePollOutcome({ tally, quorum });

  return closePoll({ pollId, closedBy, outcome: decision.outcome });
}
