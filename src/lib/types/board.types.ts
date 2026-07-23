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
