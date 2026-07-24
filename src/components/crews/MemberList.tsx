"use client";

import { Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { leaveCrewAction, type LeaveCrewFormState } from "@/lib/actions/leave-crew";
import {
  setCrewMemberRoleAction,
  type SetCrewMemberRoleFormState,
} from "@/lib/actions/set-crew-member-role";
import { strings } from "@/lib/strings";
import type { CrewMembershipRole, Id } from "@/lib/types";

import type { MemberRowViewModel } from "./crew-member-view-models";

const INITIAL_APPOINT_STATE: SetCrewMemberRoleFormState = {};
const INITIAL_LEAVE_STATE: LeaveCrewFormState = {};

const ROLE_BADGE_VARIANT: Record<CrewMembershipRole, "default" | "secondary" | "outline"> = {
  owner: "default",
  staff: "secondary",
  member: "outline",
};

export interface MemberListProps {
  crewId: Id;
  members: MemberRowViewModel[];
}

/**
 * FR-015 역할 정렬 목록(Task 017A, D-030 ①) — 오너 > 임원 > 일반 순으로 이미 정렬된
 * `members`를 그대로 그린다. 정렬·권한 판정은 `CrewMembersContainer`가 끝낸 값을 props로만
 * 받는다(R-015). `JoinRequestButton`과 같은 이유로 이 표현 컴포넌트도 "use client"다 — 행별
 * 임명·탈퇴 버튼이 `useActionState`를 쓴다.
 */
export function MemberList({ crewId, members }: MemberListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {members.map((member) => (
        <li key={member.profileId}>
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <Avatar size="sm">
                {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
                <AvatarFallback>{member.displayName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-foreground">
                  {member.displayName}
                  {member.isSelf && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      ({strings.crew.members.selfBadge})
                    </span>
                  )}
                </span>
                <span className="truncate text-sm text-muted-foreground">@{member.handle}</span>
              </div>
              <Badge variant={ROLE_BADGE_VARIANT[member.role]} className="ml-1 shrink-0">
                {strings.crew.members.roleLabels[member.role]}
              </Badge>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {member.canAppoint && (
                  <AppointRoleForm crewId={crewId} profileId={member.profileId} currentRole={member.role} />
                )}
                {member.isSelf &&
                  (member.canLeave ? (
                    <LeaveForm crewId={crewId} />
                  ) : (
                    member.leaveBlockedReason && (
                      <p className="max-w-40 text-xs text-muted-foreground">{member.leaveBlockedReason}</p>
                    )
                  ))}
              </div>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function AppointRoleForm({
  crewId,
  profileId,
  currentRole,
}: {
  crewId: Id;
  profileId: Id;
  currentRole: CrewMembershipRole;
}) {
  const [state, formAction, isPending] = useActionState(setCrewMemberRoleAction, INITIAL_APPOINT_STATE);
  const nextRole: Extract<CrewMembershipRole, "staff" | "member"> = currentRole === "staff" ? "member" : "staff";

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="crewId" value={crewId} />
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="role" value={nextRole} />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {isPending
          ? strings.crew.members.appoint.submitPending
          : currentRole === "staff"
            ? strings.crew.members.appoint.dismissButton
            : strings.crew.members.appoint.appointButton}
      </Button>
      {state.formError && (
        <p role="alert" className="text-xs text-destructive">
          {state.formError}
        </p>
      )}
    </form>
  );
}

function LeaveForm({ crewId }: { crewId: Id }) {
  const [state, formAction, isPending] = useActionState(leaveCrewAction, INITIAL_LEAVE_STATE);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="crewId" value={crewId} />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
        {isPending ? strings.crew.members.leave.submitPending : strings.crew.members.leave.button}
      </Button>
      {state.formError && (
        <p role="alert" className="text-xs text-destructive">
          {state.formError}
        </p>
      )}
    </form>
  );
}
