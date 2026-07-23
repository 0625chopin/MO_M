# `src/components/`

- **`ui/`**: shadcn/ui 원시 컴포넌트. CREW 담당(`components.json`과 함께 관리).
- **`<domain>/`**: 도메인별 컴포넌트(예: `crews/`, `polls/`, `chat/`, `calendar/`). FR 단위로
  구현을 시작하는 팀원이 그때 만든다 — 이 Task에서는 예시 없이 규칙만 정한다.
  - `<Name>.tsx`: **표현** 컴포넌트. 데이터를 props로만 받는다. `@/lib/data`·`@/lib/realtime`·
    Supabase 클라이언트를 import하지 않는다(D-030 ①, `eslint.config.mjs` zone 4로 강제).
  - `<Name>Container.tsx`: **컨테이너** 컴포넌트. 데이터 조회·구독을 소유하고 표현 컴포넌트에
    props로 내려준다. `@/lib/data`·`@/lib/realtime` 배럴은 쓸 수 있지만 구현체(`mock/`·
    `supabase/`·`mock.ts`·`broadcast.ts`)를 직접 import하지 않는다(zone 5로 강제).

새 컴포넌트를 만들 때마다 `src/app/sample/page.tsx` 쇼케이스에 등록하고, **기본·로딩·빈·오류**
4상태를 토글로 노출한다(`CLAUDE.md` Mock First 개발, D-030 ③ — "오류"에 RLS 403·정원 마감·동시
수정 충돌 같은 도메인 오류를 포함).

자세한 배치 원칙과 ESLint 경계 규칙 표는 [`docs/CONVENTIONS.md`](../../docs/CONVENTIONS.md) 참고.
