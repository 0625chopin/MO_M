import { toNotificationItemViewModel } from "@/components/notifications/notification-view-models";
import { NotificationCenterListContainer } from "@/components/notifications/NotificationCenterListContainer";
import { assertAuthenticatedSession } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { countUnreadNotifications, listNotificationsForProfile } from "@/lib/data";

const NOTIFICATION_CENTER_PAGE_SIZE = 30;

/**
 * `/notifications`(SC-18, FR-071) 페이지 컨테이너(D-030 ①) — Task 023. 이 라우트는 이미
 * `(app)/layout.tsx`(D-030 ④)가 인증을 보장하는 트리 안이라 `assertAuthenticatedSession`으로
 * 타입만 좁힌다(`MonthCalendarContainer`·`HomeCalendarSummaryContainer`와 같은 패턴, 실제
 * 리다이렉트는 하지 않는다 — 이미 레이아웃이 했다).
 */
export async function NotificationCenterContainer() {
  const session = await getAuthSession();
  assertAuthenticatedSession(session);

  const [page, unreadCount] = await Promise.all([
    listNotificationsForProfile(session.profileId, { limit: NOTIFICATION_CENTER_PAGE_SIZE }),
    countUnreadNotifications(session.profileId),
  ]);

  return (
    <NotificationCenterListContainer
      profileId={session.profileId}
      initialNotifications={page.items.map(toNotificationItemViewModel)}
      initialUnreadCount={unreadCount}
    />
  );
}
