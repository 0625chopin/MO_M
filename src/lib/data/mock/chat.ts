import type { ChatMessage, ChatMessageType, ChatRoom, Id } from "@/lib/types";

import { type CursorPage, type DataResult, err, ok } from "../contracts";

import { generateId, store } from "./fixtures";

/**
 * ChatRoom·ChatMessage 데이터 접근 (FR-050~053).
 *
 * 실시간 전달(FR-051의 "실시간" 부분)은 이 레이어가 아니라 `lib/realtime`
 * (`subscribeToRoom`, D-030 ②)의 몫이다. 이 레이어는 저장·조회만 담당하고,
 * 실제 브로드캐스트는 호출자(컨테이너/Server Action)가 `lib/realtime`을 통해 별도로
 * 트리거한다 — 두 레이어를 섞으면 Mock↔Broadcast 전환 시 이 파일까지 고쳐야 한다.
 */

export async function getChatRoomByCrewId(crewId: Id): Promise<ChatRoom | null> {
  return store.chatRooms.find((r) => r.crewId === crewId) ?? null;
}

export interface ListMessagesQuery {
  /** 이 메시지보다 오래된 메시지부터 반환한다 — 위로 이어 로드(D-023). */
  beforeMessageId?: Id | null;
  /** 기본 50건(FR-051 최신 50건 원칙, Task 020A). */
  limit?: number;
}

/** 채팅 메시지 목록(FR-051), 최신순 정렬 후 페이지네이션. 삭제된 메시지는 제외한다. */
export async function listMessages(
  roomId: Id,
  opts: ListMessagesQuery = {},
): Promise<CursorPage<ChatMessage>> {
  const limit = opts.limit ?? 50;
  const all = store.chatMessages
    .filter((m) => m.roomId === roomId && !m.deletedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const startIndex = opts.beforeMessageId
    ? all.findIndex((m) => m.id === opts.beforeMessageId) + 1
    : 0;
  const page = all.slice(startIndex, startIndex + limit);
  const nextCursor = all[startIndex + limit] ? page[page.length - 1].id : null;
  return { items: page, nextCursor };
}

export interface SendMessageInput {
  roomId: Id;
  senderId: Id;
  type: ChatMessageType;
  body?: string | null;
  /** type='post_link'일 때 필수 — 같은 크루 게시글로 제한된다(요구사항 5.2절, 호출자가 검증). */
  refPostId?: Id | null;
  /** 재전송 중복 방지 키(D-030 ②, 낙관적 렌더·재전송의 멱등성 근거). */
  clientKey: string;
}

/**
 * 메시지 전송(FR-050·052). `clientKey`가 이미 존재하면 새로 만들지 않고 기존
 * 메시지를 그대로 반환한다 — 재전송 멱등 처리(Task 020B).
 */
export async function sendMessage(input: SendMessageInput): Promise<DataResult<ChatMessage>> {
  const existing = store.chatMessages.find((m) => m.clientKey === input.clientKey);
  if (existing) return ok(existing);

  if (input.type === "post_link" && !input.refPostId) {
    return err("validation_failed", "post_link 타입 메시지는 refPostId가 필요하다(FR-052).");
  }
  if (input.type === "text" && !input.body) {
    return err("validation_failed", "text 타입 메시지는 body가 필요하다.");
  }

  const message: ChatMessage = {
    id: generateId("message"),
    roomId: input.roomId,
    senderId: input.senderId,
    type: input.type,
    body: input.type === "text" ? (input.body ?? null) : null,
    refPostId: input.type === "post_link" ? (input.refPostId ?? null) : null,
    clientKey: input.clientKey,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  };
  store.chatMessages.push(message);
  return ok(message);
}

/** 메시지 삭제(FR-054, v0.2) — 소프트 삭제. 타입은 지금 확정해 둔다. */
export async function deleteMessage(id: Id): Promise<DataResult<ChatMessage>> {
  const message = store.chatMessages.find((m) => m.id === id && !m.deletedAt);
  if (!message) return err("not_found", `message ${id} 를 찾을 수 없다.`);
  message.deletedAt = new Date().toISOString();
  return ok(message);
}
