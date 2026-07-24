/**
 * Mock 이벤트 소스 — Task 008 (D-030 ②, CON-12). 타이머 기반: 실제 백엔드
 * 없이 방(room) 단위로 구독자를 관리하고, 필요하면 주기적으로 합성 이벤트를
 * 흘려보낸다.
 *
 * 이 모듈은 순수 함수 계층(`lib/rules/`)이 아니다 — 구독 생명주기(Map, 타이머)
 * 라는 부작용을 의도적으로 감싸는 것이 이 파일의 존재 이유다(D-030 ②). 그래도
 * React·Next는 import하지 않는다 — 컨테이너 컴포넌트가 `useEffect` 안에서
 * `subscribeToRoom`을 호출하고 정리하는 책임을 진다.
 *
 * **반드시 브라우저(클라이언트 번들)에서만 호출한다 — `"use server"` 파일 안에서
 * `publishMockEvent`/`publishMockError`를 부르지 않는다(7일차 I-042, 실제로 발생한
 * 버그).** 아래 `rooms` Map은 모듈 스코프 싱글턴이지만, Next.js는 서버 번들과
 * 클라이언트 번들을 **따로** 만든다 — 즉 이 파일이 서버 코드(Server Action·서버
 * 컴포넌트)에서 import되면 그 실행 컨텍스트에서 자기만의 `rooms` Map을 새로 만들고,
 * `subscribeToRoom`이 등록한 브라우저 쪽 `rooms`와는 **완전히 별개 인스턴스**가 된다.
 * `"use server"` 액션 안에서 발행하면 구독자 0명인 서버 쪽 유령 Map에 들어가 아래
 * `publishMockEvent`의 `if (!room) return;`에서 조용히 사라진다 — `tsc`·`lint` 둘 다
 * 통과하는 런타임 전용 결함이라 실제로 "본인이 보낸 메시지가 안 보이는" 형태로만
 * 드러난다(FR-051 AC1 완전 실패, I-042 사고 경위 참고).
 *
 * **올바른 패턴**: Server Action은 결과(저장된 엔티티)만 반환한다. 그 결과를 받은
 * **클라이언트 컴포넌트/컨테이너**가 브라우저 쪽에서 `publishMockEvent`를 호출한다 —
 * 자기 자신의 `subscribeToRoom` 구독이 그 이벤트를 되받아 로컬 상태에 반영한다(다른
 * 사용자가 보낸 이벤트를 받는 경로와 동일한 코드 경로). `src/components/chat/
 * MessageRoomContainer.tsx`(Task 020A)가 이 패턴의 실제 예시다.
 *
 * **구조적 한계 — 이건 버그가 아니다**: 이 Mock 구현에는 전송 계층 자체가 없다.
 * `rooms` Map은 "한 브라우저 탭의 메모리" 안에만 있으므로, **다른 탭·다른 브라우저·
 * 다른 사용자에게는 이벤트가 원천적으로 전달되지 않는다** — 같은 탭 안에서 발행자
 * 자신의 구독만 되받는다. 탭 간·사용자 간 실시간 전달을 Mock으로 흉내 내려 하지
 * 말 것(예: `BroadcastChannel`·`localStorage` 이벤트로 탭을 잇는 코드를 추가하지
 * 않는다) — 그런 코드는 실데이터 전환 시 걷어내야 할 임시 계층이 되고, D-030 ②가
 * 지키려는 "구독 인터페이스만 바꿔 끼운다"는 성질을 해친다. 실제 다중 사용자·다중
 * 탭 전달은 Task 033(Supabase Realtime Broadcast, D-023)이 `broadcast.ts`를 배럴에
 * 연결하면 그대로 성립한다 — 그때도 이 파일을 쓰는 컨테이너 쪽 코드는 바뀌지 않는다.
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

/**
 * 브라우저 탭 하나의 전역 상태 — 같은 탭 안에서 여러 컨테이너가 같은 방을 구독하면
 * 공유된다. **서버(Server Action·서버 컴포넌트)에서 이 모듈이 평가되면 별도의 빈
 * `rooms` 인스턴스가 그쪽 실행 컨텍스트에 생긴다** — 파일 상단 모듈 docstring의
 * 경고를 반드시 읽을 것(I-042).
 */
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
 * **반드시 브라우저 쪽(클라이언트 컴포넌트·컨테이너)에서 호출한다** — Server
 * Action(`"use server"`) 안에서 직접 부르지 않는다. 이유는 파일 상단 모듈
 * docstring 참고(I-042: 서버·클라이언트 번들의 `rooms` Map이 분리돼 있어, 서버에서
 * 호출하면 구독자 0명인 별개 Map에 발행되고 아래 `if (!room) return;`에서 조용히
 * 사라진다). Server Action은 결과만 반환하고, 그 결과를 받은 클라이언트 컴포넌트가
 * `useEffect`나 이벤트 핸들러 안에서 이 함수를 호출하는 것이 올바른 패턴이다.
 * 구독자가 없는 방에 발행하면 조용히 무시한다(아직 아무도 열어 보지 않은 화면에
 * 이벤트를 보내는 것은 에러가 아니다 — 이건 위 서버/클라이언트 분리 문제와는 별개의,
 * 정상적인 "아직 구독자가 없음" 케이스다).
 */
export function publishMockEvent(roomId: string, event: RealtimeEvent): void {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const handler of room.handlers) handler(event);
}

/**
 * `publishMockEvent`의 에러 버전 — D-030 ③ 도메인 오류(RLS 403·정원 마감 등) 시뮬레이션용.
 * 같은 `rooms` Map을 쓰므로 호출 위치 제약도 동일하다 — `publishMockEvent`의
 * docstring·I-042 참고, Server Action 안에서 부르지 않는다.
 */
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
