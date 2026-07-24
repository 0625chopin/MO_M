"use client";

import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ChangeHandleFormState } from "@/lib/actions/change-account-handle";
import { changeAccountHandleAction } from "@/lib/actions/change-account-handle";
import type { AccountProfileFormState } from "@/lib/actions/update-account-profile";
import { updateAccountProfileAction } from "@/lib/actions/update-account-profile";
import { BIO_MAX_LENGTH } from "@/lib/rules/bio-validation";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/rules/display-name-validation";
import { strings, t } from "@/lib/strings";

// `'use server'` 파일은 async 함수만 export할 수 있다(signup.ts 모듈 docstring 참고) —
// 초기 상태는 타입만 가져와 여기서 만든다.
const INITIAL_PROFILE_STATE: AccountProfileFormState = { fieldErrors: {} };
const INITIAL_HANDLE_STATE: ChangeHandleFormState = {};

/**
 * YYYY.MM.DD 절대 날짜 포맷. `components/board/format-post-date.ts`와 같은 이유(NFR-025,
 * 재검증 없는 상대 시각은 곧 부정확해진다)로 값은 같지만, 도메인 경계를 넘어 board 모듈을
 * import하지 않기 위해 이 파일 안에 작게 뒀다(두 파일 다 팀장 검토 시점에 통합 여지가 있다).
 */
