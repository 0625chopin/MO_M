"use client";

import { Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decideJoinRequestAction, type DecideJoinRequestFormState } from "@/lib/actions/decide-join-request";
import { strings } from "@/lib/strings";
import type { Id, JoinRequestStatus } from "@/lib/types";

import type { JoinRequestRowViewModel } from "./crew-member-view-models";

const INITIAL_DECIDE_STATE: DecideJoinRequestFormState = {};

const HISTORY_BADGE_VARIANT: Record<Exclude<JoinRequestStatus, "pending">, "default" | "secondary" | "outline"> = {
  approved: "default",
  rejected: "outline",
  withdrawn: "secondary",
};

export interface JoinRequestPanelProps {
  crewId: Id;
  pending: JoinRequestRowViewModel[];
  /** 승인·반려·철회 이력 — `pending`이 아닌 신청 전부(FR-023, I-040). */
  history: JoinRequestRowViewModel[];
}

/**
 * FR-023 가입 신청 승인/반려 탭(Task 017A, D-030 ①). "대기 중" 탭은 오너·임원만 렌더되도록
 * `CrewMembersContainer`가 `canApprove`일 때만 이 컴포넌트를 그린다 — 이 컴포넌트 자신은 그
 * 권한 판정을 다시 하지 않는다(R-015, 판정은 `decideJoinRequestAction`이 서버에서 다시 확인).
 *
 * **"처리 내역" 탭이 I-040을 해소한다** — `JoinRequest.status`의 `withdrawn`을 `rejected`와
 * 같은 배지·문구로 뭉개지 않고 "철회함"으로 따로 보여준다. 신청자 본인이 끝낸 건과 오너·임원이
 * 반려한 건을 관리자가 한눈에 구분할 수 있다.
 */
export function JoinRequestPanel({ crewId, pending, history }: JoinRequestPanelProps) {
  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">
          {strings.crew.members.requests.pendingTab}
          {pending.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {pending.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="history">{strings.crew.members.requests.historyTab}</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="flex flex-col gap-2 pt-3">
        {pending.length === 0 ? (
          <Empty className="rounded-xl border border-dashed border-border p-4">
            <EmptyHeader>
              <EmptyTitle>{strings.crew.members.requests.pendingEmpty}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.map((request) => (
              <li key={request.id}>
                <PendingRequestCard crewId={crewId} request={request} />
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="history" className="flex flex-col gap-2 pt-3">
        {history.length === 0 ? (
          <Empty className="rounded-xl border border-dashed border-border p-4">
            <EmptyHeader>
              <EmptyTitle>{strings.crew.members.requests.historyEmpty}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((request) => (
              <li key={request.id}>
                <HistoryRequestCard request={request} />
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}

function RequesterHeader({ request }: { request: JoinRequestRowViewModel }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar size="sm">
        {request.requesterAvatarUrl && <AvatarImage src={request.requesterAvatarUrl} alt="" />}
        <AvatarFallback>{request.requesterDisplayName.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-foreground">{request.requesterDisplayName}</span>
        <span className="truncate text-sm text-muted-foreground">@{request.requesterHandle}</span>
        {request.message && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {strings.crew.members.requests.messageLabel}: {request.message}
          </p>
        )}
      </div>
    </div>
  );
}

function PendingRequestCard({ crewId, request }: { crewId: Id; request: JoinRequestRowViewModel }) {
  const [state, formAction, isPending] = useActionState(decideJoinRequestAction, INITIAL_DECIDE_STATE);

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <RequesterHeader request={request} />
        <form action={formAction} className="flex shrink-0 flex-col items-end gap-1">
          <input type="hidden" name="crewId" value={crewId} />
          <input type="hidden" name="joinRequestId" value={request.id} />
          <div className="flex gap-2">
            <Button type="submit" name="decision" value="rejected" size="sm" variant="outline" disabled={isPending}>
              {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
              {strings.crew.members.requests.rejectButton}
            </Button>
            <Button type="submit" name="decision" value="approved" size="sm" disabled={isPending}>
              {isPending && <Loader2Icon aria-hidden="true" className="animate-spin" />}
              {strings.crew.members.requests.approveButton}
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

function HistoryRequestCard({ request }: { request: JoinRequestRowViewModel }) {
  if (request.status === "pending") return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <RequesterHeader request={request} />
        <Badge variant={HISTORY_BADGE_VARIANT[request.status]} className="shrink-0">
          {strings.crew.members.requests.status[request.status]}
        </Badge>
      </CardHeader>
    </Card>
  );
}
