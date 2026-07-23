import { CalendarDays, Users } from "lucide-react";

import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { StatePreview } from "@/components/sample/StatePreview";
import { AppShell } from "@/components/shell/AppShell";
import type { AuthSession } from "@/components/shell/auth-session";
import { HeaderNav } from "@/components/shell/HeaderNav";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import { PageHeader } from "@/components/shell/PageHeader";
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
import { CREW_PALETTE, crewCertaintyVars } from "@/lib/crew-palette";
import { strings } from "@/lib/strings";

import type { CSSProperties, ReactNode } from "react";

/**
 * `/sample` 컴포넌트 쇼케이스 (Task 011 → 디자인 개편에서 Task 012 구조로 확장).
 *
 * 카테고리 섹션 + 상단 앵커 내비 구조다. **컴포넌트를 새로 만들면 여기 등록한다** — 테스트
 * 러너가 없는 동안 이 페이지가 유일한 회귀 확인 지점이다(R-002, CON-09).
 *
 * **문자열 경계(팀장 판정 완료, 2026-07-24)**: 아래 섹션 제목·설명·상태 토글 라벨은 `strings`
 * 모듈을 거치지 않는다 — `/sample`은 SC-01~22 제품 화면이 아니라 내부 개발 도구 페이지라
 * NFR-023(사용자 노출 문자열 분리) 적용 대상 밖이다. **단, 이 페이지가 렌더링하는 실제 제품
 * 컴포넌트(`HeaderNav`·`PageHeader` 등)에 주입하는 문구는 예외 없이 `strings`를 거친 값이어야
 * 한다** — 쇼케이스 크롬과 제품 컴포넌트 문구를 혼동하지 말 것.
 */

const GUEST: AuthSession = { status: "guest" };
const LOADING: AuthSession = { status: "loading" };
const AUTHED: AuthSession = {
  status: "authenticated",
  // src/lib/data/mock/fixtures.ts의 시드 profile-1과 값을 맞췄다(get-auth-session.ts와 동일 관례).
  profileId: "profile-1",
  displayName: "테스터",
  hasCompletedOnboarding: true,
  unreadNotificationCount: 3,
};
const AUTHED_EMPTY: AuthSession = { ...AUTHED, unreadNotificationCount: 0 };
// RLS 403류 도메인 오류(D-030 ③) — 네트워크 실패가 아니라 "접근 권한 없음"으로 세션 조회가
// 실패한 경우를 흉내낸다. 셸은 크래시하지 않고 게스트 안전값으로 내비게이션을 내려야 한다.
const SESSION_ERROR: AuthSession = { status: "error", reason: "forbidden" };

const SECTIONS = [
  { id: "foundation", label: "기반" },
  { id: "certainty", label: "확정성 스케일" },
  { id: "shell", label: "앱 셸" },
  { id: "primitives", label: "원자 컴포넌트" },
] as const;

export default function SamplePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
          내부 개발 도구
        </span>
        <h1 className="text-3xl font-semibold text-foreground">컴포넌트 쇼케이스</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          이 앱의 디자인 언어는 <strong className="font-medium text-foreground">잉크와 확정성</strong>
          입니다. 화면의 유채색은 크루 12색이 전부 가져가고 UI 크롬은 잉크 뉴트럴로 물러납니다.
          그리고 <strong className="font-medium text-foreground">확실할수록 색이 찹니다</strong> —
          제안은 점선, 확정은 채움. 근거와 수치는{" "}
          <code className="font-mono text-xs">docs/design/design-language.md</code>에 있습니다.
        </p>
      </header>

      <nav
        aria-label="섹션 바로가기"
        className="sticky top-14 z-30 -mx-4 flex flex-wrap gap-1 border-y border-border bg-background/85 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <FoundationSection />
      <CertaintySection />
      <ShellSection />
      <PrimitivesSection />
    </main>
  );
}

