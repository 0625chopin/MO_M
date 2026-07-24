"use client";

import { Loader2Icon } from "lucide-react";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { OnboardingFormState } from "@/lib/actions/complete-onboarding";
import { completeOnboardingAction } from "@/lib/actions/complete-onboarding";
import { strings, t } from "@/lib/strings";

/** `'use server'` 파일은 async 함수만 export할 수 있다(`signup.ts` docstring 참고) —
 *  초기 상태는 타입만 가져와 여기서 만든다. */
const INITIAL_ONBOARDING_FORM_STATE: OnboardingFormState = { fieldErrors: {} };

/**
 * FR-004 온보딩 폼 — 가입 직후 최초 1회만 보이는 화면(page.tsx의 `hasCompletedOnboarding`
 * 가드). 핸들은 읽기 전용이다 — FR-001에서 이미 확정됐고 `lib/data`의 `updateProfile`이
 * 애초에 handle을 받지 않는다(`complete-onboarding.ts` 모듈 docstring 참고). 표시 이름 확정과
 * 검색 노출 여부(searchOptOut, D-005 기본값은 "노출")만 다룬다.
 */
export function OnboardingForm({
  handle,
  displayName,
  searchOptOut,
}: {
  handle: string;
  displayName: string;
  searchOptOut: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    completeOnboardingAction,
    INITIAL_ONBOARDING_FORM_STATE,
  );

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <p className="text-lg font-medium text-foreground">
        {t((s) => s.auth.onboarding.welcome, { displayName })}
      </p>

      {state.formError && (
        <p role="alert" className="text-sm text-destructive">
          {state.formError}
        </p>
      )}

      <FieldGroup>
        <Field data-disabled>
          <FieldLabel htmlFor="onboarding-handle">{strings.auth.onboarding.fields.handle}</FieldLabel>
          <Input id="onboarding-handle" defaultValue={handle} disabled aria-describedby="onboarding-handle-desc" />
          <FieldDescription id="onboarding-handle-desc">
            {strings.auth.onboarding.fields.handleLocked}
          </FieldDescription>
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors.displayName)}>
          <FieldLabel htmlFor="onboarding-display-name">
            {strings.auth.onboarding.fields.displayName}
          </FieldLabel>
          <Input
            id="onboarding-display-name"
            name="displayName"
            defaultValue={displayName}
            required
            maxLength={30}
            aria-invalid={Boolean(state.fieldErrors.displayName)}
            aria-describedby={state.fieldErrors.displayName ? "onboarding-display-name-error" : undefined}
          />
          {state.fieldErrors.displayName && (
            <FieldError id="onboarding-display-name-error">{state.fieldErrors.displayName}</FieldError>
          )}
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="onboarding-search-opt-out"
            name="searchOptOut"
            value="on"
            defaultChecked={searchOptOut}
            aria-describedby="onboarding-search-opt-out-desc"
          />
          <FieldContent>
            <FieldLabel htmlFor="onboarding-search-opt-out">
              {strings.auth.onboarding.fields.searchOptOut}
            </FieldLabel>
            <FieldDescription id="onboarding-search-opt-out-desc">
              {strings.auth.onboarding.fields.searchOptOutDescription}
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {isPending ? strings.auth.onboarding.submitPending : strings.auth.onboarding.submit}
      </Button>
    </form>
  );
}
