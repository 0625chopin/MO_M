/**
 * 채팅 실시간 연결 상태 기계 — 순수 함수(NFR-036, R-015, Task 020B).
 *
 * FR-051 E2("연결 끊김 → 재연결 배너 + 자동 재구독")·NFR-009("연결 상태 시각 표시")의 상태
 * 전이 판정. React·Next를 import하지 않는다 — 실제 이벤트 배선(브라우저 online/offline 이벤트,
 * `subscribeToRoom`의 `onError`)은 `MessageRoomContainer`(`components/chat/`)가 담당하고, 이
 * 파일은 "현재 상태 + 무슨 일이 있었나"에서 "다음 상태"만 계산한다 — 크루 멤버십 전이
 * (`crew-membership-transition.ts`)와 같은 성격의 순수 상태 기계다.
 *
 * **Mock 단계의 범위**: NFR-008("재연결 시 누락·중복 없음")의 완전한 보장은 실제 Broadcast
 * 연결(v0.2, Task 033) 몫이다 — `docs/prioritization-and-risks.md` 우선순위표에서 NFR-007·008·
 * 009는 전부 v0.2로 등급이 매겨져 있다. 반면 FR-051 자체(E2 포함)는 v0.1 M이다. 이 파일이
 * 충족하는 것은 "지금 연결 상태가 뭔지 사용자에게 보여주고, 복구되면 이어받는다"는 v0.1의 UI
 * 계약까지다 — 실제 다중 사용자 간 무손실 보장은 이 파일의 책임 밖이다.
 */

export type ChatConnectionStatus = "connected" | "reconnecting" | "disconnected";

export type ChatConnectionEvent =
  /** 브라우저 `offline` 이벤트, 또는 `subscribeToRoom`의 `onError`(D-030 ③ 도메인 오류 포함). */
  | "connection_lost"
  /** 브라우저 `online` 이벤트. */
  | "connection_restored"
  /** 재연결 보충 조회(resync, FR-051 E3)까지 끝나 정상으로 확정됐다. */
  | "resynced";

/**
 * 상태 전이표.
 *
 * | 현재\이벤트 | connection_lost | connection_restored | resynced |
 * | --- | --- | --- | --- |
 * | connected | disconnected | connected(변화 없음) | connected(변화 없음) |
 * | reconnecting | disconnected | reconnecting(변화 없음, 이미 재시도 중) | connected |
 * | disconnected | disconnected(변화 없음) | reconnecting | disconnected(방어적 — 재연결 신호
 * |   |   |   | 없이 resynced만 오는 건 호출자 오류지만 상태를 임의로 진행시키지 않는다) |
 */
export function nextChatConnectionStatus(
  current: ChatConnectionStatus,
  event: ChatConnectionEvent,
): ChatConnectionStatus {
  switch (event) {
    case "connection_lost":
      return "disconnected";
    case "connection_restored":
      return current === "disconnected" ? "reconnecting" : current;
    case "resynced":
      return current === "reconnecting" ? "connected" : current;
    default:
      return current;
  }
}
