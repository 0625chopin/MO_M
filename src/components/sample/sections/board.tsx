import type { BoardPostSummary, PostDetailViewModel } from "@/components/board/board-view-models";
import { BoardList } from "@/components/board/BoardList";
import { BoardListSkeleton } from "@/components/board/BoardListSkeleton";
import { PostDeletedNotice } from "@/components/board/PostDeletedNotice";
import { PostDetail } from "@/components/board/PostDetail";
import { PostDetailSkeleton } from "@/components/board/PostDetailSkeleton";
import type { RouteErrorKind } from "@/components/errors/route-error-kind";
import { RouteErrorBoundaryPreview } from "@/components/errors/RouteErrorBoundaryPreview";
import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { BoardErrorStatePreview } from "@/components/sample/sections/BoardErrorStatePreview";
import { defineSection } from "@/components/sample/showcase-types";

/**
 * Task 018A — 게시판 목록·게시글 상세(FR-031·032). `BoardList`·`PostDetail`은 순수 표현
 * 컴포넌트라 `lib/data`를 참조하지 않는다(D-030 ①) — 아래 고정 데이터는 실제 컨테이너
 * (`BoardListContainer`·`PostDetailContainer`)가 만드는 조인 결과 모양을 그대로 손으로
 * 채운 것이다. 실제 화면은 `/crews/[crewId]/board`·`/crews/[crewId]/board/[postId]`.
 *
 * "오류" 상태에는 네트워크 실패뿐 아니라 도메인 오류 3종을 각각 별도 항목으로 등록한다
 * (D-030 ③): **RLS 403**(비소속 크루의 `board:read` 거부) · **삭제된 글 접근**(FR-032 AC4) ·
 * **잠금 규칙**(FR-032 AC2 — 모임 제안글의 예정일은 투표와 동시 생성되어 항상 잠긴다, D-035).
 */

const SAMPLE_POSTS: BoardPostSummary[] = [
  {
    id: "post-1",
    title: "이번 주 코스 공지",
    type: "general",
    authorDisplayName: "서지훈",
    authorAvatarUrl: null,
    createdAt: "2026-07-20T09:00:00.000Z",
    pollStatus: null,
  },
  {
    id: "post-2",
    title: "8/1(토) 아침 러닝 어때요?",
    type: "meetup_proposal",
    authorDisplayName: "김유나",
    authorAvatarUrl: null,
    createdAt: "2026-07-22T10:00:00.000Z",
    pollStatus: "open",
  },
  {
    id: "post-3",
    title: "지난주 러닝 후기 및 정산",
    type: "meetup_proposal",
    authorDisplayName: "서지훈",
    authorAvatarUrl: null,
    createdAt: "2026-07-10T09:00:00.000Z",
    pollStatus: "closed_passed",
  },
];

/**
 * `id`를 실제 시드 데이터(`post-2` 등)와 다른 값으로 둔다 — `/sample`에서 실제 `PostActions`를
 * 그대로 렌더하므로, 여기서 "저장"·"삭제"를 눌러 실제 Server Action이 호출돼도(NOT 시연 목적)
 * 존재하지 않는 id라 `not_found`로 끝나고 공용 Mock 스토어의 진짜 시드 게시글을 건드리지 않는다.
 */
const SAMPLE_POST_DETAIL: PostDetailViewModel = {
  id: "sample-demo-post",
  title: "8/1(토) 아침 러닝 어때요?",
  body: "다음 주 토요일 아침 7시 한강공원에서 뛰어요. 원하시는 분들은 댓글로 알려주세요!\n\n<script>는 이렇게 문자 그대로 보여야 해요(NFR-014).",
  type: "meetup_proposal",
  authorDisplayName: "김유나",
  authorAvatarUrl: null,
  createdAt: "2026-07-22T10:00:00.000Z",
  editedAt: "2026-07-22T11:30:00.000Z",
  meetupDate: "2026-08-01",
  pollStatus: "open",
  canEditTitleBody: true,
  canDelete: true,
  meetupDateLocked: true,
};

const DOMAIN_ERROR_ITEMS: Array<{ kind: RouteErrorKind; name: string; note: string }> = [
  {
    kind: "forbidden",
    name: "게시판 접근 권한 없음 (RLS 403)",
    note: "board:read 판정 거부 — 비소속 크루의 게시판에 접근하면 이 화면이 뜬다(lib/rules/permission.ts, BoardListContainer/PostDetailContainer가 던지고 error.tsx가 받는다).",
  },
];

