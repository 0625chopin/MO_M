"use client";

import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

import { THEME_OPTIONS, type Theme } from "./theme-config";
import { useTheme } from "./ThemeProvider";

/** 각 모드의 아이콘 — 트리거는 현재 "모드"를, 목록은 각 선택지를 이 아이콘으로 나타낸다. */
const OPTION_ICON: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * 하이드레이션 완료 여부. SSR과 첫 클라이언트 렌더에서는 `false`(getServerSnapshot)로 통일하고,
 * mount 후에만 `true`가 된다 — `use-media-query.ts`와 같은 `useSyncExternalStore` 관례로,
 * 이펙트 안 setState(cascading render 경고) 없이 SSR 안전한 mount 감지를 얻는다.
 */
const subscribeNoop = () => () => {};

/**
 * 라이트/다크/시스템 3-모드 테마 선택기. 헤더 우측에 아이콘 버튼으로 앉고, 열면 세 모드를
 * 단일 선택한다. 트리거 아이콘은 사용자의 **선택**(밝게=해·어둡게=달·시스템=모니터)을 나타낸다 —
 * 해석된 실제 외형이 아니라 선택 모드를 그대로 보여줘야 "시스템"을 골랐다는 사실이 드러난다.
 *
 * SSR은 항상 "system"으로 렌더되므로(`ThemeProvider` 주석) mount 전에는 서버와 동일하게 그려
 * 하이드레이션 불일치를 피하고, mount 후 실제 선택으로 바꾼다. 아이콘만 있는 트리거라 접근성
 * 이름은 `aria-label`이 유일한 이름이다(`common.a11y.showPassword`와 같은 처리).
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const current: Theme = hydrated ? theme : "system";
  const TriggerIcon = OPTION_ICON[current];

  return (
    <Popover>
      <PopoverTrigger
        aria-label={strings.common.theme.toggleLabel}
        render={
          <Button variant="ghost" size="icon">
            <TriggerIcon aria-hidden="true" className="size-4.5" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-44 gap-1 p-1.5">
        <PopoverTitle className="px-2 py-1 text-xs text-muted-foreground">
          {strings.common.theme.label}
        </PopoverTitle>
        <div role="group" aria-label={strings.common.theme.label} className="flex flex-col gap-0.5">
          {THEME_OPTIONS.map((option) => {
            const Icon = OPTION_ICON[option];
            const active = current === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setTheme(option)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                <span className="flex-1">{strings.common.theme[option]}</span>
                {active && <Check aria-hidden="true" className="size-4" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
