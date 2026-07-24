import { defineSection } from "@/components/sample/showcase-types";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/* ── 테마 ──────────────────────────────────────────────────────────────── */

export const themeSection = defineSection({
  id: "theme",
  label: "테마",
  title: "테마 토글",
  description: (
    <>
      명시적 테마 선택기입니다(Task 011에서 이월). 라이트·다크·시스템 3-모드를 고르면{" "}
      <code className="font-mono text-xs">&lt;html&gt;</code>에{" "}
      <code className="font-mono text-xs">.light</code>/<code className="font-mono text-xs">.dark</code>{" "}
      클래스가 붙고, 선택은 <code className="font-mono text-xs">localStorage</code>에 저장됩니다.
      시스템 모드는 OS 설정을 따르며 OS를 바꾸면 실시간으로 반영됩니다. 이 토글은{" "}
      <strong className="font-medium text-foreground">앱 전역과 같은 상태를 공유</strong>하므로,
      여기서 바꾸면 헤더 토글과 이 페이지의 모든 컴포넌트가 함께 바뀝니다.
    </>
  ),
  items: [
    {
      name: "ThemeToggle",
      note: "헤더 우측에 실제로 앉는 토글과 동일한 컴포넌트입니다. 아이콘만 있는 트리거라 aria-label(\"테마 변경\")이 유일한 접근성 이름이고, 세 선택지는 단일 선택 라디오처럼 동작하며 활성 항목에 체크가 붙습니다. 눌러 보면 이 페이지 전체가 라이트/다크로 전환됩니다 — 색 토큰이 전부 globals.css의 커스텀 프로퍼티라 컴포넌트를 고치지 않고 테마만 갈아끼웁니다.",
      content: (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
          <ThemeToggle />
          <p className="text-sm text-muted-foreground">
            우측 아이콘 버튼을 눌러 밝게·어둡게·시스템을 전환하세요.
          </p>
        </div>
      ),
    },
  ],
});
