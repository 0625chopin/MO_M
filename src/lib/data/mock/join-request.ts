import type { Id, JoinRequest, JoinRequestStatus } from "@/lib/types";

import { type DataResult, err, ok } from "../contracts";

import { generateId, store } from "./fixtures";

/** JoinRequest 데이터 접근 (FR-022 가입 신청·FR-023 승인·반려). */

export interface CreateJoinRequestInput {
  crewId: Id;
  requesterId: Id;
  message?: string | null;
}

/** 같은 크루에 대기 중인 신청이 이미 있으면 conflict — 중복 신청 방지. */
export async function createJoinRequest(
  input: CreateJoinRequestInput,
): Promise<DataResult<JoinRequest>> {
  const duplicate = store.joinRequests.some(
    (r) => r.crewId === input.crewId && r.requesterId === input.requesterId && r.status === "pending",
  );
  if (duplicate) {
    return err("conflict", `crew ${input.crewId} 에 이미 대기 중인 가입 신청이 있다.`);
  }
  const joinRequest: JoinRequest = {
    id: generateId("join-request"),
    crewId: input.crewId,
    requesterId: input.requesterId,
    message: input.message ?? null,
    status: "pending",
    decidedBy: null,
  };
  store.joinRequests.push(joinRequest);
  return ok(joinRequest);
}

export async function listJoinRequestsForCrew(
  crewId: Id,
  status?: JoinRequestStatus,
): Promise<JoinRequest[]> {
  return store.joinRequests.filter((r) => r.crewId === crewId && (!status || r.status === status));
}

/** 가입 신청 승인·반려(FR-023). 이미 처리된 신청은 conflict. */
export async function decideJoinRequest(
  id: Id,
  decision: Extract<JoinRequestStatus, "approved" | "rejected">,
  decidedBy: Id,
): Promise<DataResult<JoinRequest>> {
  const joinRequest = store.joinRequests.find((r) => r.id === id);
  if (!joinRequest) return err("not_found", `join request ${id} 를 찾을 수 없다.`);
  if (joinRequest.status !== "pending") {
    return err("conflict", `join request ${id} 는 이미 ${joinRequest.status} 상태다.`);
  }
  joinRequest.status = decision;
  joinRequest.decidedBy = decidedBy;
  return ok(joinRequest);
}
