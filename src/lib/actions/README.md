# `src/lib/actions/`

Server Action. 쓰기 후 갱신은 **Server Action + `refresh()`** 패턴을 Mock 단계부터 쓴다
(`CLAUDE.md` D-030 부수 사항 — Next.js 16의 `updateTag`·`refresh()`가 이 전환 시나리오를 위한 API다).

- **명명**: kebab-case, 동사로 시작. 예: `create-poll.ts`, `join-crew.ts`.
- Server Action은 `src/lib/data`(쓰기 함수)를 호출하고, 완료 후 관련 조회를 `refresh()`하거나
  `updateTag()`로 무효화한다. 데이터 접근 로직 자체를 이 파일에 인라인하지 않는다 — `lib/data`에 위임한다.
- 입출력은 직렬화 가능해야 한다(NFR-037).

자세한 배치 원칙은 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md) 참고.
