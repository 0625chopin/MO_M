# `src/lib/realtime/`

구독 인터페이스 (D-030 ②). `CLAUDE.md`의 전환 경계 4가지 중 두 번째 — Realtime 구독은
클라이언트 컴포넌트 + 구독 생명주기 + 로컬 상태 병합을 요구해서, 표현 컴포넌트로만 만들면
전환 시 `'use client'` 전환과 상태 소유권 이동이 필요해진다. 그래서 처음부터 인터페이스로 감싼다.

- **담당**: CREW(보조 담당 "채팅·실시간" 겸임, `docs/team/03.CREW.md`). **정정(3일차, Task 008)**:
  이 문서는 1일차 스캐폴드 당시 담당을 "CORE"로 적고 있었으나, 할당 SSOT인
  `docs/ROADMAP/team/03.CREW.md`에서 Task 008(`실시간 구독 인터페이스 추상화와 Mock 이벤트
  소스`)은 CREW 소관이다. 아래 세 파일을 이번 회차에 실제로 채운 것도 CREW다.
- **형태**: `subscribeToRoom(roomId, onEvent, onError?): Unsubscribe`. 제안 형태
  `subscribeToRoom(id, onEvent): Unsubscribe`(README·ROADMAP 원문)를 그대로 채택하되, 선택적
  3번째 인자 `onError`를 덧붙였다 — 인자 2개만 넘겨도 그대로 성립하는 상위 호환 확장이라
  계약 이탈이 아니다. 분리한 이유는 D-030 ③(도메인 오류를 `/sample` 4상태의 "오류"에
  포함) — "이 방에 이벤트가 없다"와 "구독 자체가 실패했다"(네트워크 단절·RLS 403 등)를
  컨테이너가 `onEvent` 한 콜백 안에서 구분해야 하는 부담을 없앤다. 자세한 근거는 아래
  "도메인 오류 상태" 절.
- **`index.ts`**: 배럴. 소비자(컨테이너 컴포넌트)는 항상 `@/lib/realtime`을 import한다. 지금은
  Mock만 조립한다 — `broadcast.ts`는 자리만 있고 아직 배럴이 선택하지 않는다(Supabase 미연결,
  Phase 4).
- **`mock.ts`**: Mock 단계 — 방(room)별 구독자 관리 + 타이머 기반 이벤트 소스.
  `subscribeToRoomViaMock`이 구독·해제(멱등)를 담당하고, 실제 프로듀서는 아직 없으므로(Mock
  시드는 Task 010) 호출자가 임의 이벤트·에러를 주입할 수 있는 테스트 훅
  `publishMockEvent`·`publishMockError`, 그리고 `intervalMs`마다 자동 발행하는
  `startMockEventTimer`(clearInterval을 감싼 `Unsubscribe` 반환)를 함께 둔다.
  `resetMockRealtimeState`는 전역 Mock 상태 초기화용(테스트 러너 도입 전 수동 확인용). 이
  네 함수는 배럴(`index.ts`)에서도 그대로 재노출된다 — 실제 export명이며 `emit` 같은
  함수는 없다.
- **`broadcast.ts`**: 실데이터 단계 자리 — Supabase Realtime **Broadcast**(D-023, Postgres
  Changes 아님 — 팬아웃 확장성 근거는 R-011 참고). `@supabase/supabase-js`를 직접 import할 수
  있는 몇 안 되는 위치 중 하나다(`src/lib/data/supabase/`와 함께). **이번 회차에는 함수
  시그니처만 채우고 실제 연결은 하지 않았다** — `subscribeToRoomViaBroadcast`를 호출하면
  throw가 아니라 `onError` 콜백으로 "Broadcast 미연결(Phase 4 대기)"를 전달하고 no-op
  `Unsubscribe`를 반환한다. 조용히 아무 일도 안 하는 대신 실수로 이 모듈이 조립돼도 바로
  드러나게 하려는 의도적 설계다(위 "형태" 절의 `onError` 분리와 같은 이유). 실제 Broadcast
  연결은 Supabase 프로젝트 연결 이후(Phase 4)다.
- 파일명이 `mock.ts`/`broadcast.ts`와 달라지면 `eslint.config.mjs`의 `noDeepRealtimeImpl`
  패턴과 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md)를 함께 갱신해야 한다(이번 회차는
  README의 제안 파일명을 그대로 썼으므로 갱신 불필요).

## 도메인 오류 상태 (D-030 ③)

`/sample` 4상태의 "오류"는 네트워크 실패뿐 아니라 도메인 오류(RLS 403·정원 마감·동시 수정
충돌)를 포함해야 한다. 구독 인터페이스 자체는 전송 계층이라 도메인 판정을 하지 않지만,
`RealtimeConnectionError`로 "구독이 실패했다"는 사실만은 `onEvent`가 아니라 별도 에러 콜백으로
구분해 전달한다 — 그래야 컨테이너가 "메시지 없음"과 "구독 실패"를 헷갈리지 않는다.
