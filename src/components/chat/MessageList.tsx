"use client";

import { Loader2Icon, MessageCircleIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

import type { MessageViewModel } from "@/components/chat/message-view-models";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ErrorState } from "@/components/ui/error-state";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

export interface MessageListProps {
  /** 오래된 → 최신 순(화면에 보이는 순서 그대로). 컨테이너가 정렬을 마쳐 내려준다. */
  messages: MessageViewModel[];
  viewerProfileId: Id;
  /** `nextCursor !== null` — 더 오래된 메시지가 남아 있는지(FR-051 AC3). */
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  /** 구독 자체의 실패(D-030 ③ 도메인 오류) — `RealtimeConnectionError.message`가 아니라
   *  컨테이너가 이미 사용자용 문구로 바꿔 내려준 값. */
  connectionError?: string | null;
}

/**
 * 채팅 메시지 목록(FR-051). 순수 표현 컴포넌트 — `lib/data`·`lib/realtime`을 참조하지 않고
 * 컨테이너(`MessageRoomContainer`)가 이미 조회·구독한 값만 props로 받는다(D-030 ①).
 *
 * **윈도잉(NFR-003·007, D-029)**: 가상화 라이브러리를 새로 들이지 않는다(의존성 추가는 팀장
 * 승인 사항, 승인 없이 도입하지 않았다). 대신 데이터 레이어가 이미 구현한 **커서 기반 페이지
 * 윈도우**(최신 50건 + 위로 이어 로드)가 DOM에 한 번에 올라가는 메시지 수 자체를 제한한다 —
 * 이 요구사항이 실제로 요구하는 것은 가상 스크롤이 아니라 "한 번에 다 안 불러온다"이다
 * (요구사항 문서 FR-051 AC3 원문). 최상단 sentinel의 `IntersectionObserver`가 스크롤을
 * 감지해 `onLoadMore`를 호출한다.
 *
 * **스크롤 위치 보정**: 위로 이어 로드 시 앞쪽에 항목이 붙으면 브라우저가 `scrollTop`을 그대로
 * 두어 화면이 아래로 튄다 — `useLayoutEffect`에서 이전 `scrollHeight`와의 차이만큼 보정해
 * 사용자가 보던 위치를 유지한다. 새 메시지가 실시간으로 도착했을 때는 사용자가 하단 근처에
 * 있을 때만 따라 내려간다(과거 메시지를 읽는 중에 강제로 끌어내리지 않는다).
 */
export function MessageList({
  messages,
  viewerProfileId,
  hasMore,
  isLoadingMore,
  onLoadMore,
  connectionError,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  // ref는 렌더 중이 아니라 렌더 이후(effect)에만 갱신한다 — 렌더 중 갱신은
  // react-hooks/refs(렌더 순수성) 위반이다.
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  const isFirstRenderRef = useRef(true);
  const prevFirstIdRef = useRef<string | null>(messages[0]?.id ?? null);
  const prevScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstId = messages[0]?.id ?? null;

    if (isFirstRenderRef.current) {
      el.scrollTop = el.scrollHeight; // 최초 진입: 최신 메시지(하단)로 스크롤(FR-051 AC3).
      isFirstRenderRef.current = false;
    } else if (firstId !== prevFirstIdRef.current) {
      // 맨 앞 메시지 id가 바뀌었다 = 위로 이어 로드로 오래된 메시지가 앞에 붙었다.
      // 늘어난 높이만큼 scrollTop을 보정해 사용자가 보던 위치를 그대로 유지한다.
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
    } else {
      // 그 외(실시간 새 메시지 도착)에는 하단 근처에 있을 때만 따라 내려간다 — 보정 전
      // scrollHeight·scrollTop 기준이라 "이전 렌더 시점에 하단에 가까웠는가"를 본다.
      const wasNearBottom = prevScrollHeightRef.current - el.scrollTop < 160;
      if (wasNearBottom) el.scrollTop = el.scrollHeight;
    }

    prevFirstIdRef.current = firstId;
    prevScrollHeightRef.current = el.scrollHeight;
  }, [messages]);

  useLayoutEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { root: scrollRef.current, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  if (messages.length === 0) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircleIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{strings.chat.room.empty}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto @container">
      <div className="flex flex-col gap-3 p-4">
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-2" aria-hidden={!isLoadingMore}>
            {isLoadingMore && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2Icon aria-hidden="true" className="size-3.5 animate-spin" />
                {strings.chat.room.loadingEarlier}
              </span>
            )}
          </div>
        )}
        {connectionError && (
          <ErrorState title={strings.chat.room.connectionErrorTitle} description={connectionError} />
        )}
        {/* 안정적인 key(NFR-003·007, D-029) — 메시지 id는 재전송돼도 바뀌지 않는다. */}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.senderId === viewerProfileId} />
        ))}
      </div>
    </div>
  );
}
