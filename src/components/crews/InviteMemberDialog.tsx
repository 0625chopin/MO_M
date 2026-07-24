"use client";

import { CheckCircle2Icon, Loader2Icon, UserPlusIcon } from "lucide-react";
import { useActionState } from "react";

import { UserSearchField } from "@/components/profile/UserSearchField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteCrewMemberAction, type InviteCrewMemberFormState } from "@/lib/actions/invite-crew-member";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

const INITIAL_INVITE_STATE: InviteCrewMemberFormState = {};

export interface InviteMemberDialogProps {
  crewId: Id;
}

/**
 * FR-020 크루원 초대 다이얼로그(Task 017A, D-030 ①). `UserSearchField`(Task 015B, 계정 설정과
 * 공유)를 그대로 재사용하고 `renderResultFooter` 슬롯에 "초대" 버튼을 끼워 넣는다 — 그 컴포넌트
 * docstring이 명시한 대로 이 자리가 정확히 그 확장 지점이다.
 *
 * 검색과 초대 제출은 **서로 다른 두 요청**이다 — 검색은 `searchUserByHandleAction`(핸들
 * 문자열만 받고 id를 반환하지 않는다), 초대는 `inviteCrewMemberAction`(같은 핸들 문자열을
 * 다시 제출해 서버가 다시 조회한다). 클라이언트는 프로필 id를 한 번도 들고 있지 않는다
 * (`invite-crew-member.ts` docstring 참고).
 */
export function InviteMemberDialog({ crewId }: InviteMemberDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <UserPlusIcon aria-hidden="true" />
        {strings.crew.members.invite.trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{strings.crew.members.invite.dialogTitle}</DialogTitle>
          <DialogDescription>{strings.crew.members.invite.dialogDescription}</DialogDescription>
        </DialogHeader>
        <UserSearchField
          renderResultFooter={(result) => <InviteButton crewId={crewId} handle={result.handle} />}
        />
      </DialogContent>
    </Dialog>
  );
}

function InviteButton({ crewId, handle }: { crewId: Id; handle: string }) {
  const [state, formAction, isPending] = useActionState(inviteCrewMemberAction, INITIAL_INVITE_STATE);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="crewId" value={crewId} />
      <input type="hidden" name="handle" value={handle} />
      <Button type="submit" size="sm" disabled={isPending || state.success}>
        {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {state.success && <CheckCircle2Icon aria-hidden="true" className="size-3.5" />}
        {isPending
          ? strings.crew.members.invite.submitPending
          : state.success
            ? strings.crew.members.invite.sentNotice
            : strings.crew.members.invite.inviteButton}
      </Button>
      {state.formError && (
        <p role="alert" className="text-xs text-destructive">
          {state.formError}
        </p>
      )}
    </form>
  );
}
