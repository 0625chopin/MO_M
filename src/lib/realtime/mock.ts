/**
 * Mock 이벤트 소스 — Task 008 (D-030 ②, CON-12). 타이머 기반: 실제 백엔드
 * 없이 방(room) 단위로 구독자를 관리하고, 필요하면 주기적으로 합성 이벤트를
 * 흘려보낸다.
 *
 * 이 모듈은 순수 함수 계층(`lib/rules/`)이 아니다 — 구독 생명주기(Map, 타이머)
 * 라는 부작용을 의도적으로 감싸는 것이 이 파일의 존재 이유다(D-030 ②). 그래도
 * React·Next는 import하지 않는다 — 컨테이너 컴포넌트가 `useEffect` 안에서
 * `subscribeToRoom`을 호출하고 정리하는 책임을 진다.
 */

import type {
  RealtimeConnectionError,
  RealtimeErrorHandler,
  RealtimeEvent,
  RealtimeEventHandler,
  SubscribeToRoom,
  Unsubscribe,
} from "./types";

interface RoomSubscribers {
  handlers: Set<RealtimeEventHandler>;
  errorHandlers: Set<RealtimeErrorHandler>;
}

/** 프로세스(브라우저 탭) 전역 상태 — 여러 컨테이너가 같은 방을 구독하면 공유된다. */
const rooms = new Map<string, RoomSubscribers>();

function getOrCreateRoom(roomId: string): RoomSubscribers {
  const existing = rooms.get(roomId);
  if (existing) return existing;
  const created: RoomSubscribers = { handlers: new Set(), errorHandlers: new Set() };
  rooms.set(roomId, created);
  return created;
}

/** `SubscribeToRoom` 계약의 Mock 구현. `index.ts`가 이 값을 `subscribeToRoom`으로 노출한다. */
export const subscribeToRoomViaMock: SubscribeToRoom = (roomId, onEvent, onError) => {
  const room = getOrCreateRoom(roomId);
  room.handlers.add(onEvent);
  if (onError) room.errorHandlers.add(onError);

  const unsubscribe: Unsubscribe = () => {
    room.handlers.delete(onEvent);
    if (onError) room.errorHandlers.delete(onError);
    // 구독자가 하나도 안 남으면 방 자체를 비워 메모리를 돌려준다 — 오래 떠
    // 있는 SPA 세션에서 여러 방을 들락거릴 때 Map이 무한히 커지지 않게 한다.
    if (room.handlers.size === 0 && room.errorHandlers.size === 0) {
      rooms.delete(roomId);
    }
  };
  return unsubscribe;
};

/**
 * 실제 백엔드 없이 "이 방에 이런 이벤트가 일어났다"를 시뮬레이션하는 훅.
 * Mock Server Action(D-030 부수 결정 — "쓰기 후 갱신"을 흉내 낼 때)이나
 * `/sample` 상태 토글이 쓴다. 구독자가 없는 방에 발행하면 조용히 무시한다
 * (아직 아무도 열어 보지 않은 화면에 이벤트를 보내는 것은 에러가 아니다).
 */
export function publishMockEvent(roomId: string, event: RealtimeEvent): void {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const handler of room.handlers) handler(event);
}

/** `publishMockEvent`의 에러 버전 — D-030 ③ 도메인 오류(RLS 403·정원 마감 등) 시뮬레이션용. */
export function publishMockError(
  roomId: string,
  error: Omit<RealtimeConnectionError, "roomId">,
): void {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const handler of room.errorHandlers) handler({ roomId, ...error });
}

/**
 * 타이머 기반 합성 이벤트 발생기(ROADMAP 원문의 "Mock 이벤트 소스 — 타이머
 * 기반"). `intervalMs`마다 `createEvent()`를 호출해 그 결과를 해당 방
 * 구독자에게 흘려보낸다. 반환값이 `Unsubscribe`라 `subscribeToRoom`이 반환한
 * 것과 같은 방식으로 정리(clearInterval 노출 없이)할 수 있다.
 *
 * `createEvent`를 인자로 받고 이 모듈이 이벤트 내용을 만들지 않는 이유:
 * 실제 도메인 페이로드(채팅 메시지·투표 집계·알림)는 Mock 시드 데이터
 * (Task 010)가 갖고 있고, 이 파일은 "언제 흘려보낼지"만 책임진다 — 전송
 * 계층과 도메인 데이터 생성을 분리해 두면 Task 010이 나중에 실제 페이로드를
 * 채워도 이 함수는 바뀌지 않는다.
 */
export function startMockEventTimer(
  roomId: string,
  createEvent: () => RealtimeEvent,
  intervalMs: number,
): Unsubscribe {
  const timer = setInterval(() => {
    publishMockEvent(roomId, createEvent());
  }, intervalMs);

  return () => clearInterval(timer);
}

/**
 * 전역 Mock 상태 초기화. 테스트 러너 미도입(R-002) 상태라 지금은 `/sample`
 * 수동 확인이나 향후 테스트 도입 시 `beforeEach`에서 쓸 용도로만 존재한다.
 */
export function resetMockRealtimeState(): void {
  rooms.clear();
}
