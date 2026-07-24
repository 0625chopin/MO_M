"use server";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { markAllNotificationsRead } from "@/lib/data";

/**
 * "모두 읽음"(FR-071 AC3, Task 023). 세션의 `profileId`만 대상으로 삼는다 — 클라이언트가 대상
 * 사용자를 지정할 수 없다(`mark-notification-read.ts`와 같은 소유권 게이트).
 * `refresh()`를 부르지 않는 이유도 그 파일과 같다 — `useNotificationFeed`가 이미 낙관적으로
 * 전체 목록을 읽음 처리해 뒀다.
 */
export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await getAuthSession();
  if (session.status !== "authenticated") return;
  await markAllNotificationsRead(session.profileId);
}
