import type { Id } from "@/lib/types";

/**
 * `src/lib/data/`가 mock·supabase 두 구현 모두에 공통으로 강제하는 반환 계약.
 *
 * - **NFR-037**(직렬화 가능한 API 계약) — 아래 타입은 전부 순수 객체·문자열·불리언·숫자로만
 *   구성된다. 클래스 인스턴스·함수·Date 객체를 담지 않는다. 네이티브 클라이언트가 같은 계약을
 *   JSON으로 그대로 받을 수 있어야 한다(R-015).
 * - **CON-05·CON-06** — 이 파일은 물론 이 레이어의 어떤 함수도 쿠키·세션·요청 객체를 직접
 *   읽지 않는다. 호출자(Server Action·서버 컴포넌트)가 인증을 먼저 해석해 `profileId` 같은
 *   값을 인자로 넘긴다. 그래야 웹 쿠키 세션과 네이티브 토큰 저장소 양쪽에서 이 레이어를
 *   그대로 재사용할 수 있다 — 함수 시그니처 어디에도 "요청"이라는 개념이 등장하지 않는다.
 *
 * ## 왜 모든 쓰기가 예외를 던지지 않는가
 *
 * D-030 ③은 "네트워크 실패뿐 아니라 정원 마감·동시 수정 충돌 같은 도메인 결과도 화면
 * 상태로 표현한다"고 요구한다. `AttendanceJoinResult`(`meetup.types.ts`)가 이미 이 패턴이다 —
 * 이 레이어의 나머지 쓰기 작업도 같은 원칙을 따라 **예상 가능한 실패**(대상 없음·충돌·검증
 * 실패)는 `DataResult<T>`로 반환하고, 진짜 프로그래밍 오류만 예외로 던진다.
 *
 * 권한 판정(허용/거부)은 이 레이어의 **1차** 책임이 아니다 — `lib/rules`의 순수 함수가
 * 먼저 판정하고, 그 결과를 본 Server Action이 이 레이어를 호출할지 말지 결정한다. 정상
 * 경로에서는 이 레이어에 도달했다는 것 자체가 이미 그 판정을 통과했다는 뜻이다.
 *
 * 다만 실데이터에서는 **RLS가 2차 방어선으로 별도로 거부할 수 있다** — 예: 판정과 실제
 * 쿼리 사이의 경쟁 조건, 캐시된 역할·멤버십 정보가 stale한 경우. `lib/rules`의 사전 판정을
 * 대체하지 않고 그 판정이 이미 실패했어야 할 상황이 방어적으로 한 번 더 걸리는 경우다.
 * 이 실패는 예외로 던지면 안 된다 — D-030 ③이 "`/sample` 4상태의 '오류'에 RLS 403·정원
 * 마감·동시 수정 충돌을 도메인 오류로 표현한다"고 v0.1부터 요구하기 때문이다. `forbidden`을
 * Task 026(Supabase 도입)까지 미루면 그 사이 작성되는 컨테이너·Server Action이 전부
 * "이 오류는 도달 불가"를 전제로 짜여 전환 시점에 다시 고쳐야 한다 — 이 프로젝트가 피하려는
 * 패턴 그 자체라 지금 계약에 넣어 둔다(I-027, 3일차 팀장 판정). Mock 단계에서 이 코드를
 * 실제로 발생시키는 함수는 없다 — 계약에 자리가 있다는 것만으로 `/sample` 오류 상태와
 * Supabase 구현이 나중에 이 코드를 그대로 쓸 수 있다.
 */
export type DataErrorCode = "not_found" | "conflict" | "validation_failed" | "forbidden";

export interface DataError {
  code: DataErrorCode;
  message: string;
}

export type DataResult<T> = { ok: true; data: T } | { ok: false; error: DataError };

export function ok<T>(data: T): DataResult<T> {
  return { ok: true, data };
}

export function err<T = never>(code: DataErrorCode, message: string): DataResult<T> {
  return { ok: false, error: { code, message } };
}

/**
 * 커서 기반 목록 조회 계약. 게시글 목록(FR-031)·채팅 메시지 윈도잉(FR-051, D-023 —
 * 최신 50건 + 위로 이어 로드)·알림 센터(FR-071)가 공유한다. `nextCursor`는 다음 페이지
 * 요청에 그대로 되돌려주는 불투명 토큰(엔티티 id)이며, null이면 더 가져올 항목이 없다는 뜻이다.
 */
export interface CursorPage<T> {
  items: T[];
  nextCursor: Id | null;
}
