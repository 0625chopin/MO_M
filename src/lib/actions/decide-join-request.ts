"use server";

import { refresh } from "next/cache";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { approveCrewMembership, decideJoinRequest, getCrewMembership, rejectCrewMembership } from "@/lib/data";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { checkPermission } from "@/lib/rules/permission";
import { strings } from "@/lib/strings";
import type { JoinRequestStatus } from "@/lib/types";

/**
 * FR-023 가입 신청 승인·반려 Server Action(Task 017A). `JoinRequestPanel`의 "대기 중" 탭이
 * 승인·반려 각 버튼마다 `useActionState(decideJoinRequestAction, ...)`로 건다.
 *
 * **`joinRequestId`만으로 대상을 찾고 `crewId`는 소속 검증에만 쓴다** — 클라이언트가 폼에
 * 실어 보낸 `crewId`가 실제 그 신청의 크루와 다르면(다른 크루 관리 화면에서 조작된 요청)
 * `decided.data.crewId !== crewId` 검사로 걸러낸다.
 *
 * **동시성(FR-023 E1 "다른 임원이 먼저 처리")은 `decideJoinRequest`의 `status !== "pending"`
 * 검사가 1차 방어, `approveCrewMembership`/`rejectCrewMembership`의 상태 전이 검증이 2차
 * 방어다** — 둘 다 `conflict`를 반환하면 그대로 화면 오류로 보여준다(D-030 ③).
 */
export interface DecideJoinRequestFormState {
  success?: boolean;
  formError?: string;
}

// 초기 상태 상수는 여기 두지 않는다 — `'use server'` 파일은 async 함수만 export할 수 있다
// (signup.ts 모듈 docstring 참고). 호출부(`JoinRequestPanel`)가 타입만 가져다 직접 만든다.

const DECISION_VALUES: readonly JoinRequestStatus[] = ["approved", "rejected"];

function isDecision(value: string): value is Extract<JoinRequestStatus, "approved" | "rejected"> {
  return (DECISION_VALUES as readonly string[]).includes(value);
}

export async function decideJoinRequestAction(
  _prevState: DecideJoinRequestFormState,
  formData: FormData,
): Promise<DecideJoinRequestFormState> {
  const crewId = String(formData.get("crewId") ?? "");
  const joinRequestId = String(formData.get("joinRequestId") ?? "");
  const decisionRaw = String(formData.get("decision") ?? "");

  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return { formError: strings.crew.members.requests.errors.sessionExpired };
  }
  if (!isDecision(decisionRaw)) {
    return { formError: strings.crew.members.requests.errors.decideFailed };
  }

  const viewerMembership = await getCrewMembership(crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(viewerMembership);
  const permission = checkPermission({ role, action: "crew:approve_join_request" });
  if (!permission.allowed) {
    return { formError: strings.crew.members.requests.errors.notAllowed };
  }

  const decided = await decideJoinRequest(joinRequestId, decisionRaw, session.profileId);
  if (!decided.ok || decided.data.crewId !== crewId) {
    return { formError: strings.crew.members.requests.errors.alreadyDecided };
  }

  const membershipResult =
    decisionRaw === "approved"
      ? await approveCrewMembership(crewId, decided.data.requesterId)
      : await rejectCrewMembership(crewId, decided.data.requesterId);
  if (!membershipResult.ok) {
    return { formError: strings.crew.members.requests.errors.decideFailed };
  }

  refresh();
  return { success: true };
}
