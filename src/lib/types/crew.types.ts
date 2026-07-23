import type { Id, ISODateTimeString } from "./common.types";

/** D-007 — public이면 비로그인 방문자도 검색·소개 열람 가능, private이면 크루원 전용. */
export type CrewVisibility = "public" | "private";

export type CrewStatus = "active" | "archived";

export interface Crew {
  id: Id;
  name: string;
  description: string;
  category: string;
  visibility: CrewVisibility;
  /**
   * 캘린더 팔레트 인덱스(0-11). `src/lib/crew-palette.ts`의 `CREW_PALETTE`
   * 인덱스와 대응한다(D-006·D-026). 배정 함수(`hash(crewId) mod 12`)는
   * `lib/rules/`의 순수 함수 몫이며, 이 필드는 그 결과값을 담는 자리다.
   */
  colorKey: number;
  ownerId: Id;
  status: CrewStatus;
}

/** CrewMembership.role. 3.1절 전역 역할(`UserRole`, permission.types.ts)과는 별개 — 크루별로 부여된다. */
export type CrewMembershipRole = "owner" | "staff" | "member";

/** 2.4절 "Crew 멤버십 상태" 다이어그램과 1:1 대응. */
export type CrewMembershipStatus =
  | "invited"
  | "requested"
  | "active"
  | "declined"
  | "rejected"
  | "left"
  | "removed";

export interface CrewMembership {
  crewId: Id;
  profileId: Id;
  role: CrewMembershipRole;
  status: CrewMembershipStatus;
  joinedAt: ISODateTimeString;
  /** 강퇴 사유. status가 'removed'가 아니면 null. */
  removedReason: string | null;
}
