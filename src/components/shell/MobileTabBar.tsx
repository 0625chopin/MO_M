"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { strings, t } from "@/lib/strings";
import { cn } from "@/lib/utils";

import { getAccountNavItems, getPrimaryNavItems, type NavItem } from "./nav-items";

import type { AuthSession } from "./auth-session";

/**
 * 360px 뷰포트(NFR-026)의 1차 내비게이션. `md` 이상에서는 `HeaderNav`가 같은 정보를 인라인
 * 링크로 이미 보여주므로 숨긴다(`md:hidden`) — 항목을 두 군데서 중복 렌더링하지 않는다.
 *
 * 게스트는 홈·크루 탐색·로그인·회원가입 4항목, 로그인 사용자는 홈·크루 탐색·캘린더·알림·
 * 계정 설정 5항목이다(계정 메뉴 전체를 담을 팝오버 컴포넌트가 아직 없어 — Task 013 — 계정
 * 진입점으로 계정 설정 하나만 노출한다).
 *
 * 터치 대상은 44×44 CSS px 권장(NFR-027)을 만족하도록 `min-h-11`을 준다.
 *
 * **디자인 개편에서 바뀐 것**
 * - 스켈레톤·배지를 shadcn 프리미티브로 교체하고, 배지 개수를 스크린 리더에 문장으로 전달한다.
 * - 활성 표시를 **상단 잉크 바**로 세웠다(`HeaderNav`의 하단 바와 대칭 — 둘 다 화면 바깥쪽
 *   가장자리에 붙는다). 색 면적을 크루 팔레트에 남겨 두려는 같은 이유다.
 * - iOS 홈 인디케이터 영역을 피하도록 `env(safe-area-inset-bottom)`만큼 아래 여백을 준다.
 *   이게 없으면 실제 아이폰에서 마지막 탭의 라벨이 제스처 바에 가린다. `AppShell`의 콘텐츠
 *   하단 여백도 같은 값을 더해 맞춰 놨다.
 */
export function MobileTabBar({ session }: { session: AuthSession }) {
  const pathname = usePathname();

  if (session.status === "loading") {
    return (
      <nav
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center justify-center">
            <Skeleton className="size-6 rounded-full" />
          </div>
        ))}
      </nav>
    );
  }

  const primaryItems = getPrimaryNavItems(session);
  const accountItems = getAccountNavItems(session);
  const items =
    session.status === "authenticated"
      ? [...primaryItems, accountItems[0]]
      : [...primaryItems, ...accountItems];

  return (
    <nav
      aria-label={strings.common.a11y.primaryNav}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map((item) => (
        <TabLink key={item.key} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const count = item.badgeCount ?? 0;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
        // 활성 표시는 탭 상단 가장자리의 잉크 바.
        "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:rounded-full before:bg-foreground before:opacity-0 before:transition-opacity",
        active ? "text-foreground before:opacity-100" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        <Icon aria-hidden="true" className="size-5" />
        {count > 0 && (
          <Badge
            aria-hidden="true"
            variant="destructive"
            className="absolute -top-1.5 -right-2 h-3.5 min-w-3.5 px-1 font-mono text-[9px] leading-none tnum"
          >
            {count > 9 ? "9+" : count}
          </Badge>
        )}
      </span>
      {item.label}
      {count > 0 && (
        <span className="sr-only">{t((s) => s.common.a11y.unreadCount, { n: count })}</span>
      )}
    </Link>
  );
}
