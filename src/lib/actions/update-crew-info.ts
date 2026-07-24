"use server";

import { refresh } from "next/cache";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { CREW_PALETTE_SIZE } from "@/lib/crew-palette";
import { getCrewById, getCrewMembership, updateCrewInfo } from "@/lib/data";
import { isValidCrewCategory } from "@/lib/rules/crew-category";
import { validateCrewDescription } from "@/lib/rules/crew-description-validation";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { validateCrewName } from "@/lib/rules/crew-name-validation";
import { checkPermission } from "@/lib/rules/permission";
import { strings } from "@/lib/strings";

/**
 * FR-011 크루 정보 수정 Server Action(SC-15, Task 017B). `CrewInfoForm`이
 * `useActionState(updateCrewInfoAction, ...)`로 건다. 이름·소개·카테고리·캘린더 색상 넷을
 * 함께 받는다 — FR-011이 "크루명, 소개, 카테고리, 대표 이미지, 색상, 규칙을 조회하고 수정한다"고
 * 하나로 묶은 대상이고, 넷 다 같은 권한(`crew:update_info`, 임원 이상)으로 검증된다(공개 범위는
 * 오너 전용이라 `updateCrewVisibilityAction`으로 별도 분리했다 — `account.settings`가 표시
 * 이름·소개와 핸들 변경을 별도 폼·액션으로 나눈 것과 같은 이유, 권한·실패 모드가 다르다).
 *
 * **색상은 팔레트 인덱스(0~11) 유효성만 여기서 확인한다** — 개설 시 자동 배정(D-016, `createCrew`
 * 내부의 `crewColorIndex`)과 달리 이 화면은 사용자가 팔레트에서 직접 골라 수동 재지정하므로
 * 판정이 필요 없다(고를 수 있는 값 자체가 이미 팔레트로 제한된 라디오 그룹이다).
 */
export interface UpdateCrewInfoFieldErrors {
  name?: string;
  description?: string;
  category?: string;
}

export interface UpdateCrewInfoFormState {
  fieldErrors: UpdateCrewInfoFieldErrors;
  formError?: string;
  success?: boolean;
}

// 초기 상태 상수는 여기 두지 않는다 — `'use server'` 파일은 async 함수만 export할 수 있다
// (signup.ts 모듈 docstring 참고). 호출부(`CrewInfoForm`)가 타입만 가져다 직접 만든다.

export async function updateCrewInfoAction(
  _prevState: UpdateCrewInfoFormState,
  formData: FormData,
): Promise<UpdateCrewInfoFormState> {
  const crewId = String(formData.get("crewId") ?? "");

  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return { fieldErrors: {}, formError: strings.crew.settings.info.errors.sessionExpired };
  }

  const crew = await getCrewById(crewId);
  if (!crew) {
    return { fieldErrors: {}, formError: strings.error.notFound.description };
  }

  const membership = await getCrewMembership(crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(membership);
  const permission = checkPermission({ role, action: "crew:update_info" });
  if (!permission.allowed) {
    return { fieldErrors: {}, formError: strings.crew.settings.info.errors.notAllowed };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const colorKeyRaw = Number(formData.get("colorKey"));

  const fieldErrors: UpdateCrewInfoFieldErrors = {};

  const nameCheck = validateCrewName(name);
  if (!nameCheck.valid) {
    fieldErrors.name = nameCheck.violations.includes("required")
      ? strings.crew.create.errors.nameRequired
      : nameCheck.violations.includes("banned_word")
        ? strings.crew.create.errors.nameBannedWord
        : strings.crew.create.errors.nameTooLong;
  }

  const descriptionCheck = validateCrewDescription(description);
  if (!descriptionCheck.valid) {
    fieldErrors.description = descriptionCheck.violations.includes("required")
      ? strings.crew.create.errors.descriptionRequired
      : strings.crew.create.errors.descriptionTooLong;
  }

  if (!isValidCrewCategory(category)) {
    fieldErrors.category = strings.crew.create.errors.categoryRequired;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const colorKey =
    Number.isInteger(colorKeyRaw) && colorKeyRaw >= 0 && colorKeyRaw < CREW_PALETTE_SIZE
      ? colorKeyRaw
      : crew.colorKey;

  const result = await updateCrewInfo(crewId, { name, description, category, colorKey });
  if (!result.ok) {
    return { fieldErrors: {}, formError: strings.crew.settings.info.errors.failed };
  }

  refresh();
  return { fieldErrors: {}, success: true };
}
