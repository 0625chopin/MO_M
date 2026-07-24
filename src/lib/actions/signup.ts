"use server";

import { redirect } from "next/navigation";

import { setMockSessionCookie } from "@/components/shell/set-mock-session-cookie";
import { createProfile, getProfileByHandle } from "@/lib/data";
import { isValidEmailFormat, validatePasswordFormat } from "@/lib/rules/auth-credentials";
import { validateDisplayName } from "@/lib/rules/display-name-validation";
import { validateHandleFormat } from "@/lib/rules/handle-validation";
import { strings } from "@/lib/strings";

/**
 * FR-001 회원가입 Server Action. `SignupForm`이 `useActionState(signupAction, ...)`로 건다.
 *
 * **이메일 계정 저장소가 없다(CON-06).** `Profile`(`lib/types/profile.types.ts`)에는 애초에
 * `email` 필드가 없다 — 로그인 자격 증명은 Supabase Auth의 몫이고 이 데이터 레이어는 그
 * 결과로 나온 `profileId`만 받는다(`profile.ts` 모듈 docstring). Task 026(Supabase 도입,
 * I-016 커스텀 SMTP 차단) 전까지는 이메일을 저장·중복 검사할 진짜 저장소가 없다. 그래서
 * FR-001 E1("이미 가입된 이메일") 오류 경로는 아래 예약값 하나로 **화면 상태만** 시연한다 —
 * D-020이 로그인 잠금에 적용한 것과 같은 원칙("Mock 단계는 화면 상태만 만든다")을 이메일
 * 중복 검사에도 적용했다. 핸들 중복 검사는 반대로 **진짜** `lib/data` 조회다 — `Profile`이
 * 핸들은 필드로 갖고 있기 때문이다.
 */
const MOCK_RESERVED_TAKEN_EMAIL = "seo_runs@example.com";

export interface SignupFieldErrors {
  email?: string;
  password?: string;
  handle?: string;
  displayName?: string;
  terms?: string;
}

export interface SignupFormState {
  fieldErrors: SignupFieldErrors;
  /** 필드에 걸리지 않는 전역 오류(예: 동시 요청 경쟁으로 인한 저장 실패). */
  formError?: string;
}

// `initialSignupFormState` 같은 상수는 여기 두지 않는다 — `'use server'` 파일은 async 함수만
// export할 수 있다(React Server Functions 제약). 초기 상태는 `SignupForm`(호출부)이 이 파일의
// **타입**(`SignupFormState`, 타입 import는 컴파일 타임에 지워져 제약 대상이 아니다)만 가져다
// 직접 리터럴로 만든다.
export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const handle = String(formData.get("handle") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const agreedToTerms = formData.get("agreedToTerms") === "on";

  const fieldErrors: SignupFieldErrors = {};

  if (!isValidEmailFormat(email)) {
    fieldErrors.email = strings.auth.signup.errors.emailInvalid;
  } else if (email.toLowerCase() === MOCK_RESERVED_TAKEN_EMAIL) {
    fieldErrors.email = strings.auth.signup.errors.emailTaken;
  }

  if (!validatePasswordFormat(password).valid) {
    fieldErrors.password = strings.auth.signup.errors.passwordTooShort;
  }

  const displayNameCheck = validateDisplayName(displayName);
  if (!displayNameCheck.valid) {
    fieldErrors.displayName = displayNameCheck.violations.includes("required")
      ? strings.auth.signup.errors.displayNameRequired
      : strings.auth.signup.errors.displayNameTooLong;
  }

  const handleFormatCheck = validateHandleFormat(handle);
  if (!handleFormatCheck.valid) {
    fieldErrors.handle = strings.auth.signup.errors.handleInvalidFormat;
  } else if (await getProfileByHandle(handle)) {
    fieldErrors.handle = strings.auth.signup.errors.handleTaken;
  }

  if (!agreedToTerms) {
    fieldErrors.terms = strings.auth.signup.errors.termsRequired;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const created = await createProfile({ handle, displayName });
  if (!created.ok) {
    // 위에서 이미 형식·중복을 걸렀지만, 동시 요청 경쟁(두 탭에서 같은 핸들 제출)이면 여기서도
    // conflict가 올 수 있다 — DataResult 계약(D-030 ③)을 그대로 필드 오류로 반영한다.
    return { fieldErrors: { handle: strings.auth.signup.errors.handleTaken } };
  }

  // FR-001 정상 흐름 ⑦ "로그인 상태로 온보딩 진입". 실 인증에서는 이메일 인증(⑤~⑥) 이후에나
  // 세션이 생기지만(AC1 `pending_verification`), 커스텀 SMTP 공급자가 미결(I-016)이라 이메일
  // 인증 자체가 Mock 단계 범위 밖이다 — 가입 즉시 활성 세션을 만들어 온보딩·홈 등 그 뒤 화면을
  // 막힘없이 시연할 수 있게 한다.
  await setMockSessionCookie({
    profileId: created.data.id,
    displayName: created.data.displayName,
    hasCompletedOnboarding: false,
    unreadNotificationCount: 0,
  });

  redirect("/onboarding");
}
