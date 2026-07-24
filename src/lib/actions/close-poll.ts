"use server";

import { refresh } from "next/cache";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { getCrewMembership, getPollById, getPostById } from "@/lib/data";
import { type DataResult, err } from "@/lib/data/contracts";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { checkPermission } from "@/lib/rules/permission";
import { isPollExpired } from "@/lib/rules/poll-timezone";
import { strings } from "@/lib/strings";
import type { Id, Poll } from "@/lib/types";

import { decideAndClosePoll } from "./poll-auto-close";

export interface ClosePollEarlyActionInput {
  crewId: Id;
  pollId: Id;
}

/**
 * 투표 조기 종료(FR-043 AC3) Server Action — D-003 종료 트리거②. 제안자·임원·오너만 가능
 * (`poll:close_early`, 각주⁵ "제안 작성자 본인만"은 일반 크루원에 한해 조건부로 적용된다 —
 * `lib/rules/permission.ts` 참고). `PollEarlyCloseControl`(Dialog 확인 후 호출)의 유일한
 * 호출부다.
 */
export async function closePollEarlyAction(
  input: ClosePollEarlyActionInput,
): Promise<DataResult<Poll>> {
  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return err("forbidden", strings.error.forbidden.description);
  }

  const poll = await getPollById(input.pollId);
  if (!poll) {
    return err("not_found", `poll ${input.pollId} 를 찾을 수 없다.`);
  }

  const post = await getPostById(poll.postId);
  const membership = await getCrewMembership(input.crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(membership);
  const permission = checkPermission({
    role,
    action: "poll:close_early",
    context: { isProposalAuthor: post?.authorId === session.profileId },
  });
  if (!permission.allowed) {
    return err("forbidden", strings.vote.earlyClose.forbidden);
  }

  if (poll.status !== "open") {
    // 도메인 오류 "이미 종료됨" — `/sample`이 이 지점을 등록한다(D-030 ③).
    return err("conflict", strings.vote.earlyClose.alreadyClosed);
  }

  const result = await decideAndClosePoll(input.pollId, session.profileId);
  if (result.ok) {
    refresh();
  }
  return result;
}

export interface SimulateScheduledPollClosureInput {
  pollId: Id;
}

/**
 * **Mock 전용** — D-003 종료 트리거①(기한 도래 자동 종료)의 발화 시뮬레이터.
 *
 * 실제로는 Supabase Cron(pg_cron, D-027)이 스케줄로 `decideAndClosePoll`(또는 그 자리를
 * 대신하는 Task 034의 서버 함수)을 호출한다 — v0.1엔 스케줄러 자체가 없으므로(pg_cron은
 * 설치돼 있지만 미가동, `prioritization-and-risks.md` D-027 참고) "마감 시각이 지났는지"를
 * 사람이 대신 트리거하는 자리를 여기 남겨 둔다. 실제 사용자 화면(`PollPanel`) 어디에서도
 * 이 함수를 호출하지 않는다 — 사용자는 트리거①을 버튼으로 발화시킬 수 없고(트리거②만
 * 사람이 누르는 버튼이다), `isPollAwaitingClosure`(D-024)가 그 사이 창을 "결과 집계 중"으로
 * 표시만 할 뿐이다. 이 함수는 QA·개발 도구용 진입점으로만 존재한다.
 *
 * **걷어낼 대상은 이 함수의 "호출 방식"(사람이 부르는 액션)이지 판정 로직이 아니다** —
 * Task 034가 pg_cron 잡을 붙이면 `decideAndClosePoll` 호출부만 cron 핸들러로 옮기면 되고,
 * 이 파일의 이 함수(그리고 이 함수만 쓰는 QA 도구)를 걷어내면 된다.
 */
export async function simulateScheduledPollClosureAction(
  input: SimulateScheduledPollClosureInput,
): Promise<DataResult<Poll>> {
  const poll = await getPollById(input.pollId);
  if (!poll) {
    return err("not_found", `poll ${input.pollId} 를 찾을 수 없다.`);
  }
  if (poll.status !== "open") {
    return err("conflict", strings.vote.earlyClose.alreadyClosed);
  }
  const nowIso = new Date().toISOString();
  if (!isPollExpired(poll.closesAt, nowIso)) {
    return err("validation_failed", "아직 마감 시각이 지나지 않았다 — 트리거①은 마감 후에만 발화한다.");
  }

  const result = await decideAndClosePoll(input.pollId, null);
  if (result.ok) {
    refresh();
  }
  return result;
}
