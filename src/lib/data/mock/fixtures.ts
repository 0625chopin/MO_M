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

import { buildBulkSeed } from "./seed";

import type { ExistingCrewContext } from "./seed/generate-crews";

/**
 * Mock 시드 데이터.
 *
 * 아래 손으로 쓴 최소 픽스처(profile-1~3·crew-1~2 등, Task 007)는 "계약이 동작함을
 * 보이는" 최소 관계 집합을 그대로 유지한다 — `src/components/shell/get-auth-session.ts`
 * 등 이미 `profile-1`을 하드코딩해 참조하는 코드가 있어(값을 바꾸면 그쪽이 깨진다)
 * 손대지 않는다. 그 위에 `./seed/buildBulkSeed`(Task 010)가 크루 15·멤버 300·
 * 게시글 200·메시지 2,000·Meetup 60 규모까지 결정론적으로 확장한 데이터를 이어붙인다
 * — 실제 생성 로직·개수 근거는 `./seed/index.ts`와 그 하위 모듈 docstring 참고.
 *
 * 데이터는 모듈 스코프의 가변 배열에 보관한다 — 서버 프로세스 생애주기 동안만 유지되고
 * Next.js 개발 서버 재시작/모듈 리로드 시 초기화된다. 실제 영속성은 Supabase 연결
 * (Task 026~028) 이후 생긴다. 이 휘발성은 Mock 단계의 정상 동작이다.
 */

