import { strings, t } from "@/lib/strings";

/**
 * 알림 시각 표시 — "N분 전" 상대 시각(`common.time.*`)을 쓴다. `board/format-post-date.ts`가
 * 상대 시각을 피하는 이유(서버 컴포넌트 렌더 시각과 사용자가 보는 시각의 괴리, 캐시 재검증
 * 문제)는 이 컴포넌트들에는 적용되지 않는다 — `NotificationBell`·`NotificationList`는
 * 실시간 구독을 갖는 클라이언트 컴포넌트라(D-030 ②) `chat/format-message-time.ts`와 같은
 * 이유로 하이드레이션 시각차 문제가 없다. `now`를 인자로 받아 순수 함수로 남긴다 — 기본값
 * `new Date()`는 호출 시점(렌더 중)에 한 번 평가된다.
 */
export function formatNotificationTime(iso: string, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - new Date(iso).getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return strings.common.time.justNow;
  if (diffMinutes < 60) return t((s) => s.common.time.minutesAgo, { n: diffMinutes });
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return t((s) => s.common.time.hoursAgo, { n: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  return t((s) => s.common.time.daysAgo, { n: diffDays });
}
