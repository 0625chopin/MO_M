"use client";

import type { MessageViewModel } from "@/components/chat/message-view-models";
import { MessageList } from "@/components/chat/MessageList";

export interface ChatMessageListPreviewProps {
  messages: MessageViewModel[];
  viewerProfileId: string;
  hasMore?: boolean;
  connectionError?: string;
}

/**
 * `/sample` 전용 클라이언트 경계 — `MessageList`(`"use client"`)의 `onLoadMore: () => void`는
 * 필수 함수 prop인데 `sections/chat.tsx`는 서버 컴포넌트라 클로저를 직접 만들어 넘길 수 없다
 * (React Server Component는 함수를 직렬화하지 않는다). `BoardErrorStatePreview.tsx`·
 * `RouteErrorBoundaryPreview.tsx`와 같은 이유·같은 패턴이다(DESIGN 020A 교차검증 BLOCKER 2 —
 * `sections/chat.tsx`가 이 전례를 놓치고 서버 컴포넌트에서 `onLoadMore={() => {}}`를 직접
 * 넘겼던 것을 이 래퍼로 고쳤다).
 *
 * 이 회차(020A) 데모는 실제 이어 로드를 흉내 내지 않는다 — `onLoadMore`는 이 파일 안에서만
 * 만들어지고 쓰이는 no-op이라(서버→클라이언트 경계를 넘지 않는다) 클릭해도 아무 일도
 * 일어나지 않는다.
 */
export function ChatMessageListPreview({
  messages,
  viewerProfileId,
  hasMore = false,
  connectionError,
}: ChatMessageListPreviewProps) {
  return (
    <MessageList
      messages={messages}
      viewerProfileId={viewerProfileId}
      hasMore={hasMore}
      isLoadingMore={false}
      onLoadMore={() => {}}
      connectionError={connectionError}
    />
  );
}
