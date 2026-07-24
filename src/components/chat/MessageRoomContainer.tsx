"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Composer } from "@/components/chat/Composer";
import type { MessageViewModel } from "@/components/chat/message-view-models";
import { MessageList } from "@/components/chat/MessageList";
import { loadEarlierMessagesAction } from "@/lib/actions/load-earlier-messages";
import { publishMockEvent, subscribeToRoom } from "@/lib/realtime";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

export interface MessageRoomContainerProps {
  crewId: Id;
  roomId: Id;
  viewerProfileId: Id;
  initialMessages: MessageViewModel[];
  initialCursor: Id | null;
  /** `chat:send_message` 판정 결과 — `Composer`에 그대로 내려준다. */
  canSend: boolean;
}

function isMessageViewModel(payload: unknown): payload is MessageViewModel {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    "roomId" in payload &&
    "senderId" in payload
  );
}

/**
 * 채팅방 컨테이너(D-030 ①②) — 이 회차(Task 020A)에서 `subscribeToRoom`(Task 008)을 처음 실제로
 * 소비하는 자리다. `useEffect` 안에서 구독하고 정리(unsubscribe)하는 책임을 진다(mock.ts
 * docstring이 요구하는 그대로). `MessageListContainer`(서버 컴포넌트)가 최초 페이지를 조회해
 * props로 내려주고, 이 컨테이너는 그 이후의 실시간 갱신과 "위로 이어 로드"만 담당한다 —
 * 최초 조회까지 클라이언트에서 다시 하지 않는다(서버 조회 1회 + 실시간 구독으로 충분하다).
 *
 * **`Composer`를 여기서 렌더링하는 이유(DESIGN 020A 교차검증 BLOCKER 1 수정)**: 처음에는
 * `Composer`를 `MessageListContainer`(서버)가 형제로 직접 렌더링했고, `sendChatMessageAction`
 * (`"use server"`)이 성공 시 자기 안에서 바로 `publishMockEvent`를 불렀다. **이게 실제로는
 * 발신자 본인 화면에도 메시지가 도착하지 않는 버그였다** — Server Action은 Node.js 서버
 * 프로세스에서 실행되고 `subscribeToRoom`은 브라우저(`useEffect`)에서만 실행되는데,
 * `lib/realtime/mock.ts`의 `rooms` Map은 모듈 스코프 싱글턴이라 Next.js가 서버 번들·클라이언트
 * 번들을 따로 만드는 순간 **두 `rooms`는 완전히 별개 인스턴스**가 된다(서버 쪽에서 발행해도
 * 구독자 0명인 서버 쪽 Map에서 조용히 사라진다). 그래서 지금은 이 컨테이너가 `Composer`의
 * `onSent` 콜백으로 저장된 메시지를 직접 받아 **브라우저 쪽** `publishMockEvent`를 부른다 —
 * 이 컨테이너 자신이 바로 아래 `useEffect`로 같은 방을 구독 중이므로, 그 이벤트가 자기 자신의
 * `onEvent` 핸들러를 통해 `messages`에 append된다(다른 사용자의 메시지가 도착하는 것과 정확히
 * 같은 코드 경로 — 발신자만 예외 취급하지 않는다).
 *
 * **Mock 단계의 구조적 한계 — 반드시 알고 있을 것**: 이 발행은 **같은 브라우저 탭(같은 JS
 * 모듈 인스턴스) 안에서만** 유효하다. 다른 탭·다른 브라우저·다른 사용자에게는 이 이벤트가
 * 절대 전달되지 않는다 — Mock 단계에는 애초에 전송 계층(서버↔여러 클라이언트를 잇는 실제
 * 연결)이 없기 때문이다. 이건 새로 생긴 버그가 아니라 **Mock First의 알려진 한계**이고, 억지로
 * 흉내 내려 하지 않는다(예: `BroadcastChannel`이나 폴링으로 탭 간 동기화를 만드는 것 — 실데이터
 * 전환 때 걷어내야 할 코드만 늘어난다). 실제 여러 사용자 간 실시간 전달은 Task 033(Supabase
 * Realtime Broadcast, D-023)이 `lib/realtime/broadcast.ts`를 배럴에 연결하는 순간 그대로
 * 성립한다 — 이 컨테이너의 `subscribeToRoom` 호출부·`Composer`의 `onSent` 콜백 어느 쪽도
 * 바뀌지 않는다(D-030 ②가 지키려는 바로 그 성질). 경위는 `docs/ISSUES.md` I-042 참고.
 */
export function MessageRoomContainer({
  crewId,
  roomId,
  viewerProfileId,
  initialMessages,
  initialCursor,
  canSend,
}: MessageRoomContainerProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [cursor, setCursor] = useState(initialCursor);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoadingMore, startTransition] = useTransition();
  const seenIds = useRef(new Set(initialMessages.map((m) => m.id)));

  useEffect(() => {
    const unsubscribe = subscribeToRoom(
      roomId,
      (event) => {
        if (event.type !== "chat_message_created" || event.roomId !== roomId) return;
        if (!isMessageViewModel(event.payload)) return;
        const payload = event.payload;
        if (seenIds.current.has(payload.id)) return;
        seenIds.current.add(payload.id);
        setMessages((prev) => [...prev, payload]);
        setConnectionError(null);
      },
      (error) => {
        // 원본 메시지는 개발자용(로그)만 — 화면에는 일반화된 문구를 보여준다(NFR-014와
        // 같은 이유, D-030 ③ 도메인 오류를 사용자에게 안전하게 노출).
        console.error("[chat] realtime subscription error", error);
        setConnectionError(strings.chat.room.connectionErrorDescription);
      },
    );
    return unsubscribe;
  }, [roomId]);

  const handleLoadMore = () => {
    if (!cursor) return;
    startTransition(async () => {
      const result = await loadEarlierMessagesAction({ crewId, roomId, beforeMessageId: cursor });
      setMessages((prev) => {
        const fresh = [...result.items].reverse().filter((m) => !seenIds.current.has(m.id));
        fresh.forEach((m) => seenIds.current.add(m.id));
        return [...fresh, ...prev];
      });
      setCursor(result.nextCursor);
    });
  };

  const handleSent = (message: MessageViewModel) => {
    // 위 모듈 docstring 참고 — 같은 탭 안에서만 유효한 Mock 단계 한계다.
    publishMockEvent(roomId, {
      type: "chat_message_created",
      roomId,
      payload: message,
      occurredAt: message.createdAt,
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageList
        messages={messages}
        viewerProfileId={viewerProfileId}
        hasMore={cursor !== null}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        connectionError={connectionError}
      />
      <Composer crewId={crewId} roomId={roomId} canSend={canSend} onSent={handleSent} />
    </div>
  );
}
