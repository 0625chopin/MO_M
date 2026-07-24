import type { Id } from "@/lib/types";

/**
 * 채팅방 스크롤 위치·읽음 지점 복원(FR-053 AC2) — `sessionStorage` 기반.
 *
 * 게시글 카드를 클릭해 상세로 이동했다가 뒤로 가기로 돌아오면 `MessageRoomContainer`가
 * 통째로 언마운트됐다가 다시 마운트된다 — 이 프로젝트는 Next.js 16의 Cache Components
 * (`cacheComponents: true`)를 켜지 않았으므로(`next.config.ts`), 네비게이션 사이 컴포넌트
 * 트리를 `<Activity>`로 숨겨 상태·DOM을 보존하는 최신 방식(`preserving-ui-state.md`)이
 * 적용되지 않는다. 즉 React 상태만으로는 복귀 시 스크롤 위치를 유지할 수 없다.
 *
 * 절대 픽셀값(`scrollTop`)도 재조회 시 콘텐츠 높이가 달라지면 신뢰할 수 없으므로, **마지막으로
 * 화면 맨 위에 보이던 메시지의 id**를 앵커로 저장해 복귀 시 그 메시지로 스크롤한다(`MessageList`
 * 가 이 값을 소비한다) — id는 메시지 목록이 다시 조회돼도 안정적으로 같은 지점을 가리킨다.
 *
 * 크루 하나당 초안 하나만 유지하는 `post-draft-storage.ts`와 같은 이유로 방 하나당 앵커 하나만
 * 유지한다. `sessionStorage`라 탭을 닫으면 자동으로 사라진다 — 기기 간 동기화나 영속 저장은
 * 요구되지 않는다(FR-055의 서버 측 "읽음 지점" 배지와는 별개 개념, 그건 v0.2 보완이다).
 */

function storageKey(roomId: Id): string {
  return `mo_im:chat-scroll-anchor:${roomId}`;
}

/** 편의 기능이라 저장 실패(용량 초과·사생활 보호 모드 등)해도 채팅 자체는 계속된다
 *  (`post-draft-storage.ts`와 같은 이유로 조용히 무시한다). */
export function saveScrollAnchor(roomId: Id, messageId: Id): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(roomId), messageId);
  } catch {
    // no-op
  }
}

export function loadScrollAnchor(roomId: Id): Id | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(storageKey(roomId));
  } catch {
    return null;
  }
}
