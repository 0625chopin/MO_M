"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  isTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type Theme,
} from "./theme-config";

import type { ReactNode } from "react";

interface ThemeContextValue {
  /** 사용자가 고른 모드(시스템 포함). */
  theme: Theme;
  /** 실제 적용된 외형 — "시스템"일 때 OS 설정을 해석한 결과. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * 명시적 테마 토글의 상태 소유자 — CLAUDE.md에서 Task 011(DESIGN)로 이월돼 있던 ThemeProvider다.
 * 색 토큰·클래스 규칙은 `theme-config.ts`와 `globals.css`가 정의하고, 이 컴포넌트는 선택값을
 * localStorage에 저장하고 `<html>` 클래스를 갱신하는 역할만 한다.
 *
 * 자신은 테마 의존 마크업을 렌더링하지 않고 자식을 그대로 통과시키므로 SSR/하이드레이션 불일치를
 * 만들지 않는다 — 초기 상태를 클라이언트에서 localStorage로 즉시 읽어도 안전하다. 아이콘처럼
 * 테마에 따라 달라지는 표시는 소비처(`ThemeToggle`)가 mount 가드로 처리한다.
 *
 * 수동 `useMemo`/`useCallback`을 쓰지 않는다(D-029) — `setTheme`은 useState가 돌려주는 안정된
 * 참조이고, context value 객체 재생성 비용은 이 트리 깊이에서 측정할 만한 부하가 아니다.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // SSR 시점에는 항상 "system"으로 렌더한다(window 없음). 이 컴포넌트는 테마 의존 DOM을 만들지
    // 않으므로 클라이언트 초기값이 달라도 하이드레이션 불일치가 나지 않는다.
    if (typeof window === "undefined") return "system";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(stored)) return stored;
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) — 기본값으로 진행.
    }
    return "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved: ResolvedTheme =
        theme === "system" ? (mql.matches ? "dark" : "light") : theme;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };

    apply();
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // 저장 실패는 무시 — 이번 세션에는 반영되고 다음 방문에만 초기화된다.
    }

    // "시스템" 모드에서만 OS 설정 변화를 실시간으로 따라간다. 명시 선택 모드에서는 OS가 바뀌어도
    // 사용자의 선택을 유지한다.
    if (theme === "system") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme는 ThemeProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
