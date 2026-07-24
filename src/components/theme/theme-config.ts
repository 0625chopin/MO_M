/**
 * 테마(라이트/다크/시스템) 설정의 단일 소스. FOUC 방지 인라인 스크립트(`THEME_INIT_SCRIPT`)와
 * `ThemeProvider`가 이 값을 공유한다 — 저장 키·클래스 규칙이 어긋나면 새로고침 때 화면이 잠깐
 * 반대 테마로 번쩍인다.
 *
 * 모델은 shadcn 표준 `.dark` 클래스 variant를 그대로 쓴다(`globals.css`의
 * `@custom-variant dark (&:is(.dark *))`). 명시 선택은 `<html>`에 `.light`/`.dark` 클래스로
 * 박고, "시스템"은 OS 설정을 `matchMedia`로 해석해 둘 중 하나를 박는다 — 그래야 `dark:` 접두
 * Tailwind 유틸리티(button 등 shadcn 컴포넌트가 실제로 쓴다)까지 OS 다크에서 정상 동작한다.
 * `globals.css`의 `@media (prefers-color-scheme: dark)` 폴백은 이 스크립트가 아직 돌지 않은
 * no-JS 구간의 안전망일 뿐이라 `:root:not(.light):not(.dark)`로 좁혀 두었다.
 */
export const THEME_STORAGE_KEY = "mo_im-theme";

/** 사용자가 고를 수 있는 모드. "system"은 OS 설정을 따른다. */
export type Theme = "light" | "dark" | "system";
/** 실제 적용된 외형 — "system"을 OS 설정으로 해석한 결과. */
export type ResolvedTheme = "light" | "dark";

/** 토글 UI가 표시하는 선택지 순서. */
export const THEME_OPTIONS: readonly Theme[] = ["light", "dark", "system"];

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * body 최상단에서 React 하이드레이션 이전에 **동기 실행**되는 스크립트. 저장된 선택(없으면 OS
 * 설정)을 읽어 `<html>`에 `.light`/`.dark`를 즉시 박아 FOUC를 막는다. 문자열로 주입되므로 이
 * 파일의 다른 심볼을 참조하지 않는다 — 저장 키만 리터럴로 끼워 넣는다(`ThemeProvider`의 적용
 * 로직과 규칙이 반드시 일치해야 한다).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var t=localStorage.getItem(k);var d=t==="dark"||((t==="system"||!t)&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(d?"dark":"light");}catch(e){}})();`;
