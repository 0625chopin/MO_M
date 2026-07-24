"use server";

import { isAuthenticated } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { checkHandleAvailabilityAction } from "@/lib/actions/check-handle-availability";
import { changeProfileHandle, getProfileById } from "@/lib/data";
import { canChangeHandle } from "@/lib/rules/handle-validation";
import { strings } from "@/lib/strings";

/**
 * FR-004 AC1 계정 설정 — 핸들 변경 Server Action(Task 015B, 30일 쿨다운). `ProfileEditForm`의
 * 핸들 절이 `useActionState(changeAccountHandleAction, ...)`로 건다. 표시 이름·소개 저장
 * (`update-account-profile.ts`)과 분리한 이유는 그 파일 docstring 참고.
 *
 * **판정 순서가 실패 모드를 결정한다**: ① 세션 ② 쿨다운(`canChangeHandle`, `lib/rules/
 * handle-validation.ts`) ③ 형식·중복(`checkHandleAvailabilityAction`, Task 015A/CORE가
 * 만든 그 함수를 **그대로** 재사용 — `excludeProfileId`를 넘겨 "본인의 현재 핸들로 재제출"이
 * 오탐 중복으로 뜨지 않게 한다). 쿨다운이 잠겨 있으면 형식·중복 조회 자체를 하지 않는다 —
 * 어차피 제출할 수 없는 값이라 서버 왕복이 낭비다.
 *
 * **같은 값 재제출은 쿨다운을 소모하지 않는다** — `newHandle === profile.handle`이면
 * `changeProfileHandle`(실제 갱신)을 호출하지 않고 그대로 성공 처리한다. 그 함수가 호출될
 * 때마다 `handleChangedAt`을 현재 시각으로 갱신하므로, 실제로 바뀐 게 없는데 호출하면 다음
 * 변경 가능일이 부당하게 30일 뒤로 밀린다.
 */
export interface ChangeHandleFormState {
  fieldError?: string;
  /** 쿨다운 잠김일 때만 채워진다 — `ProfileEditForm`이 `formatAccountDate`로 표시한다. */
  nextAllowedAt?: string | null;
  success?: boolean;
  /** 최신 확정 핸들. 성공/실패 모두에서 폼의 `defaultValue`를 현재 값으로 되돌리는 데 쓴다. */
  handle?: string;
}

// 초기 상태 상수는 여기 두지 않는다 — `'use server'` 파일은 async 함수만 export할 수 있다.

export async function changeAccountHandleAction(
  _prevState: ChangeHandleFormState,
  formData: FormData,
): Promise<ChangeHandleFormState> {
  const session = await getAuthSession();
  if (!isAuthenticated(session)) {
    return { fieldError: strings.account.settings.errors.sessionExpired };
  }

  const profile = await getProfileById(session.profileId);
  if (!profile) {
    // 이론상 경쟁 조건(OnboardingFormContainer와 같은 엣지 케이스). 여기서는 폴백할 표시값이
    // 없으므로 오류로 표현한다(D-030 ③, throw 하지 않는다).
    return { fieldError: strings.account.settings.errors.notFound };
  }

  const now = new Date().toISOString();
  const eligibility = canChangeHandle(profile.handleChangedAt, now);
  if (!eligibility.allowed) {
    return {
      fieldError: strings.account.settings.handle.errors.cooldown,
      nextAllowedAt: eligibility.nextAllowedAt,
      handle: profile.handle,
    };
  }

  const newHandle = String(formData.get("handle") ?? "").trim();

  if (newHandle === profile.handle) {
    return { success: true, handle: profile.handle };
  }

  const availability = await checkHandleAvailabilityAction(newHandle, session.profileId);
  if (!availability.format.valid) {
    return { fieldError: strings.account.settings.handle.errors.invalidFormat, handle: profile.handle };
  }
  if (availability.available === false) {
    return { fieldError: strings.account.settings.handle.errors.taken, handle: profile.handle };
  }

  const changed = await changeProfileHandle(session.profileId, newHandle);
  if (!changed.ok) {
    // 동시 요청 경쟁 — availability 확인 이후 다른 요청이 먼저 그 핸들을 가져간 경우
    // (`signup.ts`가 `createProfile`의 `conflict`를 다루는 것과 같은 방어적 재확인).
    return { fieldError: strings.account.settings.handle.errors.taken, handle: profile.handle };
  }

  return { success: true, handle: changed.data.handle };
}
