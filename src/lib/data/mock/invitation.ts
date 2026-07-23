import type { Id, Invitation, InvitationStatus } from "@/lib/types";

import { type DataResult, err, ok } from "../contracts";

import { generateId, store } from "./fixtures";

/** Invitation 데이터 접근 (FR-020 초대 발급·FR-021 수락·거절). */

export interface CreateInvitationInput {
  crewId: Id;
  inviteeId: Id;
  inviterId: Id;
  /** ISO 8601. 호출자가 "발급 후 14일"(요구사항 2.2절 용어집) 계산 결과를 넘긴다. */
  expiresAt: string;
}

export async function createInvitation(input: CreateInvitationInput): Promise<Invitation> {
  const invitation: Invitation = {
    id: generateId("invitation"),
    crewId: input.crewId,
    inviteeId: input.inviteeId,
    inviterId: input.inviterId,
    status: "pending",
    expiresAt: input.expiresAt,
  };
  store.invitations.push(invitation);
  return invitation;
}

export async function listInvitationsForProfile(
  inviteeId: Id,
  status?: InvitationStatus,
): Promise<Invitation[]> {
  return store.invitations.filter(
    (i) => i.inviteeId === inviteeId && (!status || i.status === status),
  );
}

export async function listInvitationsForCrew(
  crewId: Id,
  status?: InvitationStatus,
): Promise<Invitation[]> {
  return store.invitations.filter((i) => i.crewId === crewId && (!status || i.status === status));
}

/** 초대 수락·거절(FR-021). 이미 응답했거나 만료된 초대에는 conflict를 반환한다. */
export async function respondToInvitation(
  id: Id,
  response: Extract<InvitationStatus, "accepted" | "declined">,
): Promise<DataResult<Invitation>> {
  const invitation = store.invitations.find((i) => i.id === id);
  if (!invitation) return err("not_found", `invitation ${id} 를 찾을 수 없다.`);
  if (invitation.status !== "pending") {
    return err("conflict", `invitation ${id} 는 이미 ${invitation.status} 상태다.`);
  }
  invitation.status = response;
  return ok(invitation);
}
