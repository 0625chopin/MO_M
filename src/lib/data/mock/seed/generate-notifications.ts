import type {
  CrewMembership,
  Id,
  Invitation,
  JoinRequest,
  Meetup,
  Notification,
  Poll,
  Post,
} from "@/lib/types";

import { chance, type Rng } from "./prng";
import { addDays, SEED_NOW } from "./time";

/**
 * Notification은 그 자체로 무작위 생성하지 않는다 — 이미 만든 다른 엔티티(가입
 * 신청·초대·투표 종료·Meetup 생성/취소·임원 임명·강퇴)에서 "실제로 그 이벤트가
 * 일어났다면 누구에게 알림이 갔을까"를 역산한다. FR-070 대상 이벤트 10종 중
 * `post_commented`(Comment 의존, v0.2)만 이 시드에서 다루지 않는다 — 그 밖의 9종은
 * 전부 최소 1건 이상 만든다.
 */
export function generateNotifications(
  rng: Rng,
  generateId: (prefix: string) => Id,
  crewOwnerIdByCrewId: Map<Id, Id>,
  joinRequests: readonly JoinRequest[],
  invitations: readonly Invitation[],
  closedPolls: readonly Poll[],
  postsByPostId: Map<Id, Post>,
  meetups: readonly Meetup[],
  staffMemberships: readonly CrewMembership[],
  removedMemberships: readonly CrewMembership[],
  /**
   * poll_closed 알림 클릭 시 "해당 제안글 상세로 이동"(FR-045 AC4)하려면 게시글 상세 경로에
   * crewId·postId가 둘 다 필요하다(`getPostDetailHref`, R-016 — 경로 문자열이 아니라 리소스
   * ID를 저장). Poll은 postId만 갖고 crewId는 postId → boardId → crewId 조인으로 얻는다.
   */
  crewIdByBoardId: Map<Id, Id>,
): Notification[] {
  const notifications: Notification[] = [];

  function push(recipientId: Id, type: Notification["type"], payload: Record<string, unknown>, createdAt: string) {
    notifications.push({
      id: generateId("notification"),
      recipientId,
      type,
      channel: "in_app",
      payload,
      readAt: chance(rng, 0.5) ? addDays(createdAt, 1) : null,
      createdAt,
    });
  }

  for (const jr of joinRequests) {
    const createdAt = addDays(SEED_NOW, -Math.round(rng() * 10));
    if (jr.status === "pending") {
      const ownerId = crewOwnerIdByCrewId.get(jr.crewId);
      if (ownerId) push(ownerId, "join_request_received", { crewId: jr.crewId, joinRequestId: jr.id }, createdAt);
    } else if (jr.status === "approved") {
      push(jr.requesterId, "join_request_approved", { crewId: jr.crewId, joinRequestId: jr.id }, createdAt);
    } else if (jr.status === "rejected") {
      push(jr.requesterId, "join_request_rejected", { crewId: jr.crewId, joinRequestId: jr.id }, createdAt);
    }
  }

  for (const inv of invitations) {
    if (inv.status !== "pending") continue;
    const createdAt = addDays(SEED_NOW, -Math.round(rng() * 10));
    push(inv.inviteeId, "invitation_received", { crewId: inv.crewId, invitationId: inv.id }, createdAt);
  }

  for (const poll of closedPolls) {
    const post = postsByPostId.get(poll.postId);
    if (!post || !poll.decidedAt) continue;
    const crewId = crewIdByBoardId.get(post.boardId);
    if (!crewId) continue;
    push(
      post.authorId,
      "poll_closed",
      { pollId: poll.id, outcome: poll.result, crewId, postId: post.id },
      poll.decidedAt,
    );
  }

  for (const meetup of meetups) {
    const ownerId = crewOwnerIdByCrewId.get(meetup.crewId);
    if (!ownerId) continue;
    const type = meetup.status === "cancelled" ? "meetup_cancelled" : "meetup_created";
    push(ownerId, type, { crewId: meetup.crewId, meetupId: meetup.id }, meetup.createdAt);
  }

  for (const membership of staffMemberships) {
    push(membership.profileId, "staff_appointed", { crewId: membership.crewId }, membership.joinedAt);
  }

  for (const membership of removedMemberships) {
    push(
      membership.profileId,
      "member_removed",
      { crewId: membership.crewId, reason: membership.removedReason },
      addDays(SEED_NOW, -Math.round(rng() * 20)),
    );
  }

  return notifications;
}
