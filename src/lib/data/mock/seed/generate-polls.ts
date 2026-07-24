import { decidePollOutcome } from "@/lib/rules/poll-decision";
import { countQuorumEligibleVoters } from "@/lib/rules/poll-eligibility";
import { validatePollDuration } from "@/lib/rules/poll-timezone";
import { computeVoteTally, invalidateVotesForRemovedMember } from "@/lib/rules/poll-vote-tally";
import { computeQuorum, countVotedForQuorum } from "@/lib/rules/quorum";
import type {
  Id,
  Poll,
  PollEligibleVoter,
  PollOutcome,
  PollVote,
  Post,
  SnapshotVoterStatus,
  VoteChoice,
} from "@/lib/types";

import { pick, pickN, randomInt, shuffle, type Rng } from "./prng";
import { addDays, addHours, SEED_NOW } from "./time";

/**
 * Poll·PollEligibleVoter·PollVote 시드 — **`lib/rules`의 실제 판정 함수로 결과를
 * 계산한다** (직접 승/패를 정해 놓고 그 값을 박아 넣지 않는다). `computeVoteTally` →
 * `countQuorumEligibleVoters`/`countVotedForQuorum` → `computeQuorum` →
 * `decidePollOutcome`로 이어지는 실제 파이프라인을 그대로 호출하므로, 저장된
 * `Poll.status`/`result`가 규칙과 어긋날 수가 없다(호출부 버그가 아니라면).
 *
 * ## 왜 "투표 40"이 아니라 이 개수인가
 *
 * Meetup은 FR-060(가결 Poll 1개 → Meetup 1개, `meetup.ts`의 `pollId` 참고,
 * Task 007의 `meetup-1`↔`poll-2` 관계가 이미 이 1:1 전제를 확립했다)에 따라 반드시
 * 가결된 Poll에서 파생된다. Meetup 60개를 만들려면 최소 60개의 `closed_passed` Poll이
 * 있어야 하는데, ROADMAP §6.2가 준 목표 "투표 40 · Meetup 60"은 이 관계를 만족할 수
 * 없다(40개 중 전부가 가결이어도 40 < 60). "생성된 데이터는 규칙과 정합해야 한다"는
 * 이번 Task 지시를 "개수를 문자 그대로 맞춘다"보다 우선해, Poll을 Meetup 60개를
 * 소싱하는 데 필요한 만큼(가결 59건 신규 + 기존 1건 = 60건) + 상태 다양성용 여분으로
 * 늘렸다. 실측 개수는 완료 보고에 남긴다.
 */

export interface PollGenerationResult {
  polls: Poll[];
  pollEligibleVoters: PollEligibleVoter[];
  pollVotes: PollVote[];
  /** 가결(passed)로 확정된 Poll만 — Meetup 생성기가 이 목록으로 Meetup을 만든다. */
  passedPolls: Poll[];
}

const STATUS_BY_OUTCOME: Record<PollOutcome, Poll["status"]> = {
  passed: "closed_passed",
  rejected: "closed_rejected",
  invalid: "closed_invalid",
};

type TargetOutcome = "open" | PollOutcome;

