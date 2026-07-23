# `src/lib/data/`

데이터 접근 레이어 (NFR-034·037). UI 컴포넌트가 데이터를 직접 조회하지 않고 이 레이어를 통하게
해서, Mock ↔ 실데이터 전환 시 "UI 컴포넌트는 수정하지 않고 데이터 조회 부분만 교체"가 실제로
성립하게 만든다(R-003).

- **담당**: CORE, Task 007(데이터 접근 레이어 경계와 Mock 구현, 3~4주차).
- **`index.ts`**: 외부에 노출하는 유일한 진입점(배럴). `mock/`과 `supabase/` 중 하나를
  조립해 내보낸다. 소비자(컴포넌트·Server Action·서버 컴포넌트)는 항상 `@/lib/data`(배럴)를
  import한다 — `@/lib/data/mock/*`나 `@/lib/data/supabase/*`를 직접 import하지 않는다.
  이 규칙은 `eslint.config.mjs`(zone 4·5·6)로 강제된다.
- **`mock/`**: Mock 구현. `supabase/`를 참조하지 않는다(ESLint zone 2).
- **`supabase/`**: 실데이터 구현. `mock/`을 참조하지 않는다(ESLint zone 3). Supabase
  클라이언트(`@supabase/supabase-js`)를 직접 import할 수 있는 몇 안 되는 위치 중 하나다.
- 두 구현 모두 `src/lib/types/`의 **같은 타입**을 반환한다(NFR-035).
- API 계약(입출력)은 **직렬화 가능**해야 한다(NFR-037, R-015 — 네이티브 전환 대비).

자세한 배치 원칙과 ESLint 규칙 표는 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md) 참고.
