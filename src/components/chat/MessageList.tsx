"use client";

import { Loader2Icon, MessageCircleIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

import { loadScrollAnchor, saveScrollAnchor } from "@/components/chat/chat-scroll-storage";
import type { ChatTimelineItem } from "@/components/chat/message-view-models";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { strings, t } from "@/lib/strings";
import type { Id } from "@/lib/types";

export interface MessageListProps {
  /** 스크롤 위치·읽음 지점 앵커(FR-053 AC2)를 방 단위로 저장·복원하는 키로 쓴다. */
  roomId: Id;
  /** 오래된 → 최신 순(화면에 보이는 순서 그대로). 서버 확정 메시지 뒤에 로컬 낙관적(pending·
   *  failed) 메시지가 이어 붙는다 — 컨테이너가 이미 이 순서로 합쳐 내려준다(Task 020B). */
  messages: ChatTimelineItem[];
  viewerProfileId: Id;
  /** `nextCursor !== null` — 더 오래된 메시지가 남아 있는지(FR-051 AC3). */
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  /** 실패한 메시지의 재전송(FR-051 E1) — `clientKey`로 대상을 지목한다. */
  onRetry?: (clientKey: string) => void;
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
 *
 * **스크롤 위치·읽음 지점 복원(Task 020C, FR-053 AC2)**: 최초 진입 시 무조건 최하단으로 가지
 * 않는다 — `chat-scroll-storage.ts`에 저장된 앵커 메시지 id가 있으면(게시글 카드를 눌러 상세로
 * 갔다가 돌아온 경우) 그 메시지로 스크롤한다. 앵커는 스크롤 이벤트마다(rAF로 스로틀) 현재 맨
 * 위에 보이는 메시지 id로 계속 갱신한다 — 클릭 시점에 별도로 저장하지 않아도 이미 최신값이다.
 * `MessageBubble`의 두 루트가 갖는 `data-message-id`로 앵커를 찾는다.
 *
 * **Task 020B에서 `connectionError` prop을 제거했다**: 구독 실패(D-030 ③ 도메인 오류)를 이
 * 목록 안에 인라인 배너로 보여주던 것을, `MessageRoomContainer`가 소유하는 연결 상태 기계
 * (`lib/rules/chat-connection-state.ts`)와 `ConnectionBanner`로 옮겼다 — 브라우저 온/오프라인과
 * 구독 오류를 같은 상태로 합쳐 방 상단 한 곳에서만 보여주기 위해서다(NFR-009, 중복 표시 방지).
 */
export function MessageList({
  roomId,
  messages,
  viewerProfileId,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onRetry,
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
      const anchorId = loadScrollAnchor(roomId);
      const anchorEl = anchorId
        ? el.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(anchorId)}"]`)
        : null;
      if (anchorEl) {
        // 상세 페이지에서 돌아온 복귀(FR-053 AC2) — 보던 메시지 위치로 복원한다.
        anchorEl.scrollIntoView({ block: "center" });
      } else {
        el.scrollTop = el.scrollHeight; // 앵커 없음: 최초 진입, 최신 메시지(하단)로 스크롤(FR-051 AC3).
      }
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
  }, [messages, roomId]);

  // 앵커 갱신(Task 020C, FR-053 AC2) — 스크롤할 때마다(rAF 스로틀) 현재 맨 위에 보이는
  // 메시지 id를 저장해 둔다. 클릭 시점에 별도로 저장하지 않아도 되도록 항상 최신값을 유지한다.
  useEffect(() => {
    const el: HTMLDivElement | null = scrollRef.current;
    if (!el) return;
    const container: HTMLDivElement = el;
    let frame: number | null = null;

    function persistTopmostVisible(container: HTMLDivElement) {
      frame = null;
      const containerTop = container.getBoundingClientRect().top;
      const rows = container.querySelectorAll<HTMLElement>("[data-message-id]");
      for (const row of rows) {
        if (row.getBoundingClientRect().bottom > containerTop) {
          const id = row.dataset.messageId;
          if (id) saveScrollAnchor(roomId, id);
          return;
        }
      }
    }

    function handleScroll() {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => persistTopmostVisible(container));
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [roomId]);

  // NFR-021("새 메시지"는 live region으로 안내) — 스크롤 보정 effect와는 별도 ref로 추적한다.
  // 위로 이어 로드는 맨 앞 메시지가 바뀔 뿐 맨 뒤(prevLastIdRef 기준)는 그대로라 오탐하지
  // 않는다. 본인이 보낸 메시지는 낙관적 렌더든 서버 확정 echo든 스스로 이미 알고 있어 알리지
  // 않는다 — 그래서 낙관적 항목의 `id`가 `clientKey`에서 서버 `id`로 바뀌어도(둘 다 본인
  // 메시지) 안전하다.
  const announceRef = useRef<HTMLDivElement>(null);
  const prevLastIdRef = useRef<string | null>(null);
  const isFirstAnnounceRef = useRef(true);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    if (isFirstAnnounceRef.current) {
      isFirstAnnounceRef.current = false;
      prevLastIdRef.current = lastMessage.id;
      return;
    }
    if (lastMessage.id === prevLastIdRef.current) return;
    prevLastIdRef.current = lastMessage.id;
    if (lastMessage.senderId === viewerProfileId) return;
    if (announceRef.current) {
      announceRef.current.textContent = t((s) => s.chat.message.newMessageAnnouncement, {
        name: lastMessage.senderDisplayName,
      });
    }
  }, [messages, viewerProfileId]);

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
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />
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
        {/* 안정적인 key(NFR-003·007, D-029) — 메시지 id(낙관적 항목은 clientKey)는 재전송돼도
            바뀌지 않는다. */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === viewerProfileId}
            onRetry={onRetry ? () => onRetry(message.clientKey) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
