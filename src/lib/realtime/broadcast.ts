/**
 * Supabase Realtime Broadcast 구현 자리 — Task 008 (D-023, R-011).
 *
 * D-023이 Postgres Changes가 아니라 Broadcast를 택한 이유(단일 스레드 인가
 * 검사 병목 없음, 25만 동시 사용자/초당 80만 메시지 벤치마크)는
 * `docs/prioritization-and-risks.md` D-023 참고. 구독은 방(room)별이 아니라
 * **사용자당 1연결로 다중화**해야 한다(연결당 채널 100 한도, D-023) — 이는
 * 실제 연결 코드가 생길 때 반드시 지켜야 할 제약이라 여기 남겨 둔다.
 *
 * **아직 실제로 연결하지 않는다.** `@supabase/supabase-js`는 이 시점
 * `package.json`의 dependency가 아니다(Supabase 프로젝트 연결은 Phase 4 —
 * 이 저장소는 아직 Mock First 단계다). 그래서 이 파일은 그 패키지를
 * import하지 않는다 — 미설치 패키지를 import하면 빌드가 깨진다. 실제 구현
 * 시점에 `@supabase/supabase-js`를 추가하고, 이 파일과 `src/lib/data/supabase/`
 * 에서만 그 클라이언트를 import한다(zone 3, `docs/CONVENTIONS.md`).
 *
 * `index.ts` 배럴은 지금 이 모듈을 조립하지 않는다(항상 `mock.ts`를 쓴다) —
 * 그래서 아래 함수가 실제로 호출되는 경로는 없다. 그래도 `SubscribeToRoom`
 * 타입을 만족하는 스텁을 미리 채워 두면, 나중에 배럴에서 이 모듈로 바꿔
 * 끼우기만 하면 되는지(시그니처 호환) 지금 확인할 수 있다.
 */

import type { SubscribeToRoom, Unsubscribe } from "./types";

export const subscribeToRoomViaBroadcast: SubscribeToRoom = (roomId, _onEvent, onError) => {
  onError?.({
    roomId,
    message:
      "Supabase Realtime Broadcast 미연결(Phase 4 대기, D-023) — index.ts가 " +
      "이 구현으로 바뀌기 전까지 이 함수는 호출되지 않아야 한다.",
  });
  const noop: Unsubscribe = () => {};
  return noop;
};
