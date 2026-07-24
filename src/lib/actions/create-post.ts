"use server";

import { refresh } from "next/cache";

import { getAuthSession } from "@/components/shell/get-auth-session";
import {
  createPoll,
  createPost,
  getBoardByCrewId,
  getCrewMembership,
  listCrewMembers,
} from "@/lib/data";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { validateMeetupProposalSchedule } from "@/lib/rules/meetup-proposal-schedule";
import { checkPermission } from "@/lib/rules/permission";
import { validatePostContent } from "@/lib/rules/post-content-validation";
import { strings } from "@/lib/strings";
import type { Id, PostType } from "@/lib/types";

/**
 * 게시글 작성(FR-030) + 모임 제안글이면 찬반 투표 동시 생성(FR-034 정상 흐름 ④) Server
 * Action(Task 018B). `PostWriteForm`이 `startTransition`으로 직접 호출한다 —
 * `useActionState`/`FormData` 대신 `PostActions.tsx`(018A)의 인라인 편집 폼과 같은
 * 직접 호출 패턴을 쓴다. 이 폼은 임시 저장 자동 저장·유형 토글에 따른 필드 표시 전환·
 * 날짜 중복 경고(비차단) 때문에 처음부터 클라이언트 상태를 갖고 있어야 해서, 진행
 * 향상(progressive enhancement)의 이점이 실질적으로 없다 — `CrewCreateForm`(단순
 * 입력만 받는 폼)과는 그 지점에서 갈린다.
 *
 * **인증·권한 검사가 여기 있다** — `(app)/crews/[crewId]/layout.tsx`(D-039)가 크루원
 * 여부는 이미 걸렀지만, Server Action은 그 라우트를 거치지 않고 직접 호출될 수 있다
 * (Next.js 공식 경고, `updatePostAction`·`deletePostAction`과 동일한 방어). `post:create`
 * (일반글)와 `poll:create_proposal`(모임 제안글) 둘 다 매트릭스상 crew_member 이상만
 * 허용이라 사실상 동시에 통과/거부되지만, 유형별로 별도 행이 존재하는 이상 둘 다
 * 명시적으로 판정한다 — 하나를 생략하면 나중에 두 매트릭스 행이 갈릴 때(예: 모임 제안만
 * 임원 이상으로 제한) 조용히 놓친다.
 *
 * **날짜 중복 경고(FR-034 E4)는 여기서 재확인하지 않는다** — "경고 후 진행 허용"이라
 * 차단 조건이 아니다. 클라이언트가 `checkDuplicateMeetupDateAction`으로 비차단 안내만
 * 보여준다.
 */
export interface CreatePostActionInput {
  crewId: Id;
  type: PostType;
  title: string;
  body: string;
  /** type='meetup_proposal'일 때만 쓴다. */
  meetupDate?: string;
  voteDeadline?: string;
  startTime?: string;
  place?: string;
  capacity?: number | null;
}

export interface CreatePostFieldErrors {
  title?: string;
  body?: string;
  scheduledDate?: string;
  voteDeadline?: string;
}

export type CreatePostActionResult =
  | { ok: true; postId: Id }
  | { ok: false; kind: "fields"; fieldErrors: CreatePostFieldErrors }
  | { ok: false; kind: "denied"; code: "forbidden" | "not_found" };

const VOTE_DEADLINE_MESSAGES: Record<
  "in_past" | "after_schedule_date" | "too_short" | "too_long",
  string
> = {
  in_past: strings.board.write.validation.voteDeadlineInPast,
  after_schedule_date: strings.board.write.validation.voteDeadlineAfterSchedule,
  too_short: strings.board.write.validation.voteDeadlineTooShort,
  too_long: strings.board.write.validation.voteDeadlineTooLong,
};

export async function createPostAction(
  input: CreatePostActionInput,
): Promise<CreatePostActionResult> {
  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return { ok: false, kind: "denied", code: "forbidden" };
  }

  const board = await getBoardByCrewId(input.crewId);
  if (!board) {
    return { ok: false, kind: "denied", code: "not_found" };
  }

  const membership = await getCrewMembership(input.crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(membership);

  const canCreatePost = checkPermission({ role, action: "post:create" });
  if (!canCreatePost.allowed) {
    return { ok: false, kind: "denied", code: "forbidden" };
  }
  if (input.type === "meetup_proposal") {
    const canProposeMeetup = checkPermission({ role, action: "poll:create_proposal" });
    if (!canProposeMeetup.allowed) {
      return { ok: false, kind: "denied", code: "forbidden" };
    }
  }

  const fieldErrors: CreatePostFieldErrors = {};
  const contentViolations = validatePostContent(input.title, input.body);
  if (contentViolations.includes("title_required")) {
    fieldErrors.title = strings.board.write.validation.titleRequired;
  }
  if (contentViolations.includes("body_required")) {
    fieldErrors.body = strings.board.write.validation.descriptionRequired;
  }

  const nowIso = new Date().toISOString();
  const meetupDate = input.meetupDate ?? "";
  const voteDeadline = input.voteDeadline ?? "";

  if (input.type === "meetup_proposal") {
    const scheduleViolations = validateMeetupProposalSchedule({
      scheduledDate: meetupDate,
      voteDeadline,
      nowIso,
    });
    for (const violation of scheduleViolations) {
      if (violation.field === "scheduledDate" && !fieldErrors.scheduledDate) {
        fieldErrors.scheduledDate = strings.board.write.validation.scheduledDateInPast;
      }
      if (violation.field === "voteDeadline" && !fieldErrors.voteDeadline) {
        fieldErrors.voteDeadline = VOTE_DEADLINE_MESSAGES[violation.reason];
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, kind: "fields", fieldErrors };
  }

  const post = await createPost({
    boardId: board.id,
    authorId: session.profileId,
    type: input.type,
    title: input.title.trim(),
    body: input.body.trim(),
    meetupDate: input.type === "meetup_proposal" ? meetupDate : null,
    startTime: input.type === "meetup_proposal" ? (input.startTime || null) : null,
    place: input.type === "meetup_proposal" ? (input.place || null) : null,
    // 0·음수 정원은 저장하지 않는다 — D-019의 조건부 UPDATE(`attendingCount < capacity`)가
    // 0 이하를 받으면 "정원 있음 + 항상 마감"이 되어 D-013 "정원 미지정 = 무제한"과 구분이
    // 안 된다. 클라이언트가 `min={1}`을 두지만 Server Action은 그 힌트를 신뢰하지 않는다.
    capacity:
      input.type === "meetup_proposal" && input.capacity !== null && input.capacity !== undefined && input.capacity > 0
        ? input.capacity
        : null,
  });

  if (input.type === "meetup_proposal") {
    // FR-040 AC1 — 대상자는 "등록 시각의 active 크루원" 스냅샷(D-025). 강퇴·탈퇴·초대
    // 대기 중인 멤버십 행은 제외한다.
    const members = await listCrewMembers(input.crewId);
    const eligibleVoterIds = members.filter((m) => m.status === "active").map((m) => m.profileId);
    await createPoll({
      postId: post.id,
      opensAt: post.createdAt,
      closesAt: voteDeadline,
      eligibleVoterIds,
    });
  }

  refresh();
  return { ok: true, postId: post.id };
}
