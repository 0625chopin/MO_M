"use server";

import { refresh } from "next/cache";

import { getAuthSession } from "@/components/shell/get-auth-session";
import {
  castVote,
  getCrewMembership,
  getPollById,
  listEligibleVotersWithCurrentStatus,
  listVotes,
} from "@/lib/data";
import { type DataResult, err } from "@/lib/data/contracts";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { checkPermission } from "@/lib/rules/permission";
import { countRemainingVoters, shouldAutoCloseByAllVoted } from "@/lib/rules/poll-eligibility";
import { isPollExpired } from "@/lib/rules/poll-timezone";
import { strings } from "@/lib/strings";
import type { Id, PollVote, VoteChoice } from "@/lib/types";

import { decideAndClosePoll } from "./poll-auto-close";

export interface CastVoteActionInput {
  crewId: Id;
  pollId: Id;
  choice: VoteChoice;
}

/**
 * 투표 참여(FR-041) Server Action. `PollBallot`(클라이언트 경계)이 낙관적 업데이트 후 직접
 * 호출한다 — `updatePostAction`과 같은 직접 호출 패턴(useTransition), `useActionState`가 아니다
 * (성공해도 같은 화면에 남아 집계만 갱신되는 폼이라 `docs/CONVENTIONS.md` "Server Action 폼
 * 상태 관리" 기준의 두 번째 갈래에 해당한다).
 *
 * Server Function은 UI를 거치지 않고 직접 호출될 수 있으므로(Next.js 공식 경고) 권한·마감
 * 여부를 여기서 **다시** 판정한다 — `(app)/crews/[crewId]/layout.tsx`(D-039)의 크루원 게이트는
 * "그 크루의 멤버인가"까지만 보장하고 "이 투표의 대상자인가"는 보장하지 않는다.
 */
export async function castVoteAction(
  input: CastVoteActionInput,
): Promise<DataResult<PollVote>> {
  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return err("forbidden", strings.error.forbidden.description);
  }

  const membership = await getCrewMembership(input.crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(membership);
  const permission = checkPermission({ role, action: "poll:vote" });
  if (!permission.allowed) {
    return err("forbidden", strings.error.forbidden.description);
  }
  // 매트릭스는 "크루원 이상인가"만 본다 — "현재 활성 멤버인가"는 별도로 확인한다. 강퇴·탈퇴
  // 직후에도 role 파생값이 한 박자 stale할 수 있는 방어(update-post.ts와 같은 이유).
  if (membership?.status !== "active") {
    return err("forbidden", strings.error.forbidden.description);
  }

  const poll = await getPollById(input.pollId);
  if (!poll) {
    return err("not_found", `poll ${input.pollId} 를 찾을 수 없다.`);
  }

  const nowIso = new Date().toISOString();
  // D-024 — 마감 시각이 지났으면 pg_cron이 아직 `status`를 못 바꿨어도(FR-043 AC4의 "결과 집계
  // 중" window) 새 투표는 받지 않는다. `poll.status !== "open"` 하나만 보면 이 경합 구간에서
  // 투표가 통과해버린다.
  if (poll.status !== "open" || isPollExpired(poll.closesAt, nowIso)) {
    return err("conflict", strings.vote.errors.votingClosed);
  }

  // 대상자 스냅샷 소속 여부(가입 시점이 투표 생성 이후라 애초에 스냅샷에 없는 경우 포함)는
  // `castVote` 데이터 함수가 이미 판정한다(FR-040 AC1의 스냅샷 고정 규칙) — 여기서 다시
  // 구현하지 않는다(NFR-036, R-015).
  const result = await castVote({
    pollId: input.pollId,
    voterId: session.profileId,
    choice: input.choice,
  });
  if (!result.ok) {
    return result;
  }

  // --- 여기부터 종료 트리거③ (D-003 "미투표자 0명이면 즉시 종료", D-022 정의) ---
  // Mock 시뮬레이션: 실제로는 DB 트리거/Realtime이 투표 반영을 감지해 서버에서 비동기로
  // 판정하지만(Task 033·034), v0.1엔 그 경로가 없어 "투표 제출 직후 동기 체크"로 대신한다.
  // Mock인 것은 **이 체크 타이밍**뿐이고, 판정 자체(`decideAndClosePoll` → `lib/rules`)는
  // 100% 프로덕션 코드다 — Task 034가 실제 트리거를 붙이면 이 블록은 그대로 남기거나 그
  // 트리거 핸들러로 옮기기만 하면 된다.
  const [voters, votes] = await Promise.all([
    listEligibleVotersWithCurrentStatus(input.pollId),
    listVotes(input.pollId),
  ]);
  const votedProfileIds = new Set(votes.map((v) => v.voterId));
  const remaining = countRemainingVoters(voters, votedProfileIds);
  if (shouldAutoCloseByAllVoted(remaining)) {
    // 자동 종료라 종료 주체는 없다(closedBy: null, D-035와 같은 규약 — createPostAction의
    // 자동 판정과 대칭).
    await decideAndClosePoll(input.pollId, null);
  }
  // --- 트리거③ 끝 ---

  refresh();
  return result;
}
