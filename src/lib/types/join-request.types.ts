import type { Id } from "./common.types";

export type JoinRequestStatus = "pending" | "approved" | "rejected";

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
