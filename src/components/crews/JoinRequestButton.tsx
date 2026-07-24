"use client";

import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { getCrewHomeHref } from "@/components/crews/crew-links";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { RequestJoinCrewFormState } from "@/lib/actions/request-join-crew";
import { requestToJoinCrewAction } from "@/lib/actions/request-join-crew";
import type { WithdrawJoinRequestFormState } from "@/lib/actions/withdraw-join-request";
import { withdrawJoinRequestAction } from "@/lib/actions/withdraw-join-request";
import type { JoinRequestButtonState } from "@/lib/rules/join-request-button-state";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

const INITIAL_REQUEST_STATE: RequestJoinCrewFormState = {};
const INITIAL_WITHDRAW_STATE: WithdrawJoinRequestFormState = {};

export interface JoinRequestButtonProps {
  crewId: Id;
  state: JoinRequestButtonState;
}

/**
 * FR-022 가입 신청 버튼 상태 기계의 표현 컴포넌트(Task 016B, ROADMAP "가입 신청 버튼 상태
 * 기계 4.5인일"). 어떤 상태를 보여줄지는 전혀 판정하지 않는다 — `state`(props)는
 * `CrewHomeContainer`가 `resolveJoinRequestButtonState`(`lib/rules`)로 이미 계산해 내려준
 * 값이다(D-030 ①·R-015). 이 컴포넌트는 `state.kind`에 따라 어떤 UI 조각을 그릴지만 고른다.
 *
 * `member`·`private_locked`는 이 컴포넌트가 그릴 것이 없다(호출부가 애초에 다른 컴포넌트를
 * 그린다 — `member`는 크루 홈 자체, `private_locked`는 `PrivateCrewNotice`) — 방어적으로
 * `null`을 반환한다.
 */
export function JoinRequestButton({ crewId, state }: JoinRequestButtonProps) {
  switch (state.kind) {
    case "member":
    case "private_locked":
      return null;
    case "guest_prompt":
      return <GuestPromptButton crewId={crewId} />;
    case "invited":
      return <InvitedNotice />;
    case "pending":
      return <PendingWithdrawButton crewId={crewId} />;
    case "blocked":
      return (
        <Button variant="outline" disabled>
          {strings.crew.home.join.blockedNotice}
        </Button>
      );
    case "requestable":
      return <RequestJoinDialog crewId={crewId} />;
  }
}

function GuestPromptButton({ crewId }: { crewId: Id }) {
  const redirectTarget = `/login?redirect=${encodeURIComponent(getCrewHomeHref(crewId))}`;
  return (
    <Button nativeButton={false} render={<Link href={redirectTarget} />}>
      {strings.crew.home.join.guestPrompt}
    </Button>
  );
}

function InvitedNotice() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm">
      <p className="text-muted-foreground">{strings.crew.home.join.invitedNotice}</p>
      <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/invitations" />}>
        {strings.crew.home.join.goToInvitations}
      </Button>
    </div>
  );
}

function PendingWithdrawButton({ crewId }: { crewId: Id }) {
  const [state, formAction, isPending] = useActionState(withdrawJoinRequestAction, INITIAL_WITHDRAW_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="crewId" value={crewId} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {isPending ? strings.crew.home.join.withdrawSubmitPending : strings.crew.home.join.pendingButton}
      </Button>
      {state.formError && (
        <p role="alert" className="text-sm text-destructive">
          {state.formError}
        </p>
      )}
    </form>
  );
}

function RequestJoinDialog({ crewId }: { crewId: Id }) {
  const [state, formAction, isPending] = useActionState(requestToJoinCrewAction, INITIAL_REQUEST_STATE);

  // 다이얼로그를 로컬 상태로 직접 제어하지 않는다(비제어 `Dialog`, `overlays.tsx` 데모와 같은
  // 형태) — 신청이 성공하면 액션 안의 `refresh()`가 `CrewHomeContainer`를 다시 그려 이
  // 컴포넌트의 부모(`JoinRequestButton`의 switch)가 `state.kind`를 "requestable"에서
  // "pending"으로 바꾼다. 그러면 `RequestJoinDialog` 자신이 트리에서 통째로 걷혀 다이얼로그도
  // 함께 닫힌다 — `setOpen(false)`를 이펙트에서 동기 호출하는 것보다(연쇄 렌더 유발, React
  // Compiler 계열 lint가 `react-hooks/set-state-in-effect`로 막는다) 언마운트에 맡기는 쪽이
  // 더 단순하고 규칙을 어기지 않는다.
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>{strings.crew.home.join.requestButton}</DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="crewId" value={crewId} />
          <DialogHeader>
            <DialogTitle>{strings.crew.home.join.dialogTitle}</DialogTitle>
            <DialogDescription>{strings.crew.home.join.dialogDescription}</DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="join-request-message">{strings.crew.home.join.messageLabel}</FieldLabel>
            <Textarea
              id="join-request-message"
              name="message"
              placeholder={strings.crew.home.join.messagePlaceholder}
            />
          </Field>

          {state.formError && (
            <p role="alert" className="text-sm text-destructive">
              {state.formError}
            </p>
          )}
          {state.success && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle2Icon aria-hidden="true" className="size-3.5 text-primary" />
              {strings.crew.home.join.sentNotice}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
              {isPending ? strings.crew.home.join.submitPending : strings.crew.home.join.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