/* ── 섹션 공통 크롬 ────────────────────────────────────────────────────── */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Item({
  name,
  note,
  children,
}: {
  name: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        {/* 모노를 쓰지 않는다 — Geist Mono에는 한글 글리프가 없어서 "시맨틱 색"처럼 한글이 든
            제목은 OS 폰트로 폴백되고, 같은 줄에서 서체가 갈린다. 모노는 숫자·기호·라틴
            식별자에만 쓴다(`globals.css`의 `--font-mono` 주석 참고). */}
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        {note && <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{note}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── 기반: 색·타이포 ───────────────────────────────────────────────────── */

const SEMANTIC_SWATCHES = [
  { token: "background", cls: "bg-background", note: "무채·불변 (팔레트 대비 기준면)" },
  { token: "card", cls: "bg-card", note: "크루색을 놓아도 되는 표면" },
  { token: "muted", cls: "bg-muted", note: "크루색 금지 (실측 2.99)" },
  { token: "accent", cls: "bg-accent", note: "hover·선택 배경" },
  { token: "border", cls: "bg-border", note: "경계" },
  { token: "muted-foreground", cls: "bg-muted-foreground", note: "보조 문구 5.28:1" },
  { token: "foreground", cls: "bg-foreground", note: "본문 19.41:1" },
  { token: "primary", cls: "bg-primary", note: "주 버튼" },
  { token: "destructive", cls: "bg-destructive", note: "파괴·오류 6.15:1" },
  { token: "ring", cls: "bg-ring", note: "포커스 7.43:1" },
];

function FoundationSection() {
  return (
    <Section
      id="foundation"
      title="기반"
      description={
        <>
          시맨틱 색 토큰과 조판 규칙입니다. 색 값은 전부{" "}
          <code className="font-mono text-xs">globals.css</code>의 CSS 커스텀 프로퍼티에서 오고,
          라이트·다크가 같은 이름을 공유합니다. 임의 색을 쓰면 다크모드가 따라오지 않습니다.
        </>
      }
    >
      <Item
        name="시맨틱 색"
        note="괄호 안은 흰 배경(라이트) 기준 실측 대비입니다. muted 계열 표면에 크루색을 놓으면 3:1이 깨집니다 — 표면 선택이 규칙인 이유입니다."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SEMANTIC_SWATCHES.map((s) => (
            <div key={s.token} className="flex flex-col gap-1.5">
              <div className={`h-12 rounded-md border border-border ${s.cls}`} />
              <div className="flex flex-col">
                <code className="font-mono text-[11px] text-foreground">{s.token}</code>
                <span className="text-[11px] leading-tight text-muted-foreground">{s.note}</span>
              </div>
            </div>
          ))}
        </div>
      </Item>

      <Separator />

      <Item
        name="조판"
        note="본문은 Noto Sans KR(가변), 수·시각은 Geist Mono입니다. 한글은 낱말 단위로 줄바꿈합니다(word-break: keep-all) — 360px에서 낱말이 한가운데서 잘리지 않습니다."
      >
        <div className="flex flex-col gap-4 rounded-lg border border-border p-5">
          <div>
            <h4 className="text-2xl font-semibold text-foreground">
              이번 주말 등산, 언제가 좋을까요
            </h4>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              제목 · 600 · tracking −0.022em
            </p>
          </div>
          <div>
            <p className="max-w-prose text-sm text-foreground">
              동호회의 모임 일정이 채팅에 묻히지 않도록, 게시글 기반 찬반 투표로 일정을 확정하고
              가결된 일정을 크루 색으로 구분된 통합 캘린더에 자동으로 등록합니다.
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              본문 · 400 · line-height 1.7
            </p>
          </div>
          <div>
            <p className="tnum font-mono text-sm text-foreground">
              2026-08-14 19:30 · 찬성 12 / 반대 3 · 정족수 9
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              수·시각 · Geist Mono · tabular-nums
            </p>
          </div>
        </div>
      </Item>
    </Section>
  );
}

/* ── 확정성 스케일 (시그니처) ──────────────────────────────────────────── */

const CERTAINTY_STEPS = [
  {
    key: "draft",
    cls: "certainty-draft",
    label: "제안",
    when: "투표 중 · 아직 아무것도 아니다",
  },
  {
    key: "pending",
    cls: "certainty-pending",
    label: "대기",
    when: "정족수 충족, 판정 대기 · 굳어지는 중",
  },
  {
    key: "confirmed",
    cls: "certainty-confirmed",
    label: "확정",
    when: "가결 · 달력에 박혔다",
  },
] as const;

function CertaintySection() {
  return (
    <Section
      id="certainty"
      title="확정성 스케일"
      description={
        <>
          이 제품의 한 줄은 &ldquo;채팅에 묻힌 약속을 투표로 확정해 캘린더에 남긴다&rdquo;입니다.
          그 서사를 <strong className="font-medium text-foreground">채도</strong>에 실었습니다.
          캘린더 셀·투표 카드·Meetup 배지·알림이 전부 같은 세 단계를 씁니다. 채움 위 글자색은
          색마다 다릅니다 — 12색의 휘도가 0.1365~0.2725에 걸쳐 있어 한 가지 글자색으로는 본문
          4.5:1을 맞출 수 없습니다. 어느 쪽을 쓸지는{" "}
          <code className="font-mono text-xs">crew-palette.ts</code>의{" "}
          <code className="font-mono text-xs">textOn</code>이 지정합니다.
        </>
      }
    >
      <Item name="3단계" note="크루 색 없이(무채 폴백) 쓰면 크루 맥락 밖에서도 안전합니다.">
        <div className="flex flex-wrap gap-3">
          {CERTAINTY_STEPS.map((step) => (
            <div key={step.key} className="flex flex-col gap-1.5">
              <span
                className={`${step.cls} inline-flex h-8 items-center rounded-md px-3 text-xs font-medium`}
              >
                {step.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{step.when}</span>
            </div>
          ))}
        </div>
      </Item>

      <Item
        name="크루 12색 × 3단계"
        note="색 순서는 색상환 순서가 아니라 2형 색각 시뮬레이션 CIEDE2000 거리 기준 최원점 정렬입니다(D-026). 같은 날 색이 겹칠 때 걷는 순서라 임의로 정렬하면 안 됩니다."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {CREW_PALETTE.map((color) => {
            const vars = crewCertaintyVars(color.index) as CSSProperties;
            return (
              <div
                key={color.index}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2"
              >
                <code className="tnum w-6 shrink-0 font-mono text-[11px] text-muted-foreground">
                  {String(color.index + 1).padStart(2, "0")}
                </code>
                {CERTAINTY_STEPS.map((step) => (
                  <span
                    key={step.key}
                    style={vars}
                    className={`${step.cls} inline-flex h-7 flex-1 items-center justify-center rounded px-2 text-[11px] font-medium`}
                  >
                    {step.label}
                  </span>
                ))}
                <span className="w-14 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                  {color.textOn}
                </span>
              </div>
            );
          })}
        </div>
      </Item>
    </Section>
  );
}

/* ── 앱 셸 ─────────────────────────────────────────────────────────────── */

function ShellSection() {
  return (
    <Section
      id="shell"
      title="앱 셸"
      description={
        <>
          전역 레이아웃 4종입니다. 셸은 <strong className="font-medium text-foreground">뷰포트</strong>{" "}
          기준(<code className="font-mono text-xs">md:</code>)으로 재배치됩니다 — 헤더 링크↔하단
          탭바 전환은 프레임 폭 토글이 아니라 브라우저 창을 실제로 줄여서 확인하세요.
        </>
      }
    >
      <Item
        name="AppShell"
        note="HeaderNav + 콘텐츠 슬롯 + MobileTabBar 조합. 미리보기 상자가 fixed 요소를 안에 가두므로(PreviewFrame) 실제 페이지 하단의 진짜 탭바와 겹치지 않습니다."
      >
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={360} resizable>
                <AppShell session={AUTHED} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">페이지 콘텐츠 영역</div>
                </AppShell>
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={360} resizable>
                <AppShell session={LOADING} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">페이지 콘텐츠 영역</div>
                </AppShell>
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={360} resizable>
                <AppShell session={AUTHED_EMPTY} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">
                    페이지 콘텐츠 영역 (알림 0건 — 배지 없음)
                  </div>
                </AppShell>
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={360} resizable>
                <AppShell session={SESSION_ERROR} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">페이지 콘텐츠 영역</div>
                </AppShell>
              </PreviewFrame>
            ),
          }}
        />
      </Item>

      <Item
        name="HeaderNav"
        note="768px 이상에서 인라인 링크가 보입니다. 활성 항목은 배경 칠이 아니라 하단 잉크 바로 표시합니다 — 색 면적은 크루 식별에 배정된 자원이라 크롬이 쓰지 않습니다. 배지 숫자는 aria-hidden이고 개수는 링크 이름에 문장으로 붙습니다."
      >
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={64}>
                <HeaderNav session={AUTHED} />
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={64}>
                <HeaderNav session={LOADING} />
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={64}>
                <HeaderNav session={GUEST} />
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={92}>
                <HeaderNav session={SESSION_ERROR} />
              </PreviewFrame>
            ),
          }}
        />
      </Item>

      <Item
        name="MobileTabBar"
        note="360px 뷰포트(NFR-026)의 1차 내비게이션. 게스트 4항목 / 로그인 5항목, 터치 대상 44px(NFR-027). 활성 표시는 탭 상단 잉크 바이고, iOS 홈 인디케이터 영역만큼 아래 여백을 비웁니다."
      >
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={72} width={360}>
                <MobileTabBar session={AUTHED} />
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={72} width={360}>
                <MobileTabBar session={LOADING} />
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={72} width={360}>
                <MobileTabBar session={GUEST} />
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={72} width={360}>
                <MobileTabBar session={SESSION_ERROR} />
              </PreviewFrame>
            ),
          }}
        />
      </Item>

      <Item
        name="PageHeader"
        note='"오류"는 네트워크 실패가 아니라 정원 마감 같은 도메인 오류(D-030 ③)를 예시로 씁니다. 오류는 색만이 아니라 좌측 세로선으로도 표시합니다 — 색각 이상 사용자에게 붉은 글씨는 그냥 글씨입니다(WCAG 1.4.1).'
      >
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={120}>
                <PageHeader
                  eyebrow="주말 등산 크루"
                  title={strings.crew.explore.title}
                  description="공개 크루를 검색하고 둘러볼 수 있어요"
                  backHref="/home"
                  actions={<Button size="sm">크루 만들기</Button>}
                />
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={110}>
                <PageHeader title="" status="loading" />
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={80}>
                <PageHeader title={strings.crew.explore.title} />
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={120}>
                <PageHeader
                  title={strings.meetup.detail.title}
                  status="error"
                  errorMessage={strings.meetup.attendance.full}
                />
              </PreviewFrame>
            ),
          }}
        />
      </Item>
    </Section>
  );
}

