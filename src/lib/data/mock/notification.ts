import type { Id, Notification, NotificationChannel, NotificationType } from "@/lib/types";

import { type CursorPage, type DataResult, err, ok } from "../contracts";

import { generateId, store } from "./fixtures";

/**
 * Notification 데이터 접근 (FR-070 토스트·FR-071 알림 센터).
 *
 * 토스트(즉시 표시)와 알림 센터(목록)는 같은 `Notification` 레코드를 소비한다 —
 * 생성 시점에 `lib/realtime`을 통해 브로드캐스트하면 토스트가 되고, 나중에
 * `listNotificationsForProfile`로 다시 읽으면 알림 센터가 된다. 채널 어댑터
 * (`web_push`·`native_push`, NFR-038)는 `channel` 필드에 이미 자리가 있으므로
 * 이 함수들의 시그니처를 바꾸지 않고 나중에 추가할 수 있다(FR-073 AC1·AC2).
 */

export interface ListNotificationsQuery {
  unreadOnly?: boolean;
  cursor?: Id | null;
  limit?: number;
}

export async function listNotificationsForProfile(
  recipientId: Id,
  opts: ListNotificationsQuery = {},
): Promise<CursorPage<Notification>> {
  const limit = opts.limit ?? 20;
  const all = store.notifications
    .filter((n) => n.recipientId === recipientId && (!opts.unreadOnly || !n.readAt))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const startIndex = opts.cursor ? all.findIndex((n) => n.id === opts.cursor) + 1 : 0;
  const page = all.slice(startIndex, startIndex + limit);
  const nextCursor = all[startIndex + limit] ? page[page.length - 1].id : null;
  return { items: page, nextCursor };
}

export interface CreateNotificationInput {
  recipientId: Id;
  type: NotificationType;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
}

/** 알림 생성 — 투표 종료(FR-045)·가입 신청(FR-023) 등 다른 도메인 이벤트가 호출한다. */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const notification: Notification = {
    id: generateId("notification"),
    recipientId: input.recipientId,
    type: input.type,
    channel: input.channel,
    payload: input.payload,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  store.notifications.push(notification);
  return notification;
}

/** 알림 읽음 처리. 이미 읽은 알림에 다시 호출해도 조용히 성공한다(멱등). */
export async function markNotificationRead(id: Id): Promise<DataResult<Notification>> {
  const notification = store.notifications.find((n) => n.id === id);
  if (!notification) return err("not_found", `notification ${id} 를 찾을 수 없다.`);
  notification.readAt ??= new Date().toISOString();
  return ok(notification);
}
