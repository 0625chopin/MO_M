"use client";

import { Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { CrewColorDot } from "@/components/crews/CrewColorDot";
import { formatInvitationExpiry } from "@/components/invitations/format-invitation-expiry";
import type { InvitationRowViewModel } from "@/components/invitations/invitation-view-models";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  respondToInvitationAction,
  type RespondToInvitationFormState,
} from "@/lib/actions/respond-to-invitation";
import { strings, t } from "@/lib/strings";

const INITIAL_RESPOND_STATE: RespondToInvitationFormState = {};

export interface InvitationListProps {
  invitations: InvitationRowViewModel[];
}

/**
 * SC-20 받은 초대함 목록(FR-021·028, Task 017B) — 표현 컴포넌트(D-030 ①). 크루명·초대자·
 * 만료일 조회는 `InvitationInboxContainer`가 이미 끝낸 값을 props로만 받는다(R-015). 빈 상태
 * (FR-021 — 대기 중 초대 0건)는 이 컴포넌트가 직접 그린다(`NotificationList`와 같은 이유).
 */
export function InvitationList({ invitations }: InvitationListProps) {
  if (invitations.length === 0) {
    return (
      <Empty className="rounded-xl border border-dashed border-border p-6">
        <EmptyHeader>
          <EmptyTitle>{strings.invitation.inbox.empty}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {invitations.map((invitation) => (
        <li key={invitation.id}>
          <InvitationCard invitation={invitation} />
        </li>
      ))}
    </ul>
  );
}

function InvitationCard({ invitation }: { invitation: InvitationRowViewModel }) {
  const [state, formAction, isPending] = useActionState(respondToInvitationAction, INITIAL_RESPOND_STATE);

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <CrewColorDot colorIndex={invitation.crewColorIndex} className="mt-1.5" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-foreground">{invitation.crewName}</span>
          <span className="truncate text-sm text-muted-foreground">
            {t((s) => s.invitation.inbox.inviterLabel, { name: invitation.inviterDisplayName })}
          </span>
          <span className="text-xs text-muted-foreground">
            {t((s) => s.invitation.inbox.expiresLabel, {
              date: formatInvitationExpiry(invitation.expiresAt),
            })}
          </span>
        </div>
        <form action={formAction} className="flex shrink-0 flex-col items-end gap-1">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <div className="flex gap-2">
            <Button
              type="submit"
              name="response"
              value="decline"
              size="sm"
              variant="outline"
              disabled={isPending}
            >
              {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
              {strings.invitation.inbox.declineButton}
            </Button>
            <Button type="submit" name="response" value="accept" size="sm" disabled={isPending}>
              {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
              {strings.invitation.inbox.acceptButton}
            </Button>
          </div>
          {state.formError && (
            <p role="alert" className="text-xs text-destructive">
              {state.formError}
            </p>
          )}
        </form>
      </CardHeader>
    </Card>
  );
}
