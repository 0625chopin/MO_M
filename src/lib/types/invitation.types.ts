import type { Id, ISODateTimeString } from "./common.types";

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface Invitation {
  id: Id;
  crewId: Id;
  inviteeId: Id;
  inviterId: Id;
  status: InvitationStatus;
  /** 발급 후 14일 만료(요구사항 2.2절 용어집). */
  expiresAt: ISODateTimeString;
}
