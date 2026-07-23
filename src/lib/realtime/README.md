# `src/lib/realtime/`

구독 인터페이스 (D-030 ②). `CLAUDE.md`의 전환 경계 4가지 중 두 번째 — Realtime 구독은
클라이언트 컴포넌트 + 구독 생명주기 + 로컬 상태 병합을 요구해서, 표현 컴포넌트로만 만들면
전환 시 `'use client'` 전환과 상태 소유권 이동이 필요해진다. 그래서 처음부터 인터페이스로 감싼다.

- **담당**: CORE(보조 담당 "채팅·실시간" 겸임, `docs/team/01.CORE.md`).
- **제안 형태**: `subscribeToRoom(id, onEvent): Unsubscribe`.
- **`index.ts`**: 배럴. 소비자(컨테이너 컴포넌트)는 항상 `@/lib/realtime`을 import한다.
- **`mock.ts`**(제안, 아직 없음): Mock 단계 — 타이머 기반.
- **`broadcast.ts`**(제안, 아직 없음): 실데이터 단계 — Supabase Realtime **Broadcast**(D-023,
  Postgres Changes 아님 — 팬아웃 확장성 근거는 R-011 참고). `@supabase/supabase-js`를 직접
  import할 수 있는 몇 안 되는 위치 중 하나다(`src/lib/data/supabase/`와 함께).
- 파일명이 `mock.ts`/`broadcast.ts`와 달라지면 `eslint.config.mjs`의 `noDeepRealtimeImpl`
  패턴과 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md)를 함께 갱신해야 한다.

실제 채우는 시점은 CORE의 Task 020A~020C(채팅, 9~13주차)다. 이 Task 001에서는 디렉터리와
규약만 만들었다.
