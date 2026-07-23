/**
 * 유일한 진입점(배럴) — Task 008 (D-030 ②). 소비자(컨테이너 컴포넌트)는 항상
 * `@/lib/realtime`만 import한다. `./mock`·`./broadcast`의 직접(딥) import는
 * `eslint.config.mjs`의 `noDeepRealtimeImpl`(zone 5·6)이 차단한다.
 *
 * v0.1은 Mock First라 지금은 **항상 Mock을 조립**한다. Supabase 프로젝트
 * 연결(Phase 4) 이후 이 파일에서 `subscribeToRoomViaBroadcast`로 바꿔 끼운다
 * — 그 시점에도 소비자 쪽 import·호출 형태(`subscribeToRoom(roomId, onEvent)`)
 * 는 그대로다(D-030 ②가 지키려는 바로 그 성질).
 */

import { subscribeToRoomViaMock } from "./mock";

import type { SubscribeToRoom } from "./types";

export const subscribeToRoom: SubscribeToRoom = subscribeToRoomViaMock;

// Mock 전용 테스트/데모 훅 — `/sample` 토글이나 Mock Server Action이 "이 방에
// 이런 일이 일어났다"를 시뮬레이션할 때 쓴다. 배럴을 통해서만 노출한다(D-030
// ②) — 소비자가 `@/lib/realtime/mock`을 직접 import하는 길은 없다.
// **알려진 이월 사항**: 실데이터(Broadcast)로 전환하면 이 세 함수는 더 이상
// 실제 구독에 영향을 주지 않는다(발행할 Mock 상태 자체가 없어지므로). 그
// 시점에 `/sample` 데모 코드가 이 함수들을 계속 참조하고 있다면 함께
// 정리해야 한다 — 지금은 Mock First 단계라 미루어 둔다.
export {
  publishMockError,
  publishMockEvent,
  resetMockRealtimeState,
  startMockEventTimer,
} from "./mock";

export type {
  RealtimeConnectionError,
  RealtimeErrorHandler,
  RealtimeEvent,
  RealtimeEventHandler,
  SubscribeToRoom,
  Unsubscribe,
} from "./types";