function formatAccountDate(iso: string): string {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value.padStart(2, "0") ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

export interface ProfileEditFormProps {
  profile: {
    handle: string;
    displayName: string;
    bio: string | null;
    searchOptOut: boolean;
  };
  /** `canChangeHandle`(`lib/rules/handle-validation.ts`)이 컨테이너에서 이미 계산해 내려준 값
   *  — 이 컴포넌트는 판정을 다시 하지 않고 그 결과만 받는다(팀장 지침 4번). */
  handleEligibility: { allowed: boolean; nextAllowedAt: string | null };
}

/**
 * FR-004 계정 설정 편집 폼(SC-19, Task 015B). **폼이 두 개다** — 표시 이름·소개·검색 노출은
 * 언제든 저장할 수 있지만, 핸들만 30일 쿨다운(AC1)이라는 별도의 실패 모드를 가져서 같은
 * 제출 하나로 묶으면 "핸들만 막혔는데 나머지 필드도 함께 실패로 보여야 하는지"가 애매해진다
 * (`lib/actions/change-account-handle.ts` docstring 참고). 두 폼 다 `useActionState`로
 * 각자의 Server Action에 물린다 — `SignupForm`·`OnboardingForm`과 같은 패턴.
 *
 * **쿨다운 잠금은 이 컴포넌트가 판정하지 않는다** — 최초 렌더는 컨테이너가 내려준
 * `handleEligibility`를 그대로 쓰고, 제출 후에는 서버 액션이 다시 판정한 결과
 * (`handleState.fieldError`가 쿨다운 문구와 같은지)로 갱신한다. 둘 다 `lib/rules`의
 * `canChangeHandle` 호출 결과를 그대로 옮긴 값이지 이 컴포넌트가 다시 계산한 값이 아니다.
 */
export function ProfileEditForm({ profile, handleEligibility }: ProfileEditFormProps) {
  const [profileState, profileFormAction, isProfilePending] = useActionState(
    updateAccountProfileAction,
    INITIAL_PROFILE_STATE,
  );
  const [handleState, handleFormAction, isHandlePending] = useActionState(
    changeAccountHandleAction,
    INITIAL_HANDLE_STATE,
  );

  const currentHandle = handleState.handle ?? profile.handle;
  const cooldownRejected = handleState.fieldError === strings.account.settings.handle.errors.cooldown;
  const locked = cooldownRejected || (!handleEligibility.allowed && !handleState.success);
  const nextAllowedAt = handleState.nextAllowedAt ?? (locked ? handleEligibility.nextAllowedAt : null);

  return (
    <div className="flex flex-col gap-8">
      <form action={profileFormAction} noValidate className="flex flex-col gap-6">
        <FieldGroup>
          <Field data-invalid={Boolean(profileState.fieldErrors.displayName)}>
            <FieldLabel htmlFor="account-display-name">
              {strings.account.settings.fields.displayName}
            </FieldLabel>
            <Input
              id="account-display-name"
              name="displayName"
              defaultValue={profile.displayName}
              required
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              aria-invalid={Boolean(profileState.fieldErrors.displayName)}
              aria-describedby={
                profileState.fieldErrors.displayName ? "account-display-name-error" : undefined
              }
            />
            {profileState.fieldErrors.displayName && (
              <FieldError id="account-display-name-error">
                {profileState.fieldErrors.displayName}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={Boolean(profileState.fieldErrors.bio)}>
            <FieldLabel htmlFor="account-bio">{strings.account.settings.fields.bio}</FieldLabel>
            <Textarea
              id="account-bio"
              name="bio"
              defaultValue={profile.bio ?? ""}
              maxLength={BIO_MAX_LENGTH}
              placeholder={strings.account.settings.fields.bioPlaceholder}
              aria-invalid={Boolean(profileState.fieldErrors.bio)}
              aria-describedby={profileState.fieldErrors.bio ? "account-bio-error" : undefined}
            />
            {profileState.fieldErrors.bio && (
              <FieldError id="account-bio-error">{profileState.fieldErrors.bio}</FieldError>
            )}
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              id="account-search-opt-out"
              name="searchOptOut"
              value="on"
              defaultChecked={profile.searchOptOut}
              aria-describedby="account-search-opt-out-desc"
            />
            <FieldContent>
              <FieldLabel htmlFor="account-search-opt-out">
                {strings.account.settings.fields.searchOptOut}
              </FieldLabel>
              <FieldDescription id="account-search-opt-out-desc">
                {strings.account.settings.fields.searchOptOutDescription}
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>

        {profileState.formError && (
          <p role="alert" className="text-sm text-destructive">
            {profileState.formError}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isProfilePending}>
            {isProfilePending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
            {isProfilePending ? strings.account.settings.submitPending : strings.account.settings.submit}
          </Button>
          {profileState.success && !isProfilePending && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle2Icon aria-hidden="true" className="size-3.5 text-primary" />
              {strings.account.settings.saved}
            </span>
          )}
        </div>
      </form>

      <FieldSeparator />

      <form action={handleFormAction} noValidate className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            {strings.account.settings.handle.heading}
          </h2>
          <p className="text-sm text-muted-foreground">{strings.account.settings.handle.description}</p>
        </div>

        <Field data-invalid={Boolean(handleState.fieldError)} data-disabled={locked}>
          <FieldLabel htmlFor="account-handle">{strings.account.settings.handle.label}</FieldLabel>
          <Input
            id="account-handle"
            name="handle"
            defaultValue={currentHandle}
            disabled={locked}
            required
            autoComplete="off"
            aria-invalid={Boolean(handleState.fieldError)}
            aria-describedby={
              handleState.fieldError
                ? "account-handle-error"
                : locked
                  ? "account-handle-locked"
                  : undefined
            }
          />
          {handleState.fieldError ? (
            <FieldError id="account-handle-error">{handleState.fieldError}</FieldError>
          ) : (
            locked &&
            nextAllowedAt && (
              <FieldDescription id="account-handle-locked">
                {t((s) => s.account.settings.handle.lockedNotice, {
                  date: formatAccountDate(nextAllowedAt),
                })}
              </FieldDescription>
            )
          )}
        </Field>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="outline" disabled={isHandlePending || locked}>
            {isHandlePending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
            {isHandlePending
              ? strings.account.settings.handle.submitPending
              : strings.account.settings.handle.submit}
          </Button>
          {handleState.success && !isHandlePending && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle2Icon aria-hidden="true" className="size-3.5 text-primary" />
              {strings.account.settings.handle.saved}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