export const boardSection = defineSection({
  id: "board",
  label: "게시판",
  title: "게시판 목록·게시글 상세",
  description:
    "SC-10·SC-12(FR-031·032). 목록은 유형·투표 상태 배지 + 20건 페이지네이션(AC2), 상세는 본문 · 수정/삭제 · 모임 제안글의 잠금 규칙(D-035)을 다룹니다. 투표 참여 UI 자체는 Task 019 몫이라 상태 배지만 보여줍니다.",
  items: [
    {
      name: "게시판 목록 (BoardList)",
      note: "0건이면 컴포넌트 내부에서 빈 상태로 전환됩니다(AC1). '오류'는 목록 조회 자체가 실패한 경우(AC4)입니다.",
      panels: {
        default: (
          <PreviewFrame height={520}>
            <div className="p-4">
              <BoardList
                crewId="crew-1"
                posts={SAMPLE_POSTS}
                totalCount={SAMPLE_POSTS.length}
                page={1}
                totalPages={1}
                canWrite
                writeHref="/crews/crew-1/board/new"
              />
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={420}>
            <div className="p-4">
              <BoardListSkeleton rows={3} />
            </div>
          </PreviewFrame>
        ),
        empty: (
          <PreviewFrame height={260}>
            <div className="p-4">
              <BoardList
                crewId="crew-1"
                posts={[]}
                totalCount={0}
                page={1}
                totalPages={1}
                canWrite
                writeHref="/crews/crew-1/board/new"
              />
            </div>
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={160}>
            <div className="p-4">
              <BoardErrorStatePreview />
            </div>
          </PreviewFrame>
        ),
      },
    },
    {
      name: "페이지네이션(2/5 페이지)",
      note: "총 100건 · 20건씩(AC2). 양 끝에서는 이전/다음이 비활성 표시로 바뀝니다.",
      panels: {
        default: (
          <PreviewFrame height={200}>
            <div className="p-4">
              <BoardList
                crewId="crew-1"
                posts={SAMPLE_POSTS}
                totalCount={100}
                page={2}
                totalPages={5}
                canWrite={false}
                writeHref="/crews/crew-1/board/new"
              />
            </div>
          </PreviewFrame>
        ),
      },
    },
    ...DOMAIN_ERROR_ITEMS.map(({ kind, name, note }) => ({
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
    {
      name: "게시글 상세 (PostDetail)",
      note: "모임 제안글 예시 — 유형 배지 + 투표 상태 배지(Task 019가 만들 투표 참여 UI는 여기 들어가지 않습니다) + 잠긴 모임 예정일(D-035) + 작성자 본인 기준 수정·삭제 액션.",
      panels: {
        default: (
          <PreviewFrame height={460}>
            <div className="p-4">
              <PostDetail crewId="crew-1" post={SAMPLE_POST_DETAIL} />
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={280}>
            <div className="p-4">
              <PostDetailSkeleton />
            </div>
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={160}>
            <div className="p-4">
              <BoardErrorStatePreview />
            </div>
          </PreviewFrame>
        ),
      },
    },
    {
      name: "게시글 상세 — 타인 글 조회 (수정·삭제 버튼 없음)",
      note: "post:update_own·post:delete_own·post:delete_any가 전부 거부된 경우 — PostActions가 아무것도 렌더하지 않는다(null).",
      panels: {
        default: (
          <PreviewFrame height={420}>
            <div className="p-4">
              <PostDetail
                crewId="crew-1"
                post={{ ...SAMPLE_POST_DETAIL, canEditTitleBody: false, canDelete: false }}
              />
            </div>
          </PreviewFrame>
        ),
      },
    },
    {
      name: "게시글 상세 — 삭제된 글 (FR-032 AC4)",
      note: "getPostById가 소프트 삭제(deletedAt)를 걸러 null을 반환하면 PostDetailContainer가 이 안내를 그린다 — 채팅 공유 링크로 들어와도 동일하다.",
      panels: {
        error: (
          <PreviewFrame height={260}>
            <div className="p-4">
              <PostDeletedNotice crewId="crew-1" />
            </div>
          </PreviewFrame>
        ),
      },
    },
    {
      name: "게시글 상세 — 수정 잠금 (FR-032 AC2, D-035)",
      note: "모임 제안글의 투표는 등록과 동시에 생성되므로 '투표 시작 후' 잠금이 아니라 처음부터 무조건 잠긴다(PRD 검증 m-4). 제목·본문은 계속 수정 가능하고 모임 예정일만 잠긴다 — lib/rules/post-edit-lock.ts의 hasLockedFields가 이 배지를 켠다.",
      panels: {
        error: (
          <PreviewFrame height={460}>
            <div className="p-4">
              <PostDetail crewId="crew-1" post={SAMPLE_POST_DETAIL} />
            </div>
          </PreviewFrame>
        ),
      },
    },
  ],
});
