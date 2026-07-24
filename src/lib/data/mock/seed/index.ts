import type {
  Board,
  ChatMessage,
  ChatRoom,
  Crew,
  CrewMembership,
  Id,
  Invitation,
  JoinRequest,
  Meetup,
  MeetupAttendance,
  Notification,
  Poll,
  PollEligibleVoter,
  PollVote,
  Post,
  Profile,
} from "@/lib/types";

import { generateBoardsAndRooms, generatePosts } from "./generate-board";
import { generateChatMessages } from "./generate-chat";
import { generateCrewsAndMemberships, type ExistingCrewContext } from "./generate-crews";
import { generateMeetups } from "./generate-meetups";
import { generateNotifications } from "./generate-notifications";
import { generatePolls } from "./generate-polls";
import { generateProfiles } from "./generate-profiles";
import { createRng } from "./prng";
import { addDays, SEED_NOW, toDateOnly } from "./time";
import { findColorKeyCollisionPair, verifyCrewColorCollisionDemo } from "./verify-crew-color-collision";

/** 결정론적 생성의 유일한 무작위성 출처. 값 자체에 의미는 없다 — 고정이라는 사실만 중요하다. */
const RNG_SEED = 20260724;

export interface BulkSeedResult {
  profiles: Profile[];
  newCrews: Crew[];
  memberships: CrewMembership[];
  joinRequests: JoinRequest[];
  invitations: Invitation[];
  boards: Board[];
  chatRooms: ChatRoom[];
  posts: Post[];
  polls: Poll[];
  pollEligibleVoters: PollEligibleVoter[];
  pollVotes: PollVote[];
  meetups: Meetup[];
  meetupAttendances: MeetupAttendance[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
}

/**
 * Task 010 대량 시드의 단일 진입점. `fixtures.ts`가 기존 최소 픽스처(Task 007,
 * profile-1~3·crew-1~2 등)를 넘기면, 그 위에 크루 15·멤버 300·게시글 200·메시지
 * 2,000·Meetup 60 규모까지 확장해 반환한다(투표 개수 편차는 `generate-polls.ts`
 * 모듈 docstring 참고).
 *
 * 순서가 결과를 결정한다 — `generateId` 호출 순서가 바뀌면 이후 모든 id가
 * 달라지므로, 이 함수 안의 단계 순서를 바꾸지 않는다. `resetFixtures()`가
 * `idCounter`를 초기화한 뒤 이 함수를 다시 호출하면 항상 동일한 결과가 나온다.
 */
export function buildBulkSeed(
  generateId: (prefix: string) => Id,
  existingCrewContexts: ExistingCrewContext[],
  existingBoards: Board[],
  existingChatRooms: ChatRoom[],
  existingPostsByCrewId: Map<Id, Post[]>,
  existingChatMessageCount: number,
): BulkSeedResult {
  const rng = createRng(RNG_SEED);

  // 1) 프로필 300명 중 신규 297명.
  const profiles = generateProfiles(rng, 297, generateId, 1);

  // 2) 크루 15개(신규 13) + 멤버십 + 가입신청 + 초대. R-017 실증을 위해, 15개 크루
  //    전부의 colorKey를 먼저 확정해야 "같은 colorKey를 가진 두 크루"를 고를 수 있다.
  const crewGen = generateCrewsAndMemberships(rng, generateId, existingCrewContexts, profiles);
  const allCrews: Crew[] = [...existingCrewContexts.map((c) => c.crew), ...crewGen.crews];
  const [collisionCrewA, collisionCrewB] = findColorKeyCollisionPair(allCrews);

  // 3) Board·ChatRoom(크루와 1:1) + 게시글 200개 중 신규 197개(모임 제안글 72개 =
  //    기존 2 + 신규 70, 그중 2건은 collisionCrewA·B에 강제 배정한다).
  const newCrewIds = crewGen.crews.map((c) => c.id);
  const { boards, chatRooms } = generateBoardsAndRooms(newCrewIds, generateId);
  const boardByCrewId = new Map<Id, Id>([
    ...existingBoards.map((b) => [b.crewId, b.id] as const),
    ...boards.map((b) => [b.crewId, b.id] as const),
  ]);
  const crewIdByBoardId = new Map<Id, Id>([...boardByCrewId.entries()].map(([crewId, boardId]) => [boardId, crewId]));

  const postsGen = generatePosts(
    rng,
    generateId,
    allCrews,
    boardByCrewId,
    crewGen.rosterByCrewId,
    existingPostsByCrewId,
    127,
    70,
    [collisionCrewA.id, collisionCrewB.id],
  );

  // 4) Poll — collisionCrewA·B의 강제 제안글은 반드시 passed로 확정한다.
  const forcedPassedPostIds = new Set(postsGen.forcedProposalPosts.map((p) => p.id));
  const pollGen = generatePolls(
    rng,
    generateId,
    postsGen.newMeetupProposalPosts,
    crewIdByBoardId,
    crewGen.rosterByCrewId,
    crewGen.staffIdsByCrewId,
    forcedPassedPostIds,
  );

  // 5) Meetup — collisionCrewA·B에서 파생된 두 Meetup의 날짜를 강제로 같은 날로
  //    맞추고, 실제 배정 함수로 D-026 충돌 회피가 동작함을 실행 시점에 증명한다.
  const postsByPostId = new Map<Id, Post>([
    ...[...existingPostsByCrewId.values()].flat().map((p) => [p.id, p] as const),
    ...postsGen.posts.map((p) => [p.id, p] as const),
  ]);
  const forcedCollisionDate = toDateOnly(addDays(SEED_NOW, 21));
  const forcedCollisionPollIds = new Set(
    pollGen.polls
      .filter((poll) => forcedPassedPostIds.has(poll.postId))
      .map((poll) => poll.id),
  );
  const meetupGen = generateMeetups(
    rng,
    generateId,
    pollGen.passedPolls,
    postsByPostId,
    crewIdByBoardId,
    crewGen.rosterByCrewId,
    forcedCollisionPollIds,
    forcedCollisionDate,
  );

  const collisionMeetups = meetupGen.meetups.filter((m) => forcedCollisionPollIds.has(m.pollId));
  if (collisionMeetups.length !== 2 || collisionMeetups[0].date !== collisionMeetups[1].date) {
    throw new Error("R-017/D-026 실증용 Meetup 두 건의 날짜를 강제로 맞추지 못했다.");
  }
  verifyCrewColorCollisionDemo(collisionCrewA, collisionCrewB, [collisionCrewA.id, collisionCrewB.id]);

  // 6) 채팅 메시지 2,000개 중 신규 1,998개.
  const postsByCrewId = new Map<Id, Post[]>([...existingPostsByCrewId, ...postsGen.postsByCrewId]);
  const allChatRooms: ChatRoom[] = [...existingChatRooms, ...chatRooms];
  const chatMessages = generateChatMessages(
    rng,
    generateId,
    allChatRooms,
    crewGen.rosterByCrewId,
    postsByCrewId,
    1998,
    existingChatMessageCount + 1,
  );

  // 7) 알림 — 위에서 만든 이벤트들을 역산해 만든다.
  const notifications = generateNotifications(
    rng,
    generateId,
    crewGen.ownerIdByCrewId,
    crewGen.joinRequests,
    crewGen.invitations,
    pollGen.polls.filter((p) => p.status !== "open"),
    postsByPostId,
    meetupGen.meetups,
    crewGen.staffMemberships,
    crewGen.removedMemberships,
    crewIdByBoardId,
  );

  return {
    profiles,
    newCrews: crewGen.crews,
    memberships: crewGen.memberships,
    joinRequests: crewGen.joinRequests,
    invitations: crewGen.invitations,
    boards,
    chatRooms,
    posts: postsGen.posts,
    polls: pollGen.polls,
    pollEligibleVoters: pollGen.pollEligibleVoters,
    pollVotes: pollGen.pollVotes,
    meetups: meetupGen.meetups,
    meetupAttendances: meetupGen.meetupAttendances,
    chatMessages,
    notifications,
  };
}