/* ── 원자 컴포넌트 ─────────────────────────────────────────────────────── */

function PrimitivesSection() {
  return (
    <Section
      id="primitives"
      title="원자 컴포넌트"
      description={
        <>
          shadcn/ui 레지스트리에서 설치한 프리미티브입니다. 새 UI 요소가 필요하면{" "}
          <strong className="font-medium text-foreground">직접 만들기 전에 레지스트리에서 먼저 찾습니다</strong>{" "}
          — 손으로 다시 짜면 접근성 처리와 다크모드 토큰 연결을 매번 새로 검증해야 합니다.
        </>
      }
    >
      <Item name="Button" note="크기 5종 · 변형 6종. 주 버튼은 잉크, 파괴 동작만 유채색입니다.">
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
      </Item>

      <Item name="Badge" note="알림 개수처럼 숫자를 담을 때는 모노 + tabular-nums를 함께 씁니다.">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-4">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="outline">외곽선</Badge>
          <Badge variant="destructive" className="tnum font-mono">
            3
          </Badge>
        </div>
      </Item>

      <Item name="Card" note="크루 카드·Meetup 카드의 기반. 크루색을 놓아도 되는 표면입니다.">
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
      </Item>

      <Item name="Skeleton · Avatar · Separator">
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
      </Item>

      <Item
        name="Empty"
        note="빈 화면은 분위기가 아니라 방향입니다 — 다음에 할 일을 제시합니다."
      >
        <StatePreview
          panels={{
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
          }}
        />
      </Item>
    </Section>
  );
}
