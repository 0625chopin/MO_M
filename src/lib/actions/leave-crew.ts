"use server";

import { redirect } from "next/navigation";

import { getCrewHomeHref } from "@/components/crews/crew-links";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { getCrewMembership, updateCrewMembershipStatus } from "@/lib/data";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { checkPermission } from "@/lib/rules/permission";
import { strings } from "@/lib/strings";

/**
 * FR-026 크루 탈퇴 Server Action(Task 017A). `MemberList`의 본인 행 "탈퇴" 버튼이
 * `useActionState(leaveCrewAction, ...)`로 건다.
 *
 * **오너는 `hasOwnerSuccessorOrDisband: false`로 항상 조건부 거부된다** — 오너 이양(FR-025)·
 * 크루 해산(FR-013)이 아직 구현되지 않아(둘 다 v0.2·후속 Task 대상) 그 전제조건을 만족시킬
 * 방법 자체가 없다. `MemberList`가 오너 행에는 애초에 비활성 버튼 + 안내 문구만 보여주므로
 * (D-030 ①, 클라이언트는 이 판정을 미리 흉내만 낸다) 이 액션까지 도달하는 정상 경로는 없지만,
 * Server Action은 페이지를 거치지 않고 직접 호출될 수 있어(`search-user-by-handle.ts`와 같은
 * 경고) 서버에서도 같은 판정을 반드시 다시 한다.
 *
 * 탈퇴에 성공하면 크루원 게이트(`(app)/crews/[crewId]/layout.tsx`)가 더 이상 이 사용자를
 * 통과시키지 않으므로, 같은 페이지에 머무르지 않고 크루 홈(`(app)` 밖, D-007)으로 리다이렉트한다
 * — `createCrewAction`과 같은 이유로 `refresh()` 대신 `redirect()`를 쓴다(이동한 페이지가
 * 어차피 새로 조회한다).
 */
export interface LeaveCrewFormState {
  formError?: string;
}

// 초기 상태 상수는 여기 두지 않는다 — `'use server'` 파일은 async 함수만 export할 수 있다
// (signup.ts 모듈 docstring 참고). 호출부(`MemberList`)가 타입만 가져다 직접 만든다.

export async function leaveCrewAction(
  _prevState: LeaveCrewFormState,
  formData: FormData,
): Promise<LeaveCrewFormState> {
  const crewId = String(formData.get("crewId") ?? "");

  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return { formError: strings.crew.members.leave.errors.sessionExpired };
  }

  const membership = await getCrewMembership(crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(membership);
  const permission = checkPermission({
    role,
    action: "crew:leave",
    context: { hasOwnerSuccessorOrDisband: false },
  });
  if (!permission.allowed) {
    return {
      formError:
        permission.reason === "owner_requires_successor_or_disband"
          ? strings.crew.members.leave.errors.ownerMustTransferOrDisband
          : strings.crew.members.leave.errors.notAllowed,
    };
  }

  const result = await updateCrewMembershipStatus(crewId, session.profileId, "left");
  if (!result.ok) {
    return { formError: strings.crew.members.leave.errors.failed };
  }

  redirect(getCrewHomeHref(crewId));
}
