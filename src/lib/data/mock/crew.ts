import type {
  Crew,
  CrewMembership,
  CrewMembershipRole,
  CrewVisibility,
  Id,
} from "@/lib/types";

import { type DataResult, err, ok } from "../contracts";

import { generateId, store } from "./fixtures";

/**
 * Crew·CrewMembership 데이터 접근 (FR-010~012·014·020(초대 발급은 invitation.ts)·
 * 022~024·026·028).
 *
 * `colorKey`(캘린더 팔레트 인덱스)는 `hash(crewId) mod 12` 판정 결과다 — 그 판정 함수는
 * `lib/rules`(CREW 담당) 몫이므로, 이 레이어는 이미 계산된 값을 받아 저장만 한다.
 * 마찬가지로 크루원 강퇴·임명 같은 조작의 **허용 여부**는 `lib/rules`의 권한 판정이
 * 먼저 걸러낸다 — 이 레이어에 도달했다는 것 자체가 이미 그 판정을 통과했다는 전제다.
 */

export interface ListCrewsQuery {
  visibility?: CrewVisibility;
  /** 이름·설명 부분 일치(FR-014 크루 검색·탐색). */
  query?: string;
}

export async function listCrews(opts: ListCrewsQuery = {}): Promise<Crew[]> {
  const needle = opts.query?.trim().toLowerCase();
  return store.crews.filter((c) => {
    if (c.status !== "active") return false;
    if (opts.visibility && c.visibility !== opts.visibility) return false;
    if (needle && !c.name.toLowerCase().includes(needle) && !c.description.toLowerCase().includes(needle)) {
      return false;
    }
    return true;
  });
}

export async function getCrewById(id: Id): Promise<Crew | null> {
  return store.crews.find((c) => c.id === id) ?? null;
}

export interface CreateCrewInput {
  name: string;
  description: string;
  category: string;
  visibility: CrewVisibility;
  ownerId: Id;
  /** `lib/rules`의 색 배정 함수가 계산한 값(D-006). */
  colorKey: number;
}

/** 크루 개설(FR-010). 오너 본인의 owner 멤버십도 함께 생성한다. */
export async function createCrew(input: CreateCrewInput): Promise<Crew> {
  const crew: Crew = {
    id: generateId("crew"),
    name: input.name,
    description: input.description,
    category: input.category,
    visibility: input.visibility,
    colorKey: input.colorKey,
    ownerId: input.ownerId,
    status: "active",
  };
  store.crews.push(crew);
  store.crewMemberships.push({
    crewId: crew.id,
    profileId: input.ownerId,
    role: "owner",
    status: "active",
    joinedAt: new Date().toISOString(),
    removedReason: null,
  });
  return crew;
}

export type UpdateCrewInfoInput = Partial<Pick<Crew, "name" | "description" | "category">>;

/** 크루 정보 수정(FR-011). */
export async function updateCrewInfo(
  id: Id,
  patch: UpdateCrewInfoInput,
): Promise<DataResult<Crew>> {
  const crew = store.crews.find((c) => c.id === id);
  if (!crew) return err("not_found", `crew ${id} 를 찾을 수 없다.`);
  Object.assign(crew, patch);
  return ok(crew);
}

/** 크루 공개 범위 변경(FR-012, D-007). */
export async function updateCrewVisibility(
  id: Id,
  visibility: CrewVisibility,
): Promise<DataResult<Crew>> {
  const crew = store.crews.find((c) => c.id === id);
  if (!crew) return err("not_found", `crew ${id} 를 찾을 수 없다.`);
  crew.visibility = visibility;
  return ok(crew);
}

export async function listCrewMembers(crewId: Id): Promise<CrewMembership[]> {
  return store.crewMemberships.filter((m) => m.crewId === crewId);
}

export async function getCrewMembership(
  crewId: Id,
  profileId: Id,
): Promise<CrewMembership | null> {
  return (
    store.crewMemberships.find((m) => m.crewId === crewId && m.profileId === profileId) ?? null
  );
}

/** 임원 임명·해임(FR-024) — role만 바꾼다. owner 승격/강등은 오너 이양(FR-025, v0.2) 몫이라 다루지 않는다. */
export async function setCrewMembershipRole(
  crewId: Id,
  profileId: Id,
  role: Extract<CrewMembershipRole, "staff" | "member">,
): Promise<DataResult<CrewMembership>> {
  const membership = store.crewMemberships.find(
    (m) => m.crewId === crewId && m.profileId === profileId,
  );
  if (!membership) return err("not_found", `crew ${crewId} 의 멤버십(${profileId})을 찾을 수 없다.`);
  membership.role = role;
  return ok(membership);
}

/**
 * 크루 탈퇴(FR-026)·강퇴(FR-027, v0.2)를 함께 받는다 — 둘 다 "active → left/removed"라는
 * 같은 상태 전이(`CrewMembershipStatus`)이고, 새 필드도 필요 없어 함수를 나누지 않았다.
 */
export async function updateCrewMembershipStatus(
  crewId: Id,
  profileId: Id,
  status: Extract<CrewMembership["status"], "left" | "removed">,
  removedReason: string | null = null,
): Promise<DataResult<CrewMembership>> {
  const membership = store.crewMemberships.find(
    (m) => m.crewId === crewId && m.profileId === profileId,
  );
  if (!membership) return err("not_found", `crew ${crewId} 의 멤버십(${profileId})을 찾을 수 없다.`);
  membership.status = status;
  membership.removedReason = status === "removed" ? removedReason : null;
  return ok(membership);
}
