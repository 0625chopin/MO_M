# `src/lib/data/supabase/`

실데이터(Supabase) 접근 구현. `src/lib/data/mock/`을 참조하지 않는다(NFR-034, ESLint zone 3으로 강제).
`@supabase/supabase-js` 클라이언트를 직접 import할 수 있는 몇 안 되는 위치 중 하나다
(`src/lib/realtime/`의 구현체 파일과 함께).

담당: CORE, Task 026(Supabase 클라이언트 도입)·028(스키마 마이그레이션) 이후 채워진다(20주차~).
Mock 단계(Task 007)에서는 비어 있는 것이 정상이다. 자세한 내용은 [`../README.md`](../README.md) 참고.
