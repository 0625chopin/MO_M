# `src/hooks/`

커스텀 React 훅.

- **명명**: camelCase, `use` 접두사. 예: `useSubscribeToRoom.ts`.
- React Compiler가 컴포넌트·훅을 메모이즈하므로 훅 내부에서 수동 `useMemo`/`useCallback`을
  습관적으로 쓰지 않는다. 예외가 필요하면 측정 근거를 남기고 `"use no memo"`를 쓴다(D-029).
- 특정 도메인에 강하게 결합된 훅(예: 채팅 전용)은 해당 도메인 컴포넌트 디렉터리에 콜로케이션해도
  된다 — 이 디렉터리는 **여러 도메인에서 공유하는** 훅을 위한 곳이다.

자세한 배치 원칙은 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md) 참고.
