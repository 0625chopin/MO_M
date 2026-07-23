import type { RouteErrorKind } from "@/components/errors/route-error-kind";
import { RouteErrorBoundaryPreview } from "@/components/errors/RouteErrorBoundaryPreview";
import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { defineSection } from "@/components/sample/showcase-types";

/**
 * Task 014 — 전역 오류·경계 화면. `src/app/error.tsx`·`not-found.tsx`·`global-error.tsx`가
 * 렌더링하는 실제 컴포넌트는 `RouteErrorBoundary`(표현 컴포넌트) 하나다. 라우트 파일 자체는
 * `<html>`/`<body>`를 새로 정의하거나(`global-error.tsx`) props를 받지 않아(`not-found.tsx`)
 * 이 프리뷰 프레임 안에 그대로 옮겨 놓을 수 없어 이 컴포넌트를 대신 데모한다.
 *
 * "오류"는 네트워크 실패 하나가 아니다(D-030 ③) — `RouteErrorKind`가 다루는 6종을 각각
 * 별도 항목으로 등록해 구분 가능함을 보여준다. `kind`별 아이콘·문구 매핑은
 * `RouteErrorBoundary.tsx`의 `KIND_META`가 단일 소스다.
 */
const KIND_ITEMS: Array<{ kind: RouteErrorKind; name: string; note: string }> = [
  {
    kind: "not_found",
    name: "RouteErrorBoundary — 404 (페이지 없음)",
    note: "app/not-found.tsx. notFound() 호출뿐 아니라 앱 전체에서 매칭되지 않는 URL도 이 화면을 쓴다. 재시도가 의미 없어 '다시 시도' 버튼이 없다.",
  },
  {
    kind: "forbidden",
    name: "RouteErrorBoundary — 403 (권한 없음)",
    note: "RLS 403류 도메인 오류(lib/data/contracts.ts의 DataErrorCode 'forbidden'). 비소속 크루 접근처럼 서버·RLS가 거부한 경우다(D-007·D-017, NFR-012).",
  },
  {
    kind: "network",
    name: "RouteErrorBoundary — 네트워크",
    note: "app/error.tsx(세그먼트 오류 경계)·app/global-error.tsx(루트 레이아웃 오류 경계) 공통 기본값. '다시 시도'가 Next.js 16의 unstable_retry를 흉내낸다.",
  },
  {
    kind: "conflict",
    name: "RouteErrorBoundary — 동시 수정 충돌",
    note: "DataErrorCode 'conflict'. 다른 사용자가 먼저 처리한 경우(예: 이미 정리된 게시글 수정)를 예시로 쓴다.",
  },
  {
    kind: "validation_failed",
    name: "RouteErrorBoundary — 입력 검증 실패",
    note: "DataErrorCode 'validation_failed'. 클라이언트 검증을 통과했지만 서버 재검증에서 걸린 경우(NFR-014)를 예시로 쓴다.",
  },
  {
    kind: "full",
    name: "RouteErrorBoundary — 정원 마감",
    note: "lib/types/meetup.types.ts의 AttendanceJoinResult.reason과 같은 값('full'). 참석 인원이 정원(capacity)에 도달해 조건부 UPDATE가 실패한 경우다(D-019).",
  },
];

export const errorsSection = defineSection({
  id: "errors",
  label: "오류 경계",
  title: "전역 오류·경계 화면",
  description:
    "app/error.tsx · not-found.tsx · global-error.tsx가 렌더링하는 RouteErrorBoundary입니다. 네트워크 실패뿐 아니라 RLS 403 · 정원 마감 · 동시 수정 충돌 같은 도메인 오류도 구분해서 다룹니다(D-030 ③).",
  items: KIND_ITEMS.map(({ kind, name, note }) => ({
    name,
    note,
    panels: {
      error: (
        <PreviewFrame height={280}>
          <RouteErrorBoundaryPreview kind={kind} />
        </PreviewFrame>
      ),
    },
  })),
});
