"use client";

import { Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateCrewFormState } from "@/lib/actions/create-crew";
import { createCrewAction } from "@/lib/actions/create-crew";
import { CREW_CATEGORIES } from "@/lib/rules/crew-category";
import { CREW_DESCRIPTION_MAX_LENGTH } from "@/lib/rules/crew-description-validation";
import { CREW_NAME_MAX_LENGTH } from "@/lib/rules/crew-name-validation";
import { strings } from "@/lib/strings";

/** `'use server'` 파일은 async 함수만 export할 수 있다(`signup.ts` docstring 참고) —
 *  초기 상태는 타입만 가져와 여기서 만든다. */
const INITIAL_CREATE_CREW_STATE: CreateCrewFormState = { fieldErrors: {} };

/**
 * FR-010 크루 개설 폼(SC-08, D-016, Task 016B). 색상 입력 필드가 없다 — 개설 시 자동 배정되고
 * 변경은 크루 설정(SC-15, FR-011)에서만 한다.
 *
 * `CREW_CATEGORIES`(`lib/rules/crew-category.ts`)가 카테고리 select의 유일한 소스다 —
 * Task 016A(크루 탐색, 같은 담당자 후속 회차)의 카테고리 필터도 같은 목록을 재사용해야
 * 개설 폼에서 고른 카테고리가 탐색 필터에서도 그대로 잡힌다.
 */
export function CrewCreateForm() {
  const [state, formAction, isPending] = useActionState(createCrewAction, INITIAL_CREATE_CREW_STATE);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(state.fieldErrors.name)}>
          <FieldLabel htmlFor="crew-create-name">{strings.crew.create.fields.name}</FieldLabel>
          <Input
            id="crew-create-name"
            name="name"
            required
            maxLength={CREW_NAME_MAX_LENGTH}
            aria-invalid={Boolean(state.fieldErrors.name)}
            aria-describedby={state.fieldErrors.name ? "crew-create-name-error" : undefined}
          />
          {state.fieldErrors.name && (
            <FieldError id="crew-create-name-error">{state.fieldErrors.name}</FieldError>
          )}
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors.description)}>
          <FieldLabel htmlFor="crew-create-description">
            {strings.crew.create.fields.description}
          </FieldLabel>
          <Textarea
            id="crew-create-description"
            name="description"
            required
            maxLength={CREW_DESCRIPTION_MAX_LENGTH}
            aria-invalid={Boolean(state.fieldErrors.description)}
            aria-describedby={state.fieldErrors.description ? "crew-create-description-error" : undefined}
          />
          {state.fieldErrors.description && (
            <FieldError id="crew-create-description-error">{state.fieldErrors.description}</FieldError>
          )}
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors.category)}>
          <FieldLabel htmlFor="crew-create-category">{strings.crew.create.fields.category}</FieldLabel>
          <Select name="category">
            <SelectTrigger
              id="crew-create-category"
              aria-invalid={Boolean(state.fieldErrors.category)}
              aria-describedby={state.fieldErrors.category ? "crew-create-category-error" : undefined}
              className="w-full"
            >
              <SelectValue placeholder={strings.crew.create.fields.categoryPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {CREW_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors.category && (
            <FieldError id="crew-create-category-error">{state.fieldErrors.category}</FieldError>
          )}
        </Field>

        <FieldSet>
          <FieldLegend variant="label">{strings.crew.create.fields.visibility}</FieldLegend>
          <RadioGroup name="visibility" defaultValue="public">
            <Field orientation="horizontal">
              <RadioGroupItem id="crew-create-visibility-public" value="public" />
              <FieldContent>
                <FieldLabel htmlFor="crew-create-visibility-public">
                  {strings.crew.create.visibilityOptions.public.label}
                </FieldLabel>
                <FieldDescription>
                  {strings.crew.create.visibilityOptions.public.description}
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="crew-create-visibility-private" value="private" />
              <FieldContent>
                <FieldLabel htmlFor="crew-create-visibility-private">
                  {strings.crew.create.visibilityOptions.private.label}
                </FieldLabel>
                <FieldDescription>
                  {strings.crew.create.visibilityOptions.private.description}
                </FieldDescription>
              </FieldContent>
            </Field>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>

      {state.formError && (
        <p role="alert" className="text-sm text-destructive">
          {state.formError}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {isPending ? strings.crew.create.submitPending : strings.crew.create.submit}
      </Button>
    </form>
  );
}
