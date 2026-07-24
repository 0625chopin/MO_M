import { Loader2Icon } from "lucide-react";

import { CrewCreateForm } from "@/components/crews/CrewCreateForm";
import { CrewHome } from "@/components/crews/CrewHome";
import { CrewHomeSkeleton } from "@/components/crews/CrewHomeSkeleton";
import { CrewIntroPreview } from "@/components/crews/CrewIntroPreview";
import { JoinRequestButton } from "@/components/crews/JoinRequestButton";
import { PrivateCrewNotice } from "@/components/crews/PrivateCrewNotice";
import { RouteErrorBoundary } from "@/components/errors/RouteErrorBoundary";
import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { defineSection } from "@/components/sample/showcase-types";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

/**
 * SC-08·SC-09 크루 개설·크루 홈(F005·F006·F011, Task 016B). 실제 라우트는 `/crews/new`·
 * `/crews/[crewId]` — 개설 폼은 실제 컴포넌트를 그대로 등록했고(부작용은 세션이 있어야
 * 발동하는 리다이렉트뿐이라 `/sample`의 게스트 세션에서는 `sessionExpired` 폼 오류로
 * 안전하게 막힌다), 크루 홈은 `CrewHomeContainer`(서버 컴포넌트, 실제 크루 조회가 필요)
 * 대신 그 아래 세 표현 컴포넌트(`CrewHome`·`CrewIntroPreview`·`PrivateCrewNotice`)를
 * 정적 props로 직접 렌더한다 — `board.tsx`의 `BoardList` 정적 데모와 같은 이유다.
 *
 * **`JoinRequestButton`은 `status` prop(여기서는 `state.kind`) 하나로 7가지 상태를 표현하는
 * 구조라 `ProfileCard`와 같은 패턴** — 정적 마크업을 다시 짜지 않고 실제 컴포넌트를 여러 번
 * 렌더한다. 4상태 토글에 다 담기지 않는 나머지 상태(pending·invited)는 `default` 패널 아래
 * 정적 예시로 함께 둔다(`account.tsx`의 `UserSearchResult` "찾음" 정적 예시와 같은 방식).
 */
export const crewsSection = defineSection({
  id: "crews",
  label: "크루 개설·홈",
  title: "크루 개설 · 크루 홈",
  description:
    "FR-010·011·022(D-008·D-014·D-016). 실제 라우트는 /crews/new · /crews/[crewId] — 크루 홈은 public/private × 소속/비소속 조합 중 실제로 다른 모습이 필요한 세 갈래(CrewHome·CrewIntroPreview·PrivateCrewNotice)만 표현 컴포넌트로 나눴습니다.",
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
  ],
});
