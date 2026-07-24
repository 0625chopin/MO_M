"use server";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { getCrewMembership, listMeetupsByCrews } from "@/lib/data";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { checkPermission } from "@/lib/rules/permission";
import type { Id } from "@/lib/types";

export interface CheckDuplicateMeetupDateInput {
  crewId: Id;
  /** ISODateString(YYYY-MM-DD). */
  date: string;
}

/**
 * FR-034 E4 "동일 날짜 제안이 이미 가결됨 → 경고 후 진행 허용"의 **비차단** 사전 확인
 * (Task 018B). `PostWriteForm`이 모임 예정일 필드를 벗어날 때 호출해 안내 배너를 켠다.
 *
 * "경고 후 진행 허용"은 등록을 막지 않는다는 뜻이라 `createPostAction`은 이 검사를
 * 반복하지 않는다 — 여기서 실패(guest·비크루원 등)해도 `duplicate: false`로 조용히
 * 안내를 생략할 뿐, 등록 자체를 막는 판정이 아니므로 fail-closed가 아니라 fail-quiet로
 * 충분하다(정보 노출 범위도 "그 날짜에 이미 확정된 모임이 있다/없다"뿐이라 낮다).
 */
export async function checkDuplicateMeetupDateAction(
  input: CheckDuplicateMeetupDateInput,
): Promise<{ duplicate: boolean }> {
  if (!input.date) return { duplicate: false };

  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return { duplicate: false };
  }

  const membership = await getCrewMembership(input.crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(membership);
  if (!checkPermission({ role, action: "board:read" }).allowed) {
    return { duplicate: false };
  }

  const meetups = await listMeetupsByCrews({
    crewIds: [input.crewId],
    from: input.date,
    to: input.date,
  });
  return { duplicate: meetups.length > 0 };
}
