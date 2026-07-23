"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { strings } from "@/lib/strings";
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
 */
export function MobileTabBar({ session }: { session: AuthSession }) {
  const pathname = usePathname();

  if (session.status === "loading") {
    return (
      <nav
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-border bg-background md:hidden"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center justify-center">
            <div className="size-6 animate-pulse rounded-full bg-muted" />
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
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden"
    >
      {items.map((item) => (
        <TabLink key={item.key} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        <Icon aria-hidden="true" className="size-5" />
        {!!item.badgeCount && item.badgeCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-semibold text-white"
          >
            {item.badgeCount > 9 ? "9+" : item.badgeCount}
          </span>
        )}
      </span>
      {item.label}
    </Link>
  );
}