export function generatePolls(
  rng: Rng,
  generateId: (prefix: string) => Id,
  newMeetupProposalPosts: readonly Post[],
  crewIdByBoardId: Map<Id, Id>,
  rosterByCrewId: Map<Id, Id[]>,
  staffIdsByCrewId: Map<Id, Id[]>,
  /** R-017/D-026 실증용으로 미리 골라 둔 두 크루의 제안글 — 반드시 passed로 확정한다. */
  forcedPassedPostIds: ReadonlySet<Id> = new Set(),
): PollGenerationResult {
  const polls: Poll[] = [];
  const pollEligibleVoters: PollEligibleVoter[] = [];
  const pollVotes: PollVote[] = [];
  const passedPolls: Poll[] = [];

  // 최근 작성된 6건은 진행 중(open)으로 남긴다 — 진행 중 투표는 opensAt이 SEED_NOW에
  // 가까워야 자연스럽다. 나머지는 이미 종료된 투표로 다룬다. 강제 passed 대상은
  // open 후보 풀에서 제외한다.
  const sortedByRecency = [...newMeetupProposalPosts]
    .filter((p) => !forcedPassedPostIds.has(p.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openPosts = new Set(sortedByRecency.slice(0, 6).map((p) => p.id));

  const closedTargets = shuffle<PollOutcome>(rng, [
    ...Array<PollOutcome>(Math.max(0, 59 - forcedPassedPostIds.size)).fill("passed"),
    ...Array<PollOutcome>(3).fill("rejected"),
    ...Array<PollOutcome>(2).fill("invalid"),
  ]);
  let closedIndex = 0;
  let invalidatedDemoCount = 0;

  for (const post of newMeetupProposalPosts) {
    const crewId = crewIdByBoardId.get(post.boardId)!;
    const roster = rosterByCrewId.get(crewId) ?? [];
    const staffIds = staffIdsByCrewId.get(crewId) ?? [];
    const target: TargetOutcome = forcedPassedPostIds.has(post.id)
      ? "passed"
      : openPosts.has(post.id)
        ? "open"
        : closedTargets[closedIndex++];

    let opensAt = addHours(post.createdAt, randomInt(rng, 0, 2));
    let closesAt: string;

    if (target === "open") {
      // 진행 중 투표는 opensAt을 SEED_NOW 근처(1~3일 전)로 당겨, 마감(1~10일 뒤)이
      // 자연스럽게 SEED_NOW 이후에 오게 만든다(validatePollDuration 범위 1시간~14일 안).
      opensAt = addDays(SEED_NOW, -randomInt(rng, 1, 3));
      closesAt = addHours(opensAt, randomInt(rng, 24, 240));
    } else {
      const maxHoursUntilNow = Math.max(
        1,
        Math.floor((new Date(SEED_NOW).getTime() - new Date(opensAt).getTime()) / (60 * 60 * 1000)) - 1,
      );
      const durationHours = Math.min(randomInt(rng, 24, 336), maxHoursUntilNow);
      closesAt = addHours(opensAt, Math.max(1, durationHours));
    }

    const validity = validatePollDuration(opensAt, closesAt);
    if (!validity.valid) {
      // 위 클램프로 항상 valid해야 정상이다 — 어겼다면 생성 로직 자체의 버그이므로
      // 조용히 넘기지 않고 바로 드러낸다.
      throw new Error(`poll duration invalid for post ${post.id}: ${validity.reason}`);
    }

    const eligibleVoterIds = roster;
    const eligibleSnapshot: SnapshotVoterStatus[] = eligibleVoterIds.map((profileId) => ({
      profileId,
      currentMembershipStatus: "active" as const,
    }));

    const votes: PollVote[] = [];
    if (target === "open") {
      // 진행 중인 투표도 일부는 이미 표가 들어와 있는 편이 자연스럽다 — 정족수·판정과
      // 무관하므로(상태가 'open'으로 고정) 분포를 엄격히 맞추지 않는다.
      const partialVotedCount = randomInt(rng, 0, Math.floor(eligibleVoterIds.length * 0.6));
      const partialVoters = pickN(rng, eligibleVoterIds, partialVotedCount);
      for (const voterId of partialVoters) {
        votes.push({
          pollId: "",
          voterId,
          choice: pick<VoteChoice>(rng, ["for", "against", "abstain"]),
          votedAt: addHours(opensAt, randomInt(rng, 1, Math.max(1, hoursBetween(opensAt, SEED_NOW)))),
          invalidated: false,
        });
      }
    } else {
      const requiredForFullQuorum = Math.ceil(eligibleVoterIds.length / 3);
      let votedCount: number;
      if (target === "invalid") {
        votedCount = randomInt(rng, 0, Math.max(0, requiredForFullQuorum - 1));
      } else {
        votedCount = randomInt(rng, requiredForFullQuorum, eligibleVoterIds.length);
      }
      const voters = pickN(rng, eligibleVoterIds, votedCount);

      let forCount: number;
      let againstCount: number;
      const abstainCount = Math.min(voters.length, randomInt(rng, 0, Math.floor(voters.length * 0.15)));
      const decisive = voters.length - abstainCount;
      if (target === "passed") {
        forCount = Math.max(1, Math.ceil(decisive * (0.55 + rng() * 0.35)));
        forCount = Math.min(forCount, decisive);
        againstCount = decisive - forCount;
        if (decisive > 0 && forCount <= againstCount) forCount = againstCount + 1;
      } else {
        // rejected(동수 포함) 또는 invalid — 찬성이 반대를 넘지 않게 한다.
        const half = Math.floor(decisive / 2);
        forCount = half;
        againstCount = decisive - half;
      }
      forCount = Math.max(0, Math.min(forCount, decisive));
      againstCount = decisive - forCount;

      const choiceSequence: VoteChoice[] = [
        ...Array<VoteChoice>(forCount).fill("for"),
        ...Array<VoteChoice>(againstCount).fill("against"),
        ...Array<VoteChoice>(abstainCount).fill("abstain"),
      ];
      voters.forEach((voterId, i) => {
        votes.push({
          pollId: "", // poll.id 확정 후 아래에서 채운다.
          voterId,
          choice: choiceSequence[i],
          votedAt: addHours(opensAt, randomInt(rng, 1, Math.max(1, hoursBetween(opensAt, closesAt) - 1))),
          invalidated: false,
        });
      });
    }

    // D-003 실증 — 투표 후 강퇴된 크루원의 표는 무효화되고 정족수 분모에서도 빠진다.
    // 표본이 충분한 'passed' 투표 2건에서만, 실제로 투표를 한 대상자 1명을 강퇴 처리한다.
    if (
      target === "passed" &&
      !forcedPassedPostIds.has(post.id) &&
      invalidatedDemoCount < 2 &&
      votes.length > 0 &&
      eligibleVoterIds.length >= 8
    ) {
      const removedVoter = votes[0].voterId;
      const snapshotEntry = eligibleSnapshot.find((v) => v.profileId === removedVoter)!;
      snapshotEntry.currentMembershipStatus = "removed";
      const invalidated = invalidateVotesForRemovedMember(votes, removedVoter);
      votes.length = 0;
      votes.push(...invalidated);
      invalidatedDemoCount += 1;
    }

    const pollId = generateId("poll");
    votes.forEach((v) => (v.pollId = pollId));

    let status: Poll["status"] = "open";
    let result: PollOutcome | null = null;
    let decidedAt: string | null = null;
    let closedBy: Id | null = null;

    if (target !== "open") {
      const tally = computeVoteTally(votes);
      const quorum = computeQuorum({
        eligibleVoterCount: countQuorumEligibleVoters(eligibleSnapshot),
        votedCount: countVotedForQuorum(tally),
      });
      const decision = decidePollOutcome({ tally, quorum });
      status = STATUS_BY_OUTCOME[decision.outcome];
      result = decision.outcome;
      decidedAt = closesAt;
      if (rng() < 0.6) {
        closedBy = rng() < 0.7 ? post.authorId : staffIds[0] ?? post.authorId;
      }
    }

    const poll: Poll = {
      id: pollId,
      postId: post.id,
      opensAt,
      closesAt,
      status,
      closedBy,
      result,
      decidedAt,
    };
    polls.push(poll);
    if (status === "closed_passed") passedPolls.push(poll);

    pollEligibleVoters.push(
      ...eligibleVoterIds.map((profileId) => ({
        pollId,
        profileId,
        notifiedAt: target === "open" ? null : closesAt,
        notifyAttempts: target === "open" ? 0 : 1,
      })),
    );
    pollVotes.push(...votes);
  }

  return { polls, pollEligibleVoters, pollVotes, passedPolls };
}

function hoursBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / (60 * 60 * 1000)));
}
