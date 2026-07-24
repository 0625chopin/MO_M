import { CalendarDays, Users } from "lucide-react";

import { defineSection } from "@/components/sample/showcase-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ErrorState } from "@/components/ui/error-state";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { crewCertaintyVars } from "@/lib/crew-palette";
import { strings } from "@/lib/strings";

import type { CSSProperties } from "react";

/* ── 원자 컴포넌트 ─────────────────────────────────────────────────────── */

export const primitivesSection = defineSection({
  id: "primitives",
  label: "원자 컴포넌트",
  title: "원자 컴포넌트",
  description: (
    <>
      shadcn/ui 레지스트리에서 설치한 프리미티브입니다. 새 UI 요소가 필요하면{" "}
      <strong className="font-medium text-foreground">직접 만들기 전에 레지스트리에서 먼저 찾습니다</strong>{" "}
      — 손으로 다시 짜면 접근성 처리와 다크모드 토큰 연결을 매번 새로 검증해야 합니다.
    </>
  ),
  items: [
    {
      name: "Button",
      note: "크기 5종 · 변형 6종. 주 버튼은 잉크, 파괴 동작만 유채색입니다.",
      content: (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-4">
          <Button>확정하기</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="outline">외곽선</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="destructive">삭제</Button>
          <Button variant="link">링크</Button>
          <Button size="sm">작게</Button>
          <Button disabled>비활성</Button>
        </div>
      ),
    },
    {
      name: "Badge",
      note: "알림 개수처럼 숫자를 담을 때는 모노 + tabular-nums를 함께 씁니다.",
      content: (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-4">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="outline">외곽선</Badge>
          <Badge variant="destructive" className="tnum font-mono">
            3
          </Badge>
        </div>
      ),
    },
    {
      name: "Card",
      note: "크루 카드·Meetup 카드의 기반. 크루색을 놓아도 되는 표면입니다.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>주말 등산 크루</CardTitle>
              <CardDescription>멤버 24명 · 다음 모임 8월 14일</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              카드 본문 영역입니다.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span
                  style={crewCertaintyVars(6) as CSSProperties}
                  className="certainty-confirmed inline-flex h-6 items-center rounded px-2 text-[11px] font-medium"
                >
                  확정
                </span>
                한강 야간 러닝
              </CardTitle>
              <CardDescription>8월 14일 19:30 · 정원 20명 중 12명</CardDescription>
            </CardHeader>
          </Card>
        </div>
      ),
    },
    {
      name: "Skeleton · Avatar · Separator",
      content: (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>테</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">테스터</span>
              <span className="text-xs text-muted-foreground">주말 등산 크루 · 오너</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Empty",
      note: "빈 화면은 분위기가 아니라 방향입니다 — 다음에 할 일을 제시합니다.",
      panels: {
        empty: (
          <div className="rounded-lg border border-border p-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>아직 소속된 크루가 없어요</EmptyTitle>
                <EmptyDescription>
                  공개 크루를 둘러보거나, 직접 크루를 만들어 첫 모임을 제안해 보세요.
                </EmptyDescription>
              </EmptyHeader>
              <Button size="sm">크루 둘러보기</Button>
            </Empty>
          </div>
        ),
        error: (
          <div className="rounded-lg border border-border p-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarDays />
                </EmptyMedia>
                <EmptyTitle>{strings.error.forbidden.title}</EmptyTitle>
                <EmptyDescription>
                  초대 전용 크루입니다. 크루 임원에게 초대를 요청하세요.
                </EmptyDescription>
              </EmptyHeader>
              <Button size="sm" variant="outline">
                {strings.common.actions.goBack}
              </Button>
            </Empty>
          </div>
        ),
      },
    },
    {
      name: "Tabs",
      note: "shadcn Tabs(Base UI) — roving tabindex로 좌우 화살표가 탭을 옮기고 Tab 키는 패널로 빠져나갑니다. `/sample`의 상태 토글(StatePreview)도 같은 컴포넌트입니다.",
      content: (
        <div className="rounded-lg border border-border p-4">
          <Tabs defaultValue="proposal">
            <TabsList aria-label="게시글 유형">
              <TabsTrigger value="free">자유글</TabsTrigger>
              <TabsTrigger value="proposal">모임 제안</TabsTrigger>
            </TabsList>
            <TabsContent value="free" className="pt-2 text-sm text-muted-foreground">
              자유롭게 쓰는 글입니다. 투표·정원이 없어요.
            </TabsContent>
            <TabsContent value="proposal" className="pt-2 text-sm text-muted-foreground">
              찬반 투표로 확정하는 모임 제안입니다. 정족수를 채우면 판정이 나요.
            </TabsContent>
          </Tabs>
        </div>
      ),
    },
    {
      name: "ErrorState",
      note: "전체 화면 오류(RouteErrorBoundary, '오류 경계' 섹션)와 달리 카드·패널 한 칸이 실패했을 때 그 자리만 채우는 인라인 오류입니다. role=\"alert\"라 나타나는 즉시 보조기술에 안내됩니다(NFR-021).",
      panels: {
        error: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            {/* onRetry는 함수(클로저)라 이 파일(서버 컴포넌트)에서 만들 수 없다 — Client
                Component(ErrorState)에 함수 prop을 서버에서 직접 넘기면 직렬화 경계 위반이다
                (`sections/errors.tsx`의 RouteErrorBoundaryPreview와 같은 이유). retry 동작이
                필요한 실제 화면에서는 컨테이너(클라이언트 경계)가 콜백을 만들어 내려준다. */}
            <ErrorState
              title="이번 달 모임을 불러오지 못했어요"
              description="네트워크 상태를 확인하고 다시 시도해 주세요."
            />
          </div>
        ),
      },
    },
  ],
});