const INITIAL_ID_COUNTER = 100;
let idCounter = INITIAL_ID_COUNTER;
/** 쓰기 함수가 새 엔티티에 부여하는 id. 실데이터에서는 DB가 발급한다(예: uuid). */
export function generateId(prefix: string): Id {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function createSeed() {
  const profiles: Profile[] = [
    {
      id: "profile-1",
      handle: "seo_runs",
      displayName: "서지훈",
      avatarUrl: null,
      bio: "주말마다 한강 러닝합니다.",
      status: "active",
      searchOptOut: false,
      anonymizedAt: null,
      handleChangedAt: null,
    },
    {
      id: "profile-2",
      handle: "yuna_book",
      displayName: "김유나",
      avatarUrl: null,
      bio: null,
      status: "active",
      searchOptOut: false,
      anonymizedAt: null,
      handleChangedAt: null,
    },
    {
      id: "profile-3",
      handle: "minjun",
      displayName: "박민준",
      avatarUrl: null,
      bio: null,
      status: "active",
      searchOptOut: false,
      anonymizedAt: null,
      handleChangedAt: null,
    },
  ];

  const crews: Crew[] = [
    {
      id: "crew-1",
      name: "주말 러닝 크루",
      description: "매주 토요일 아침 한강에서 함께 뜁니다.",
      category: "운동",
      visibility: "public",
      colorKey: 0,
      ownerId: "profile-1",
      status: "active",
    },
    {
      id: "crew-2",
      name: "심야 북클럽",
      description: "격주로 모여 책 얘기를 나눕니다.",
      category: "취미",
      visibility: "private",
      colorKey: 1,
      ownerId: "profile-2",
      status: "active",
    },
  ];

  const crewMemberships: CrewMembership[] = [
    {
      crewId: "crew-1",
      profileId: "profile-1",
      role: "owner",
      status: "active",
      joinedAt: "2026-06-01T00:00:00.000Z",
      removedReason: null,
    },
    {
      crewId: "crew-1",
      profileId: "profile-2",
      role: "member",
      status: "active",
      joinedAt: "2026-06-15T00:00:00.000Z",
      removedReason: null,
    },
    {
      crewId: "crew-2",
      profileId: "profile-2",
      role: "owner",
      status: "active",
      joinedAt: "2026-05-01T00:00:00.000Z",
      removedReason: null,
    },
  ];

  const boards: Board[] = [
    { id: "board-1", crewId: "crew-1" },
    { id: "board-2", crewId: "crew-2" },
  ];

  const chatRooms: ChatRoom[] = [
    { id: "room-1", crewId: "crew-1" },
    { id: "room-2", crewId: "crew-2" },
  ];

  const posts: Post[] = [
    {
      id: "post-1",
      boardId: "board-1",
      authorId: "profile-1",
      type: "general",
      title: "이번 주 코스 공지",
      body: "이번 주는 반포 코스로 변경합니다.",
      meetupDate: null,
      createdAt: "2026-07-20T09:00:00.000Z",
      editedAt: null,
      deletedAt: null,
    },
    {
      id: "post-2",
      boardId: "board-1",
      authorId: "profile-2",
      type: "meetup_proposal",
      title: "8/1(토) 아침 러닝 어때요?",
      body: "다음 주 토요일 아침 7시 한강공원에서 뛰어요.",
      meetupDate: "2026-08-01",
      createdAt: "2026-07-22T10:00:00.000Z",
      editedAt: null,
      deletedAt: null,
    },
    {
      id: "post-3",
      boardId: "board-1",
      authorId: "profile-1",
      type: "meetup_proposal",
      title: "지난주 러닝 후기",
      body: "지난주 모임 정산글입니다.",
      meetupDate: "2026-07-18",
      createdAt: "2026-07-10T09:00:00.000Z",
      editedAt: null,
      deletedAt: null,
    },
  ];

  const polls: Poll[] = [
    {
      id: "poll-1",
      postId: "post-2",
      opensAt: "2026-07-22T10:00:00.000Z",
      closesAt: "2026-07-31T23:59:59.000Z",
      status: "open",
      closedBy: null,
      result: null,
      decidedAt: null,
    },
    {
      id: "poll-2",
      postId: "post-3",
      opensAt: "2026-07-10T09:00:00.000Z",
      closesAt: "2026-07-12T23:59:59.000Z",
      status: "closed_passed",
      closedBy: "profile-1",
      result: "passed",
      decidedAt: "2026-07-12T23:59:59.000Z",
    },
  ];

  const pollEligibleVoters: PollEligibleVoter[] = [
    { pollId: "poll-1", profileId: "profile-1", notifiedAt: null, notifyAttempts: 0 },
    { pollId: "poll-1", profileId: "profile-2", notifiedAt: null, notifyAttempts: 0 },
    {
      pollId: "poll-2",
      profileId: "profile-1",
      notifiedAt: "2026-07-12T23:59:59.000Z",
      notifyAttempts: 1,
    },
    {
      pollId: "poll-2",
      profileId: "profile-2",
      notifiedAt: "2026-07-12T23:59:59.000Z",
      notifyAttempts: 1,
    },
  ];

  const pollVotes: PollVote[] = [
    {
      pollId: "poll-2",
      voterId: "profile-1",
      choice: "for",
      votedAt: "2026-07-11T08:00:00.000Z",
      invalidated: false,
    },
    {
      pollId: "poll-2",
      voterId: "profile-2",
      choice: "for",
      votedAt: "2026-07-11T09:00:00.000Z",
      invalidated: false,
    },
  ];

  const meetups: Meetup[] = [
    {
      id: "meetup-1",
      crewId: "crew-1",
      pollId: "poll-2",
      title: "지난주 러닝",
      description: null,
      date: "2026-07-18",
      startTime: "07:00",
      place: "한강공원 반포지구",
      capacity: 10,
      attendingCount: 1,
      status: "confirmed",
      createdAt: "2026-07-12T23:59:59.000Z",
    },
  ];

  const meetupAttendances: MeetupAttendance[] = [
    {
      meetupId: "meetup-1",
      profileId: "profile-1",
      status: "attending",
      respondedAt: "2026-07-13T08:00:00.000Z",
    },
  ];

  const joinRequests: JoinRequest[] = [
    {
      id: "join-request-1",
      crewId: "crew-1",
      requesterId: "profile-3",
      message: "같이 뛰고 싶어요!",
      status: "pending",
      decidedBy: null,
    },
  ];

  const invitations: Invitation[] = [
    {
      id: "invitation-1",
      crewId: "crew-2",
      inviteeId: "profile-3",
      inviterId: "profile-2",
      status: "pending",
      expiresAt: "2026-08-07T00:00:00.000Z",
    },
  ];

  const notifications: Notification[] = [
    {
      id: "notification-1",
      recipientId: "profile-1",
      type: "join_request_received",
      channel: "in_app",
      payload: { crewId: "crew-1", joinRequestId: "join-request-1" },
      readAt: null,
      createdAt: "2026-07-23T12:00:00.000Z",
    },
    {
      id: "notification-2",
      recipientId: "profile-3",
      type: "invitation_received",
      channel: "in_app",
      payload: { crewId: "crew-2", invitationId: "invitation-1" },
      readAt: null,
      createdAt: "2026-07-23T12:05:00.000Z",
    },
    {
      id: "notification-3",
      recipientId: "profile-2",
      type: "poll_closed",
      channel: "in_app",
      payload: { pollId: "poll-2", outcome: "passed" },
      readAt: "2026-07-13T08:10:00.000Z",
      createdAt: "2026-07-12T23:59:59.000Z",
    },
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: "message-1",
      roomId: "room-1",
      senderId: "profile-1",
      type: "text",
      body: "다들 코스 확인해주세요~",
      refPostId: null,
      clientKey: "seed-message-1",
      createdAt: "2026-07-20T09:05:00.000Z",
      deletedAt: null,
    },
    {
      id: "message-2",
      roomId: "room-1",
      senderId: "profile-2",
      type: "post_link",
      body: null,
      refPostId: "post-2",
      clientKey: "seed-message-2",
      createdAt: "2026-07-22T10:01:00.000Z",
      deletedAt: null,
    },
  ];

  // ---- Task 010: 위 최소 픽스처 위에 실사용 규모(크루 15·멤버 300·게시글 200·
  //      메시지 2,000·Meetup 60)까지 결정론적으로 확장한다. crew-1·crew-2 객체를
  //      그대로 넘겨 colorKey를 실제 hash(crewId) mod 12로 바로잡는다(Task 007
  //      최소 픽스처가 0·1로 손으로 넣어 뒀던 값과 달랐다 — 아래 함수가 고친다).
  const existingCrewContexts: ExistingCrewContext[] = [
    { crew: crews[0], activeMemberIds: ["profile-1", "profile-2"] },
    { crew: crews[1], activeMemberIds: ["profile-2"] },
  ];
  const existingPostsByCrewId = new Map<Id, Post[]>([
    ["crew-1", posts],
    ["crew-2", []],
  ]);
  const bulk = buildBulkSeed(
    generateId,
    existingCrewContexts,
    boards,
    chatRooms,
    existingPostsByCrewId,
    chatMessages.length,
  );

  return {
    profiles: [...profiles, ...bulk.profiles],
    crews: [...crews, ...bulk.newCrews],
    crewMemberships: [...crewMemberships, ...bulk.memberships],
    boards: [...boards, ...bulk.boards],
    chatRooms: [...chatRooms, ...bulk.chatRooms],
    posts: [...posts, ...bulk.posts],
    polls: [...polls, ...bulk.polls],
    pollEligibleVoters: [...pollEligibleVoters, ...bulk.pollEligibleVoters],
    pollVotes: [...pollVotes, ...bulk.pollVotes],
    meetups: [...meetups, ...bulk.meetups],
    meetupAttendances: [...meetupAttendances, ...bulk.meetupAttendances],
    joinRequests: [...joinRequests, ...bulk.joinRequests],
    invitations: [...invitations, ...bulk.invitations],
    notifications: [...notifications, ...bulk.notifications],
    chatMessages: [...chatMessages, ...bulk.chatMessages],
  };
}

