"use client";

import { Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { RespondMeetupAttendanceFormState } from "@/lib/actions/respond-meetup-attendance";
import { respondMeetupAttendanceAction } from "@/lib/actions/respond-meetup-attendance";
import type { MeetupAttendanceButtonState } from "@/lib/rules/meetup-attendance-button-state";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

const INITIAL_STATE: RespondMeetupAttendanceFormState = {};

export interface MeetupAttendanceActionsProps {
  meetupId: Id;
  /** `MeetupDetailContainer`가 `resolveMeetupAttendanceButtonState`(lib/rules)로 이미 계산해
   *  내려준 값 — 이 컴포넌트는 `state.kind`에 따라 어떤 UI 조각을 그릴지만 고른다(D-030 ①,
   *  `JoinRequestButton`과 같은 자리). */
  state: MeetupAttendanceButtonState;
}

/**
 * FR-066·FR-067 참석/불참 버튼(Task 022). `JoinRequestButton`(크루 가입 신청)의 형태를
 * 그대로 따른다 — `useActionState`로 Server Action(`respondMeetupAttendanceAction`)을 걸고,
 * 성공하면 액션 안의 `refresh()`가 `MeetupDetailContainer`를 다시 그려 이 컴포넌트의 부모가
 * 새 `state`를 내려준다(로컬 `useEffect`로 "성공 후 정리"를 하지 않는다 —
 * `docs/CONVENTIONS.md` "Server Action 폼 상태 관리" 절의 기준).
 */
export function MeetupAttendanceActions({ meetupId, state }: MeetupAttendanceActionsProps) {
  switch (state.kind) {
    case "cancelled":
      return <p className="text-sm text-muted-foreground">{strings.meetup.cancelled}</p>;
    case "closed":
      return <p className="text-sm text-muted-foreground">{strings.meetup.attendance.closedNotice}</p>;
    case "attending":
      return (
        <AttendanceForm
          meetupId={meetupId}
          nextStatus="absent"
          label={strings.meetup.attendance.switchToAbsent}
          variant="outline"
        />
      );
    case "full":
      return (
        <Button variant="outline" disabled>
          {strings.meetup.attendance.full}
        </Button>
      );
    case "open":
      return (
        <AttendanceForm
          meetupId={meetupId}
          nextStatus="attending"
          label={strings.meetup.attendance.attend}
          variant="default"
        />
      );
  }
}

function AttendanceForm({
  meetupId,
  nextStatus,
  label,
  variant,
}: {
  meetupId: Id;
  nextStatus: "attending" | "absent";
  label: string;
  variant: "default" | "outline";
}) {
  const [formState, formAction, isPending] = useActionState(
    respondMeetupAttendanceAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="meetupId" value={meetupId} />
      <input type="hidden" name="status" value={nextStatus} />
      <Button type="submit" variant={variant} disabled={isPending}>
        {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {isPending ? strings.meetup.attendance.submitPending : label}
      </Button>
      {formState.formError && (
        <p role="alert" className="text-sm text-destructive">
          {formState.formError}
        </p>
      )}
    </form>
  );
}
