# `src/lib/types/`

도메인 TypeScript 타입. Mock 데이터와 실데이터(Supabase)가 **동일한 타입**을 쓴다(NFR-035).

- **담당**: CORE, Task 006(도메인 TypeScript 타입 정의, 2주차).
- **명명**: `<entity>.types.ts` (kebab-case). 예: `poll.types.ts`, `crew.types.ts`.
- **판정 결과 타입**(투표 판정·정족수 등)도 여기 둔다. 판정을 계산하는 **함수**는
  `src/lib/rules/`에 두고, 그 함수의 입출력 타입만 여기 둔다 — 타입과 로직을 분리한다.
- 스키마 확정 후(Task 028) `mcp__supabase__generate_typescript_types` 결과와 대조해
  일치 여부를 확인한다(R-003 대응, `docs/ROADMAP/team/01.CORE.md`의 시작 불가 구간 체크리스트).

자세한 배치 원칙은 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md) 참고.
