"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

import { getAccountNavItems, getPrimaryNavItems, type NavItem } from "./nav-items";

import type { AuthSession } from "./auth-session";

/**
 * 전역 헤더 내비게이션(PRD §5 "헤더 — 전역 공통"). 표현 컴포넌트 — 세션은 props로만 받는다
 * (D-030 ①). 인증 상태 판정·조회는 `src/app/layout.tsx`가 `getAuthSession()`으로 수행한다.
 *
 * 데스크톱(md 이상)에서만 링크 목록을 인라인으로 보여준다. 360px 뷰포트(NFR-026)에서는 로고만
 * 남기고 나머지는 `MobileTabBar`가 맡는다 — 같은 항목을 두 군데 중복 렌더링하지 않기 위해서다.
 *
 * `usePathname`(클라이언트 전용 훅)을 쓰므로 `'use client'`가 필요하다. 이건 `lib/data`·
 * `lib/realtime` 같은 도메인 데이터 조회가 아니라 순수 내비게이션 UI 상태라 D-030 ①이 금지하는
 * "표현 컴포넌트의 데이터 조회"에 해당하지 않는다.
 */
export function HeaderNav({ session }: { session: AuthSession }) {
  const pathname = usePathname();
  const homeHref = session.status === "authenticated" ? "/home" : "/";

  if (session.status === "loading") {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4" aria-busy="true">
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          <div className="hidden flex-1 items-center gap-3 md:flex">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </header>
    );
  }

  const primaryItems = getPrimaryNavItems(session);
  const accountItems = getAccountNavItems(session);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      {session.status === "error" && (
        <p
          role="alert"
          className="bg-destructive/10 px-4 py-1.5 text-center text-xs text-destructive"
        >
          {session.reason === "forbidden"
            ? strings.error.forbidden.title
            : strings.error.network.title}
        </p>
      )}
      <div className="flex h-14 items-center gap-6 px-4">
        <Link
          href={homeHref}
          className="shrink-0 rounded-md text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {strings.common.appName}
        </Link>

        <nav
          aria-label={strings.common.a11y.primaryNav}
          className="hidden flex-1 items-center gap-1 md:flex"
        >
          {primaryItems.map((item) => (
            <NavLink key={item.key} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <nav
          aria-label={strings.common.a11y.accountNav}
          className="hidden items-center gap-1 md:flex"
        >
          {accountItems.map((item) => (
            <NavLink key={item.key} item={item} active={pathname === item.href} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      {item.label}
      {!!item.badgeCount && item.badgeCount > 0 && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white"
        >
          {item.badgeCount > 9 ? "9+" : item.badgeCount}
        </span>
      )}
    </Link>
  );
}
