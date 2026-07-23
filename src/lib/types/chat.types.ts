import type { Id, ISODateTimeString } from "./common.types";

export interface ChatRoom {
  id: Id;
  crewId: Id;
}

export type ChatMessageType = "text" | "post_link";

export interface ChatMessage {
  id: Id;
  roomId: Id;
  senderId: Id;
  type: ChatMessageType;
  /** type='post_link'면 보통 null — refPostId가 본문 역할을 대신한다. */
  body: string | null;
  /** type='post_link'에서만 사용. 같은 크루 게시글로 제한된다(requirements.md 5.2절). */
  refPostId: Id | null;
  /** 재전송 중복 방지 키 — 낙관적 렌더·재전송의 멱등성 근거(D-030 ②, Task 020B). */
  clientKey: string;
  createdAt: ISODateTimeString;
  deletedAt: ISODateTimeString | null;
}
