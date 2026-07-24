"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { closePollEarlyAction } from "@/lib/actions/close-poll";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

export interface PollEarlyCloseControlProps {
  crewId: Id;
  pollId: Id;
}

/**
 * 투표 조기 종료 트리거(D-003 종료 트리거②, FR-043 AC3)의 유일한 호출부 —
 * `closePollEarlyAction`의 모듈 docstring이 이 컴포넌트를 그렇게 지목한다. `PollPanel`이
 * `poll.canCloseEarly`(제안자 본인 또는 임원 이상, `poll:close_early` 판정 결과)일 때만
 * 렌더한다 — 이 컴포넌트 자체는 권한을 다시 판정하지 않는다(D-030 ①, NFR-036).
 *
 * `PostActions`의 삭제 확인 Dialog와 같은 형태(Dialog 확인 → `useTransition` 직접 호출) —
 * 성공하면 `closePollEarlyAction` 안의 `refresh()`가 `PollPanelContainer`를 다시 그려 poll이
 * 종료 상태로 바뀌고, 그 결과 `poll.canCloseEarly`가 `false`가 되어 이 컴포넌트 자체가
 * 트리에서 사라진다 — 로컬 상태로 Dialog를 닫는 후처리를 따로 하지 않는다
 * (`docs/CONVENTIONS.md` "Server Action 폼 상태 관리").
 *
 * Server Function은 UI를 거치지 않고 직접 호출될 수 있으므로 `closePollEarlyAction`이 권한·
 * 종료 여부를 서버에서 다시 판정한다 — 이 버튼은 "겉보기 허용"일 뿐이고, 실패하면
 * `result.error.message`를 그대로 보여준다(예: 이미 종료됨, 권한 없음).
 */
export function PollEarlyCloseControl({ crewId, pollId }: PollEarlyCloseControlProps) {
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleConfirm() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await closePollEarlyAction({ crewId, pollId });
      if (!result.ok) {
        setErrorMessage(result.error.message || strings.vote.earlyClose.forbidden);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Dialog>
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
          {strings.vote.earlyClose.trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{strings.vote.earlyClose.confirmTitle}</DialogTitle>
            <DialogDescription>{strings.vote.earlyClose.confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {strings.vote.earlyClose.cancelAction}
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirm} disabled={pending}>
              {pending ? strings.vote.earlyClose.pending : strings.vote.earlyClose.confirmAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {errorMessage && (
        <ErrorState title={strings.error.conflict.title} description={errorMessage} />
      )}
    </div>
  );
}
