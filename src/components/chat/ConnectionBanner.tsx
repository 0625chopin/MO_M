"use client";

import { Loader2Icon, WifiOffIcon } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ChatConnectionStatus } from "@/lib/rules/chat-connection-state";
import { strings } from "@/lib/strings";

export interface ConnectionBannerProps {
  status: ChatConnectionStatus;
  /** `status === "disconnected"`일 때만 의미가 있다 — 사용자가 수동으로 재연결을 다시 시도한다. */
  onRetry?: () => void;
}

/**
 * 채팅 실시간 연결 상태 배너(FR-051 E2, NFR-009) — 순수 표현 컴포넌트(D-030 ①). `lib/data`·
 * `lib/realtime`을 import하지 않는다. `status`는 `MessageRoomContainer`가 브라우저
 * online/offline 이벤트 + 구독 `onError`(D-030 ③)를 `lib/rules/chat-connection-state.ts`의
 * 상태 기계로 판정해 내려주는 **실제 프로덕션 값**이다.
 *
 * **`/sample` 전용 prop 패턴(`DayDetailPanel`의 `status?: "default"|"loading"|"error"`)을 쓰지
 * 않는다** — 020B 팀장 특별 지시에 대한 판단이다. `DayDetailPanel`이 그 패턴을 쓴 이유는
 * 프로덕션 호출부(`MonthCalendar`)가 항상 `status`를 생략해 실제로는 도달하지 않는 상태를
 * `/sample` 정적 데모만을 위해 만들어야 했기 때문이다(오버레이라 열림 자체를 트리거해야 해서
 * 표현 컴포넌트 바깥에서 상태를 흉내 낼 수 없었다). 이 배너는 정반대다 — `status`가 오버레이가
 * 아니라 평범한 인라인 요소의 데이터 prop이고, 프로덕션 컨테이너가 세 값을 실제로 전부 만들어
 * 내려준다. 그래서 `/sample`도 같은 방식으로 `status`에 다른 리터럴을 넣기만 하면 3상태를 그대로
 * 보여줄 수 있다 — 팀장이 제시한 기준("상태 기계를 props로 주입할 수 있으면 그게 낫다") 그대로다.
 * 두 번째 사례를 만든 게 아니므로 `docs/CONVENTIONS.md`에 관례를 정식화하지 않았다.
 *
 * `"connected"`일 때는 아무것도 그리지 않는다 — 문제가 없으면 배너가 없는 것이 채팅 UX
 * 관례다(끊겼다가 복구됐을 때만 잠깐 나타나고 사라진다). `"reconnecting"`은 진행 상태를
 * `role="status"`(정중한 live region)로, `"disconnected"`는 `role="alert"`(즉시 알림, `Alert`
 * 기본값)로 알린다 — 후자만 사용자의 흐름을 끊을 만큼 중요하다.
 */
export function ConnectionBanner({ status, onRetry }: ConnectionBannerProps) {
  if (status === "connected") return null;

  if (status === "reconnecting") {
    return (
      <Alert role="status" className="rounded-none border-x-0 border-t-0">
        <Loader2Icon aria-hidden="true" className="animate-spin" />
        <AlertTitle>{strings.chat.room.reconnecting}</AlertTitle>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
      <WifiOffIcon aria-hidden="true" />
      <AlertTitle>{strings.chat.room.connectionErrorTitle}</AlertTitle>
      <AlertDescription>{strings.chat.room.connectionErrorDescription}</AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {strings.common.actions.retry}
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
