"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Composer } from "@/components/chat/Composer";
import { ConnectionBanner } from "@/components/chat/ConnectionBanner";
import {
  createOptimisticTimelineItem,
  type ChatTimelineItem,
  type MessageViewModel,
} from "@/components/chat/message-view-models";
import { MessageList } from "@/components/chat/MessageList";
import { loadEarlierMessagesAction } from "@/lib/actions/load-earlier-messages";
import { resyncChatMessagesAction } from "@/lib/actions/resync-chat-messages";
import type { SendChatMessageState } from "@/lib/actions/send-chat-message";
import { sendChatMessageAction } from "@/lib/actions/send-chat-message";
import { publishMockEvent, subscribeToRoom } from "@/lib/realtime";
import {
  nextChatConnectionStatus,
  type ChatConnectionStatus,
} from "@/lib/rules/chat-connection-state";
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
 * 채팅방 컨테이너(D-030 ①②) — Task 020A에서 `subscribeToRoom`(Task 008)을 처음 실제로
 * 소비하는 자리였고, Task 020B가 낙관적 렌더·재전송·연결 상태를 더했다. `useEffect` 안에서
 * 구독하고 정리(unsubscribe)하는 책임을 진다(mock.ts docstring이 요구하는 그대로).
 * `MessageListContainer`(서버 컴포넌트)가 최초 페이지를 조회해 props로 내려주고, 이 컨테이너는
 * 그 이후의 실시간 갱신·"위로 이어 로드"·전송(낙관적 렌더 포함)·연결 상태만 담당한다 — 최초
 * 조회까지 클라이언트에서 다시 하지 않는다(서버 조회 1회 + 실시간 구독으로 충분하다).
 *
 * **전송 소유권이 여기 있는 이유(DESIGN 020A 교차검증 BLOCKER 1의 연장)**: Task 020A 때 이미
 * `Composer`가 아니라 이 컨테이너가 `publishMockEvent`를 부르도록 고쳐졌다 — Server Action은
 * Node.js 서버 프로세스, `subscribeToRoom`은 브라우저(`useEffect`)에서만 실행되는데
 * `lib/realtime/mock.ts`의 `rooms` Map은 모듈 스코프 싱글턴이라 서버·클라이언트 번들에서 각자
 * 별개 인스턴스가 되기 때문이다(I-042). Task 020B는 여기서 한 걸음 더 나간다 — 재전송(FR-051
 * E1)이 입력창이 아니라 실패한 말풍선(`MessageBubble`)에서 트리거되므로, `sendChatMessageAction`
 * 호출 자체를 `submitMessage`로 옮겨 최초 전송과 재전송이 완전히 같은 코드 경로를 타게 했다.
 * `Composer`는 이제 검증을 통과한 본문만 `onSubmit`으로 올려보낸다.
 *
 * **낙관적 렌더(FR-051 정상 흐름 ③, Task 020B)**: `submitMessage`가 Server Action을 부르기
 * *전에* `pending` 맵에 로컬 항목을 먼저 넣는다(`createOptimisticTimelineItem`) — 사용자는
 * 서버 왕복을 기다리지 않고 자기 메시지를 바로 본다. 성공하면 `pending`에서 지우고 확정
 * 메시지를 `publishMockEvent`로 발행해(위 문단과 같은 이유로 컨테이너 자신이 브라우저 쪽에서
 * 발행) 자기 구독으로 되받아 `messages`에 append한다 — 다른 사용자의 메시지가 도착하는 것과
 * 정확히 같은 경로다. 실패(서버 `formError` 또는 네트워크 예외)하면 해당 `pending` 항목을
 * `"failed"`로 바꾼다. `clientKey`는 최초 전송 때 한 번만 만들고(`crypto.randomUUID()`)
 * 재전송에서도 그대로 재사용한다 — `sendMessage`(Mock 데이터 레이어)가 같은 `clientKey`를
 * 이미 저장된 메시지로 멱등 처리하므로(FR-051 AC4), "사실은 서버에 저장됐는데 응답만 유실된"
 * 재전송이 중복 메시지를 만들지 않는다.
 *
 * **연결 상태(FR-051 E2·NFR-009, Task 020B)**: `lib/rules/chat-connection-state.ts`의 상태
 * 기계를 브라우저 `online`/`offline` 이벤트(실제 신호 — Mock을 흉내 내지 않는다)와
 * `subscribeToRoom`의 `onError`(D-030 ③ 도메인 오류) 두 입력으로 굴린다. `"reconnecting"`에
 * 들어서면 `resyncChatMessagesAction`으로 마지막 수신 메시지 이후의 누락분을 보충 조회한다
 * (FR-051 E3·AC2) — Mock 단계에서는 탭 간 전송 계층이 없어(I-042) 대개 빈 배열이 돌아오지만,
 * 이 경로는 Task 033(Broadcast 연결) 이후 그대로 값을 채워 돌려주게 된다(D-030 ② "구독
 * 인터페이스만 바꿔 끼운다"). Mock 구독 자체는 소켓이 아니라 메모리 Map 등록이라 끊어질
 * 개념이 없으므로 이 회차에서는 "재구독"을 실제로 해제·재등록하는 의식(儀式) 코드를 만들지
 * 않았다 — `subscribeToRoom` 호출은 `roomId`가 바뀌지 않는 한 계속 유효하다.
 *
 * **Mock 단계의 구조적 한계 — 반드시 알고 있을 것**: `publishMockEvent` 발행은 **같은 브라우저
 * 탭(같은 JS 모듈 인스턴스) 안에서만** 유효하다. 다른 탭·다른 브라우저·다른 사용자에게는 이
 * 이벤트가 절대 전달되지 않는다 — Mock 단계에는 애초에 전송 계층이 없기 때문이다. 이건 새로
 * 생긴 버그가 아니라 **Mock First의 알려진 한계**이고, 억지로 흉내 내려 하지 않는다(예:
 * `BroadcastChannel`이나 폴링으로 탭 간 동기화를 만드는 것 — 실데이터 전환 때 걷어내야 할
 * 코드만 늘어난다). 실제 여러 사용자 간 실시간 전달은 Task 033(Supabase Realtime Broadcast,
 * D-023)이 `lib/realtime/broadcast.ts`를 배럴에 연결하는 순간 그대로 성립한다 — 이 컨테이너의
 * `subscribeToRoom`·`submitMessage`·재연결 처리 어느 쪽도 바뀌지 않는다(D-030 ②). 경위는
 * `docs/ISSUES.md` I-042 참고.
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
  const [pending, setPending] = useState<Map<string, ChatTimelineItem>>(new Map());
  const [isLoadingMore, startLoadMoreTransition] = useTransition();
  // 초기값을 effect가 아니라 lazy initializer(렌더 중)에서 계산한다 — effect 안에서
  // 동기적으로 setState하면 react-hooks/set-state-in-effect가 걸린다(추가 렌더 1회 발생).
  // SSR에서는 `navigator`가 없으므로 "connected"로 시작하고, 브라우저에서 이미 오프라인이면
  // 첫 렌더부터 바로 반영한다.
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>(() =>
    typeof navigator !== "undefined" && !navigator.onLine ? "disconnected" : "connected",
  );
  const seenIds = useRef(new Set(initialMessages.map((m) => m.id)));
  // 재연결 보충 조회(아래 effect)가 최신 `messages`를 읽되, 그 effect를 매 메시지 변경마다
  // 다시 돌리지 않기 위한 ref(D-029 — `MessageList`의 `onLoadMoreRef`와 같은 패턴).
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  });

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
      },
      (error) => {
        // 원본 에러는 개발자용(로그)만 — 화면에는 `ConnectionBanner`가 일반화된 문구를
        // 보여준다(NFR-014와 같은 이유, D-030 ③ 도메인 오류를 사용자에게 안전하게 노출).
        console.error("[chat] realtime subscription error", error);
        setConnectionStatus((s) => nextChatConnectionStatus(s, "connection_lost"));
      },
    );
    return unsubscribe;
  }, [roomId]);

  // 브라우저 온/오프라인 — NFR-009가 요구하는 "연결 상태 시각 표시"의 실제 신호다. 최초
  // 오프라인 판정은 위 lazy initializer가 이미 반영했으므로 여기서는 이후 전이만 구독한다.
  useEffect(() => {
    function handleOffline() {
      setConnectionStatus((s) => nextChatConnectionStatus(s, "connection_lost"));
    }
    function handleOnline() {
      setConnectionStatus((s) => nextChatConnectionStatus(s, "connection_restored"));
    }
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // 재연결 시 누락분 보충 조회(FR-051 E3·AC2) — "reconnecting"에 들어설 때 한 번만 실행한다.
  useEffect(() => {
    if (connectionStatus !== "reconnecting") return;
    let cancelled = false;

    (async () => {
      const lastMessage = messagesRef.current[messagesRef.current.length - 1];
      if (lastMessage) {
        const result = await resyncChatMessagesAction({
          crewId,
          roomId,
          afterMessageId: lastMessage.id,
        });
        const fresh = [...result.items].reverse().filter((m) => !seenIds.current.has(m.id));
        fresh.forEach((m) => seenIds.current.add(m.id));
        if (!cancelled && fresh.length > 0) {
          setMessages((prev) => [...prev, ...fresh]);
        }
      }
      if (!cancelled) setConnectionStatus((s) => nextChatConnectionStatus(s, "resynced"));
    })();

    return () => {
      cancelled = true;
    };
  }, [connectionStatus, crewId, roomId]);

  const handleLoadMore = () => {
    if (!cursor) return;
    startLoadMoreTransition(async () => {
      const result = await loadEarlierMessagesAction({ crewId, roomId, beforeMessageId: cursor });
      setMessages((prev) => {
        const fresh = [...result.items].reverse().filter((m) => !seenIds.current.has(m.id));
        fresh.forEach((m) => seenIds.current.add(m.id));
        return [...fresh, ...prev];
      });
      setCursor(result.nextCursor);
    });
  };

  function markPendingFailed(clientKey: string) {
    setPending((prev) => {
      const existing = prev.get(clientKey);
      if (!existing) return prev;
      const next = new Map(prev);
      next.set(clientKey, { ...existing, deliveryStatus: "failed" });
      return next;
    });
  }

  /** 최초 전송·재전송이 공유하는 유일한 경로(위 모듈 docstring 참고). */
  function submitMessage(body: string, clientKey: string) {
    const createdAt = new Date().toISOString();
    setPending((prev) =>
      new Map(prev).set(
        clientKey,
        createOptimisticTimelineItem({ clientKey, roomId, senderId: viewerProfileId, body, createdAt }),
      ),
    );

    void (async () => {
      const formData = new FormData();
      formData.set("crewId", crewId);
      formData.set("roomId", roomId);
      formData.set("body", body);
      formData.set("clientKey", clientKey);

      let result: SendChatMessageState;
      try {
        result = await sendChatMessageAction({}, formData);
      } catch (error) {
        console.error("[chat] send failed", error);
        markPendingFailed(clientKey);
        // 전송 자체가 예외로 끊겼다는 것은 네트워크 문제일 가능성이 높다 — 연결 배너에도 반영한다.
        setConnectionStatus((s) => nextChatConnectionStatus(s, "connection_lost"));
        return;
      }

      if (result.formError || !result.message) {
        markPendingFailed(clientKey);
        return;
      }

      setPending((prev) => {
        const next = new Map(prev);
        next.delete(clientKey);
        return next;
      });
      // 위 모듈 docstring 참고 — 같은 탭 안에서만 유효한 Mock 단계 한계다(I-042).
      publishMockEvent(roomId, {
        type: "chat_message_created",
        roomId,
        payload: result.message,
        occurredAt: result.message.createdAt,
      });
    })();
  }

  const handleComposerSubmit = (body: string) => {
    submitMessage(body, crypto.randomUUID());
  };

  const handleRetry = (clientKey: string) => {
    const item = pending.get(clientKey);
    if (!item || item.body === null) return;
    submitMessage(item.body, clientKey);
  };

  const handleManualReconnect = () => {
    // 실제로 오프라인이면 "재연결됨"으로 잘못 넘어가지 않는다 — 사용자가 배너의 버튼을 눌러도
    // 네트워크 자체가 없으면 아무 일도 일어나지 않는다(다시 온라인이 되면 `online` 이벤트가
    // 자동으로 상태를 이어받는다).
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setConnectionStatus((s) => nextChatConnectionStatus(s, "connection_restored"));
  };

  const timeline: ChatTimelineItem[] = [
    ...messages.map((m): ChatTimelineItem => ({ ...m, deliveryStatus: "sent" })),
    ...pending.values(),
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ConnectionBanner
        status={connectionStatus}
        onRetry={connectionStatus === "disconnected" ? handleManualReconnect : undefined}
      />
      <MessageList
        messages={timeline}
        viewerProfileId={viewerProfileId}
        hasMore={cursor !== null}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        onRetry={handleRetry}
      />
      <Composer canSend={canSend} onSubmit={handleComposerSubmit} />
    </div>
  );
}
