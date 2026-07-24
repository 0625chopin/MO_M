"use client";

import { ConnectionBanner } from "@/components/chat/ConnectionBanner";
import type { ChatConnectionStatus } from "@/lib/rules/chat-connection-state";

export interface ConnectionBannerPreviewProps {
  status: ChatConnectionStatus;
}

/**
 * `/sample` 전용 클라이언트 경계 — `ConnectionBanner`의 `onRetry: () => void`는 함수 prop인데
 * `sections/chat.tsx`는 서버 컴포넌트라 클로저를 직접 넘길 수 없다(RSC는 함수를 직렬화하지
 * 않는다). `ChatMessageListPreview.tsx`·`BoardErrorStatePreview.tsx`와 같은 이유·같은 패턴이다.
 *
 * `status === "disconnected"`일 때만 `onRetry`를 채워 실제 컴포넌트의 "재시도" 버튼까지
 * 보여준다 — 클릭해도 이 프리뷰 밖으로는 아무 효과가 없는 no-op이다.
 */
export function ConnectionBannerPreview({ status }: ConnectionBannerPreviewProps) {
  return (
    <ConnectionBanner status={status} onRetry={status === "disconnected" ? () => {} : undefined} />
  );
}
