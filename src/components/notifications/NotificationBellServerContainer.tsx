import { toNotificationItemViewModel } from "@/components/notifications/notification-view-models";
import { NotificationBellContainer } from "@/components/notifications/NotificationBellContainer";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { countUnreadNotifications, listNotificationsForProfile } from "@/lib/data";

const BELL_PREVIEW_LIMIT = 5;

/**
 * 헤더 알림 벨의 서버 컨테이너(D-030 ①, Task 023) — 최초 조회를 소유한다. `HomeCalendarSummaryContainer`
 * 처럼 이 컨테이너 자신이 `getAuthSession()`을 부른다(비용은 쿠키 읽기 하나뿐이라 트리 여러
 * 곳에서 반복 호출해도 무해하다) — 게스트면 `null`을 렌더해 벨 자체가 보이지 않는다(`nav-items.ts`가
 * 인증 사용자에게만 알림 nav 항목을 주는 것과 같은 판단, fail-closed).
 *
 * `AppShell`이 이 컴포넌트를 슬롯(prop)으로 만들어 `HeaderNav`(클라이언트 컴포넌트)에 내려준다
 * — 서버 컴포넌트를 클라이언트 컴포넌트 모듈에서 직접 import할 수 없어(RSC 경계), 부모인
 * `AppShell`(서버)이 조립해 자식으로 넘기는 합성 패턴을 쓴다.
 */
export async function NotificationBellServerContainer() {
  const session = await getAuthSession();
  if (session.status !== "authenticated") return null;

  const [page, unreadCount] = await Promise.all([
    listNotificationsForProfile(session.profileId, { limit: BELL_PREVIEW_LIMIT }),
    countUnreadNotifications(session.profileId),
  ]);

  return (
    <NotificationBellContainer
      profileId={session.profileId}
      initialNotifications={page.items.map(toNotificationItemViewModel)}
      initialUnreadCount={unreadCount}
    />
  );
}
