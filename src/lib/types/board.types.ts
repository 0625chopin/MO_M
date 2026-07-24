import type { Id, ISODateString, ISODateTimeString } from "./common.types";

export interface Board {
  id: Id;
  crewId: Id;
}

export type PostType = "general" | "meetup_proposal";

export interface Post {
  id: Id;
  boardId: Id;
  authorId: Id;
  type: PostType;
  title: string;
  body: string;
  /** 모임 제안글(type='meetup_proposal')에서만 의미 있다. */
  meetupDate: ISODateString | null;
  /**
   * 모임 제안글의 선택 입력 3종(D-013) — 시작 시각·장소·정원. `meetupDate`와 같은 이유로
   * `general` 게시글에서는 항상 null이다. 가결(closed_passed) 시 Task 034의 판정 파이프라인이
   * 이 값들을 그대로 `createMeetupFromPoll`(`lib/data/mock/meetup.ts`)의 입력으로 옮긴다 —
   * Meetup은 가결 전에는 존재하지 않으므로 등록 시점부터 판정 시점까지 이 값을 들고 있을
   * 자리가 Post 말고 없다(Task 018B).
   */
  startTime: string | null;
  place: string | null;
  capacity: number | null;
  createdAt: ISODateTimeString;
  /** 수정 시각. FR-032 AC1의 수정 표시 근거(D-035) — 수정 이력이 없으면 null. */
  editedAt: ISODateTimeString | null;
  deletedAt: ISODateTimeString | null;
}

/** FR-033, v0.2 대상 — 데이터 모델만 선반영. */
export interface Comment {
  id: Id;
  postId: Id;
  authorId: Id;
  parentId: Id | null;
  body: string;
  deletedAt: ISODateTimeString | null;
}
