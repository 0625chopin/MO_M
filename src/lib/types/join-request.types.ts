import type { Id } from "./common.types";

/**
 * `withdrawn`은 Task 016B(FR-022 E4 "신청자가 대기 중 철회 가능")에서 추가했다 — 2.4절
 * 멤버십 상태 다이어그램에는 신청자 자신의 철회 전이가 없어(오너/임원의 승인·반려만 정의됨),
 * 이 값이 없으면 철회와 반려를 구분할 방법이 없었다. `docs/ISSUES.md` I-039 참고.
 */
export type JoinRequestStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface JoinRequest {
  id: Id;
  crewId: Id;
  requesterId: Id;
  /** 신청 시 한 줄 인사(선택). */
  message: string | null;
  status: JoinRequestStatus;
  /** 승인/반려 처리자(임원 이상). 대기 상태면 null. */
  decidedBy: Id | null;
}