export const store = createSeed();

/** 배열 참조는 유지한 채 내용만 갈아끼운다 — `store`를 import한 다른 모듈의 참조가 깨지지 않는다. */
function replaceArrayContents<T>(target: T[], source: readonly T[]): void {
  target.length = 0;
  target.push(...source);
}

/**
 * 초기 시드로 되돌린다. 아직 테스트 러너는 없지만(R-002) 도입 시 each-test 격리에 쓴다.
 *
 * 엔티티별로 명시 호출한다 — `Object.keys` 루프로 일반화하면 각 키의 배열 원소 타입이
 * 유니온으로 뭉개져 `store[key]`/`seed[key]`의 대응이 타입 수준에서 깨진다(연결이 없는
 * 유니온이라 `any` 없이는 타입체크를 통과할 수 없다). 엔티티가 늘면 아래 목록에 한 줄
 * 추가한다.
 *
 * `idCounter`를 먼저 초기값으로 되돌린 뒤 `createSeed()`를 다시 호출한다 — Task 010부터
 * `createSeed()`가 대량 시드 생성에 `generateId`를 수천 번 호출하므로(`./seed/index.ts`),
 * 이 초기화가 없으면 두 번째 호출부터 모든 id가 처음과 달라져 "결정적 생성"이 reset
 * 경계에서 깨진다.
 */
export function resetFixtures(): void {
  idCounter = INITIAL_ID_COUNTER;
  const seed = createSeed();
  replaceArrayContents(store.profiles, seed.profiles);
  replaceArrayContents(store.crews, seed.crews);
  replaceArrayContents(store.crewMemberships, seed.crewMemberships);
  replaceArrayContents(store.boards, seed.boards);
  replaceArrayContents(store.chatRooms, seed.chatRooms);
  replaceArrayContents(store.posts, seed.posts);
  replaceArrayContents(store.polls, seed.polls);
  replaceArrayContents(store.pollEligibleVoters, seed.pollEligibleVoters);
  replaceArrayContents(store.pollVotes, seed.pollVotes);
  replaceArrayContents(store.meetups, seed.meetups);
  replaceArrayContents(store.meetupAttendances, seed.meetupAttendances);
  replaceArrayContents(store.joinRequests, seed.joinRequests);
  replaceArrayContents(store.invitations, seed.invitations);
  replaceArrayContents(store.notifications, seed.notifications);
  replaceArrayContents(store.chatMessages, seed.chatMessages);
}
