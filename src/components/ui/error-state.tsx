"use client"

import { AlertTriangleIcon } from "lucide-react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { strings } from "@/lib/strings"
import { cn } from "@/lib/utils"

/**
 * 원자 15종의 마지막 하나(Task 013). `RouteErrorBoundary`(`src/components/errors/`)가
 * **전체 화면**(`error.tsx`·`not-found.tsx`) 오류를 다루는 것과 달리, 이 컴포넌트는 **섹션
 * 하나**(카드·패널·목록 한 칸)가 실패했을 때 그 자리만 채우는 인라인 오류다 — 예: 캘린더
 * 페이지는 정상인데 이번 달 MeetupBar 로드만 실패한 경우.
 *
 * shadcn `alert`(`role="alert"`, 즉 assertive live region)을 그대로 쓴다 — 동적으로 나타나는
 * 오류는 별도 배선 없이 보조기술에 즉시 안내된다(NFR-021). 아이콘 + 텍스트를 함께 써서 색
 * 하나로만 오류를 전달하지 않는다(WCAG 1.4.1) — `PageHeader` 오류의 "좌측 세로선 + 색" 패턴과
 * 같은 이유다.
 */
export interface ErrorStateProps {
  title: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

function ErrorState({ title, description, onRetry, retryLabel, className }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn(onRetry && "pr-20", className)}>
      <AlertTriangleIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {onRetry && (
        <AlertAction>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {retryLabel ?? strings.common.actions.retry}
          </Button>
        </AlertAction>
      )}
    </Alert>
  )
}

export { ErrorState }
