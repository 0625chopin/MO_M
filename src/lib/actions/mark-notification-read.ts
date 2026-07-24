"use server";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { markNotificationRead } from "@/lib/data";
import type { Id } from "@/lib/types";

/**
 * 알림 읽음 처리(FR-071 AC2, Task 023). 클라이언트는 알림 id만 넘긴다 — 대상자 검증은
 * `markNotificationRead`가 세션의 `profileId`로 소유권을 확인한다(`withdraw-join-request.ts`와
 * 같은 이유, 다른 사람의 알림 id를 넘기는 경로를 막는다).
 *
 * 이 Server Action은 `refresh()`를 부르지 않는다 — 호출부(`useNotificationFeed`)가 이미
 * 낙관적으로 로컬 상태를 갱신했고, 이 액션은 그 상태와 서버 값을 맞추는 백그라운드 쓰기일
 * 뿐이다(`MessageRoomContainer`가 확정 메시지를 `publishMockEvent`로만 반영하고 `refresh()`를
 * 부르지 않는 것과 같은 실시간 경계 패턴, D-030 ②).
 */
export async function markNotificationReadAction(notificationId: Id): Promise<void> {
  const session = await getAuthSession();
  if (session.status !== "authenticated") return;
  await markNotificationRead(notificationId, session.profileId);
}
