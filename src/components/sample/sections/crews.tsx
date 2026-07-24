import { Loader2Icon } from "lucide-react";

import type { CrewCardViewModel } from "@/components/crews/crew-explore-view-models";
import { CrewCreateForm } from "@/components/crews/CrewCreateForm";
import { CrewGrid } from "@/components/crews/CrewGrid";
import { CrewGridSkeleton } from "@/components/crews/CrewGridSkeleton";
import { CrewHome } from "@/components/crews/CrewHome";
import { CrewHomeSkeleton } from "@/components/crews/CrewHomeSkeleton";
import { CrewIntroPreview } from "@/components/crews/CrewIntroPreview";
import { CrewSearchBar } from "@/components/crews/CrewSearchBar";
import { JoinRequestButton } from "@/components/crews/JoinRequestButton";
import { PrivateCrewNotice } from "@/components/crews/PrivateCrewNotice";
import { RouteErrorBoundary } from "@/components/errors/RouteErrorBoundary";
import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { CrewExploreErrorStatePreview } from "@/components/sample/sections/CrewExploreErrorStatePreview";
import { defineSection } from "@/components/sample/showcase-types";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

/** `CrewGrid`·`CrewCard` 데모용 고정 데이터 — 실제 `CrewExploreContainer`가 `fetchCrewCardsPage`로
 *  만드는 조인 결과 모양을 손으로 채운 것이다(`board.tsx`의 `SAMPLE_POSTS`와 같은 패턴). */
const SAMPLE_CREW_CARDS: CrewCardViewModel[] = [
  {
    id: "crew-1",
    name: "주말 러닝 크루",
    description: "매주 토요일 아침 한강에서 함께 뜁니다.",
    category: "운동",
    colorIndex: 0,
    memberCount: 12,
    isMember: true,
  },
  {
    id: "crew-3",
    name: "홈카페 취향 공유",
    description: "직접 내린 커피와 홈카페 도구를 공유합니다.",
    category: "취미",
    colorIndex: 3,
    memberCount: 4,
    isMember: false,
  },
  {
    id: "crew-7",
    name: "IT 커리어 스터디",
    description: "이직·커리어 고민을 함께 나누는 스터디입니다.",
    category: "스터디",
    colorIndex: 7,
    memberCount: 55,
    isMember: false,
  },
];

/**
 * SC-07~09 크루 탐색·개설·크루 홈(F005·F006·F008·F011, Task 016A·016B). 실제 라우트는
 * `/crews`·`/crews/new`·`/crews/[crewId]` — 개설 폼은 실제 컴포넌트를 그대로 등록했고(부작용은
 * 세션이 있어야 발동하는 리다이렉트뿐이라 `/sample`의 게스트 세션에서는 `sessionExpired` 폼
 * 오류로 안전하게 막힌다), 크루 홈은 `CrewHomeContainer`(서버 컴포넌트, 실제 크루 조회가 필요)
 * 대신 그 아래 세 표현 컴포넌트(`CrewHome`·`CrewIntroPreview`·`PrivateCrewNotice`)를
 * 정적 props로 직접 렌더한다 — `board.tsx`의 `BoardList` 정적 데모와 같은 이유다.
 *
 * **`JoinRequestButton`은 `status` prop(여기서는 `state.kind`) 하나로 7가지 상태를 표현하는
 * 구조라 `ProfileCard`와 같은 패턴** — 정적 마크업을 다시 짜지 않고 실제 컴포넌트를 여러 번
 * 렌더한다. 4상태 토글에 다 담기지 않는 나머지 상태(pending·invited)는 `default` 패널 아래
 * 정적 예시로 함께 둔다(`account.tsx`의 `UserSearchResult` "찾음" 정적 예시와 같은 방식).
 *
 * **`CrewSearchBar`·`CrewGrid`(Task 016A)도 실제 컴포넌트를 그대로 등록한다** — 무한 스크롤이
 * `loadMoreCrewsAction`(읽기 전용 Server Action)을 실제로 호출하므로 `/sample`에서 스크롤해도
 * 안전하다(쓰기가 없다). `CrewCard`는 별도 항목을 만들지 않았다 — `CrewGrid` 자신이 카드 3장을
 * 렌더해 보여주므로 단독 항목이 중복이라고 판단했다(`BoardListItem`이 `BoardList` 항목 안에서만
 * 보이는 것과 같은 이유).
 */
