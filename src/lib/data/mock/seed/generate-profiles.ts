import type { Profile } from "@/lib/types";

import { BIO_TEMPLATES, GIVEN_NAMES, HANDLE_THEMES, SURNAMES } from "./content-bank";
import { chance, pick, type Rng } from "./prng";

/**
 * Profile 300개 목표(Task 010 스펙) 중 기존 최소 픽스처의 3개(profile-1~3)를 뺀
 * 나머지를 생성한다. `generateId`는 호출자(fixtures.ts)가 넘긴다 — 이 모듈은
 * ID 발급 순서에 관여하지 않고, 호출자가 정한 순서(프로필 → 크루 → …)를 그대로 따른다.
 *
 * 핸들은 `테마단어_순번`(예: run_004)으로 만들어 유일성을 보장한다 — PRNG로 뽑은
 * 단어가 겹쳐도 순번이 겹치지 않으므로 충돌 검사가 필요 없다.
 */
export function generateProfiles(
  rng: Rng,
  count: number,
  generateId: (prefix: string) => string,
  startIndex: number,
): Profile[] {
  const profiles: Profile[] = [];
  for (let i = 0; i < count; i++) {
    const seq = startIndex + i;
    const displayName = `${pick(rng, SURNAMES)}${pick(rng, GIVEN_NAMES)}`;
    const handle = `${pick(rng, HANDLE_THEMES)}_${String(seq).padStart(3, "0")}`;

    // 대부분 active. withdrawn(탈퇴 익명화 대상, D-010)·suspended(제재)는 소수만 —
    // 화면이 아직 없어도 타입/렌더링이 이 두 상태를 다뤄야 한다는 걸 시드가 보여준다.
    const statusRoll = rng();
    const status: Profile["status"] =
      statusRoll < 0.01 ? "withdrawn" : statusRoll < 0.03 ? "suspended" : "active";

    const isWithdrawn = status === "withdrawn";

    profiles.push({
      id: generateId("profile"),
      handle,
      // D-010 익명화 규칙 자체는 Task 039(v0.2) 구현 대상이라 이 시드는 "이미 익명화된
      // 상태"의 최종 모습만 흉내낸다 — 실제 익명화 변환 로직은 여기 없다.
      displayName: isWithdrawn ? "탈퇴한 사용자" : displayName,
      avatarUrl: null,
      bio: isWithdrawn ? null : chance(rng, 0.55) ? pick(rng, BIO_TEMPLATES) : null,
      status,
      searchOptOut: !isWithdrawn && chance(rng, 0.08),
      anonymizedAt: isWithdrawn ? "2026-06-01T00:00:00.000Z" : null,
    });
  }
  return profiles;
}
