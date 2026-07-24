# `src/lib/data/mock/`

Mock 데이터 접근 구현. `src/lib/data/supabase/`를 참조하지 않는다(NFR-034, ESLint zone 2로 강제).
`src/lib/types/`의 타입을 실데이터 구현(`../supabase/`)과 동일하게 구현한다.

담당: CORE, Task 007(read/write 계약과 최소 픽스처). 자세한 내용은 [`../README.md`](../README.md) 참고.

- **`fixtures.ts`**: `store`(가변 배열)·`generateId`·`resetFixtures`. Task 007이 만든 최소
  관계(profile-1~3·crew-1~2 등)를 그대로 유지하고, 그 위에 `./seed/buildBulkSeed`가 생성한
  대량 데이터를 이어붙인다.
- **`seed/`**: 담당 CREW, Task 010. 실사용 규모(크루 15·멤버 300·게시글 200·메시지 2,000·
  Meetup 60) 시드 생성기 — 결정론적 PRNG(`prng.ts`) 기반이며, `lib/rules`의 실제 판정
  함수(정족수·투표 판정·권한 매트릭스가 참조하는 멤버십 전이·크루 색 해시)를 그대로 호출해
  생성 결과가 규칙과 어긋나지 않게 한다. 개수 근거·엔티티별 생성기 구성은
  [`seed/index.ts`](./seed/index.ts) docstring 참고.
