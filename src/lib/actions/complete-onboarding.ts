"use server";

import { redirect } from "next/navigation";

import { isAuthenticated } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { patchMockSessionCookie } from "@/components/shell/set-mock-session-cookie";
import { updateProfile } from "@/lib/data";
import { validateDisplayName } from "@/lib/rules/display-name-validation";
import { strings } from "@/lib/strings";

/**
 * FR-004(온보딩에서의 프로필 확정) Server Action. `OnboardingForm`이 건다.
 *
 * **핸들은 이 액션이 다루지 않는다.** 핸들은 FR-001(가입)에서 이미 확정됐고, `lib/data`의
 * `UpdateProfileInput`(`profile.ts`)이 애초에 `handle`을 받지 않는다 — 핸들 변경은 FR-004
 * AC1(30일 1회 제한)이 적용되는 별도 플로우로, `lib/rules/handle-validation.ts`의
 * `canChangeHandle`이 그 플로우(계정 설정 화면, CREW 몫)를 위해 이미 준비돼 있다. 온보딩은
 * 표시 이름 확정과 검색 노출 여부(searchOptOut)만 다룬다.
 */
export interface OnboardingFieldErrors {
  displayName?: string;
}

export interface OnboardingFormState {
  fieldErrors: OnboardingFieldErrors;
  formError?: string;
}

// 초기 상태 상수는 여기 두지 않는다 — `'use server'` 파일은 async 함수만 export할 수 있다
// (signup.ts 모듈 docstring 참고). `OnboardingForm`이 `OnboardingFormState` 타입만 가져다
// 직접 만든다.

export async function completeOnboardingAction(
  _prevState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const session = await getAuthSession();
  if (!isAuthenticated(session)) {
    // 세션 만료 등 — FR-002 E3(재로그인 유도)에 준한다. throw 대신 폼 오류로 표현한다(D-030 ③).
    return { fieldErrors: {}, formError: strings.auth.onboarding.errors.sessionExpired };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const searchOptOut = formData.get("searchOptOut") === "on";

  const displayNameCheck = validateDisplayName(displayName);
  if (!displayNameCheck.valid) {
    return {
      fieldErrors: {
        displayName: displayNameCheck.violations.includes("required")
          ? strings.auth.onboarding.errors.displayNameRequired
          : strings.auth.onboarding.errors.displayNameTooLong,
      },
    };
  }

  const updated = await updateProfile(session.profileId, { displayName, searchOptOut });
  if (!updated.ok) {
    return { fieldErrors: {}, formError: strings.error.conflict.description };
  }

  await patchMockSessionCookie(session, {
    displayName: updated.data.displayName,
    hasCompletedOnboarding: true,
  });

  redirect("/home");
}
