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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  ],
});