export const crewsSection = defineSection({
  id: "crews",
  label: "크루 탐색·개설·홈",
  title: "크루 탐색 · 크루 개설 · 크루 홈",
  description:
    "FR-010·011·014·022(D-007·D-008·D-014·D-016·D-017). 실제 라우트는 /crews · /crews/new · /crews/[crewId] — 크루 탐색은 검색바·카테고리 필터·카드 그리드·무한 스크롤·가입됨 배지(CrewSearchBar·CrewGrid·CrewCard), 크루 홈은 public/private × 소속/비소속 조합 중 실제로 다른 모습이 필요한 세 갈래(CrewHome·CrewIntroPreview·PrivateCrewNotice)만 표현 컴포넌트로 나눴습니다.",
  items: [
    {
      name: "CrewCreateForm",
      note: "실제 컴포넌트입니다. /sample은 게스트 세션이라 제출하면 '로그인이 만료됐어요' 폼 오류가 뜹니다 — checkPermission(crew:create)이 실제로 작동한다는 증거입니다(계정 섹션의 UserSearchField와 같은 패턴).",
      panels: {
        default: (
          <PreviewFrame height={620}>
            <div className="mx-auto w-full max-w-md p-4">
              <CrewCreateForm />
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={120}>
            <div className="mx-auto flex w-full max-w-md justify-center p-4">
              <Button disabled className="w-full">
                <Loader2Icon aria-hidden="true" className="animate-spin" />
                {strings.crew.create.submitPending}
              </Button>
            </div>
          </PreviewFrame>
        ),
      },
    },
    {
      name: "JoinRequestButton",
      note: "state prop 하나로 상태 기계 전체(kind: member/private_locked/guest_prompt/invited/pending/blocked/requestable)를 표현합니다(lib/rules/join-request-button-state.ts). default 패널의 '가입 신청' 버튼은 실제로 열리는 다이얼로그입니다 — 제출은 게스트 세션이라 오류로 막힙니다.",
      panels: {
        default: (
          <PreviewFrame height={280}>
            <div className="mx-auto flex w-full max-w-sm flex-col gap-4 p-4">
              <JoinRequestButton crewId="crew-1" state={{ kind: "requestable" }} />
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">정적 예시 — 대기 중 · 초대받음</p>
                <JoinRequestButton crewId="crew-1" state={{ kind: "pending" }} />
                <JoinRequestButton crewId="crew-1" state={{ kind: "invited" }} />
              </div>
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={100}>
            <div className="mx-auto w-full max-w-sm p-4">
              <Button disabled className="w-full">
                <Loader2Icon aria-hidden="true" className="animate-spin" />
                {strings.crew.home.join.submitPending}
              </Button>
            </div>
          </PreviewFrame>
        ),
        empty: (
          <PreviewFrame height={100}>
            <div className="mx-auto w-full max-w-sm p-4">
              <JoinRequestButton crewId="crew-1" state={{ kind: "guest_prompt" }} />
            </div>
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={100}>
            <div className="mx-auto w-full max-w-sm p-4">
              <JoinRequestButton crewId="crew-1" state={{ kind: "blocked" }} />
            </div>
          </PreviewFrame>
        ),
      },
    },
    {
      name: "CrewHome (크루원 화면)",
      note: "public/private 4분기 중 '소속' 두 칸은 공개 범위와 무관하게 이 화면 하나로 합쳐집니다(D-007). default는 오너(설정 탭 노출), empty는 일반 크루원(설정 탭 없음, 크루원 1명)입니다.",
      panels: {
        default: (
          <PreviewFrame height={260}>
            <CrewHome
              crewId="crew-1"
              name="주말 러닝 크루"
              description="매주 토요일 아침 한강에서 함께 뜁니다."
              category="운동"
              colorIndex={0}
              visibility="public"
              memberCount={12}
              canManageSettings
            />
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={200}>
            <CrewHomeSkeleton />
          </PreviewFrame>
        ),
        empty: (
          <PreviewFrame height={220}>
            <CrewHome
              crewId="crew-1"
              name="갓 만든 크루"
              description="방금 만들어져서 아직 크루원이 오너뿐이에요."
              category="취미"
              colorIndex={3}
              visibility="private"
              memberCount={1}
              canManageSettings={false}
            />
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={280}>
            <RouteErrorBoundary kind="not_found" />
          </PreviewFrame>
        ),
      },
    },
    {
      name: "CrewIntroPreview (public, 비소속)",
      note: "D-007 — 소개까지만 보이고 게시판·채팅·멤버 목록 링크는 이 컴포넌트 자체에 없습니다.",
      panels: {
        default: (
          <PreviewFrame height={260}>
            <CrewIntroPreview
              crewId="crew-1"
              name="주말 러닝 크루"
              description="매주 토요일 아침 한강에서 함께 뜁니다."
              category="운동"
              colorIndex={0}
              memberCount={12}
              joinState={{ kind: "requestable" }}
            />
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={200}>
            <CrewHomeSkeleton />
          </PreviewFrame>
        ),
        empty: (
          <PreviewFrame height={260}>
            <CrewIntroPreview
              crewId="crew-1"
              name="갓 만든 크루"
              description="방금 만들어진 크루예요."
              category="문화"
              colorIndex={6}
              memberCount={1}
              joinState={{ kind: "guest_prompt" }}
            />
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={260}>
            <CrewIntroPreview
              crewId="crew-1"
              name="주말 러닝 크루"
              description="매주 토요일 아침 한강에서 함께 뜁니다."
              category="운동"
              colorIndex={0}
              memberCount={12}
              joinState={{ kind: "blocked" }}
            />
          </PreviewFrame>
        ),
      },
    },
    {
      name: "PrivateCrewNotice (private, 비소속)",
      note: "D-007·FR-012 AC2 — 크루명 + 안내뿐입니다. 자체 조회가 없는 정적 표현 컴포넌트라 로딩·빈 상태가 따로 없습니다(이 컴포넌트를 감싸는 CrewHomeContainer의 로딩·오류는 위 CrewHome 항목이 보여줍니다).",
      panels: {
        default: (
          <PreviewFrame height={260}>
            <PrivateCrewNotice crewName="심야 북클럽" />
          </PreviewFrame>
        ),
      },
    },
    {
      name: "크루 탐색 — 검색바 (CrewSearchBar)",
      note: "실제 컴포넌트입니다(FR-014, Task 016A). 카테고리 칩은 클릭 즉시, 검색어는 제출 시 /crews로 실제 이동합니다(CrewCard의 Link와 같은 이유로 실제 네비게이션을 막지 않았습니다). '오류' 패널은 검색어 1자일 때의 최소 길이 안내(E2)입니다 — crew-search-query.ts가 판정합니다.",
      panels: {
        default: (
          <PreviewFrame height={140}>
            <div className="p-4">
              <CrewSearchBar initialQuery="" initialCategory={null} />
            </div>
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={140}>
            <div className="p-4">
              <CrewSearchBar initialQuery="가" initialCategory={null} />
            </div>
          </PreviewFrame>
        ),
      },
    },
    {
      name: "크루 탐색 — 결과 그리드 (CrewGrid)",
      note: "실제 컴포넌트입니다. 카드 3장(가입됨 배지가 있는 것 하나 포함) — 읽기 전용 무한 스크롤이라 실수로 스크롤해도 공용 Mock 스토어에 영향이 없습니다. '빈' 패널은 결과 0건(E1, 카테고리 둘러보기 유도), '오류'는 무한 스크롤 다음 페이지 조회 실패(AC3, D-030 ③)입니다.",
      panels: {
        default: (
          <PreviewFrame height={420}>
            <div className="p-4">
              <CrewGrid
                initialItems={SAMPLE_CREW_CARDS}
                initialCursor={null}
                hasActiveFilter={false}
              />
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={360}>
            <div className="p-4">
              <CrewGridSkeleton />
            </div>
          </PreviewFrame>
        ),
        empty: (
          <PreviewFrame height={220}>
            <div className="p-4">
              <CrewGrid initialItems={[]} initialCursor={null} category="문화" hasActiveFilter />
            </div>
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={160}>
            <div className="p-4">
              <CrewExploreErrorStatePreview />
            </div>
          </PreviewFrame>
        ),
      },
    },
  ],
});
