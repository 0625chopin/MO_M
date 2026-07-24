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

/**
 * 알림 읽음 처리. 이미 읽은 알림에 다시 호출해도 조용히 성공한다(멱등).
 * `recipientId`로 소유권을 확인한다 — 다른 사람의 알림 id를 추측해 넘기는 경로를 막는다
 * (`withdraw-join-request.ts`의 "조회 조건 자체가 게이트" 패턴과 같은 이유).
 */
export async function markNotificationRead(id: Id, recipientId: Id): Promise<DataResult<Notification>> {
  const notification = store.notifications.find((n) => n.id === id);
  if (!notification) return err("not_found", `notification ${id} 를 찾을 수 없다.`);
  if (notification.recipientId !== recipientId) {
    return err("forbidden", `notification ${id} 는 profile ${recipientId} 소유가 아니다.`);
  }
  notification.readAt ??= new Date().toISOString();
  return ok(notification);
}

/** FR-071 AC3 "모두 읽음" — 대상자의 안읽음 알림을 전부 읽음 처리하고 처리 건수를 반환한다. */
export async function markAllNotificationsRead(recipientId: Id): Promise<number> {
  const now = new Date().toISOString();
  let count = 0;
  for (const notification of store.notifications) {
    if (notification.recipientId === recipientId && !notification.readAt) {
      notification.readAt = now;
      count += 1;
    }
  }
  return count;
}

/** FR-071 AC1 "헤더 배지" — 안읽음 개수만 필요한 호출부(헤더 배지)를 위한 가벼운 카운트. */
export async function countUnreadNotifications(recipientId: Id): Promise<number> {
  return store.notifications.filter((n) => n.recipientId === recipientId && !n.readAt).length;
}
