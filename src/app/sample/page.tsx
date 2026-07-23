import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { StatePreview } from "@/components/sample/StatePreview";
import { AppShell } from "@/components/shell/AppShell";
import type { AuthSession } from "@/components/shell/auth-session";
import { HeaderNav } from "@/components/shell/HeaderNav";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import { PageHeader } from "@/components/shell/PageHeader";
import { strings } from "@/lib/strings";

/**
 * `/sample` 컴포넌트 쇼케이스 — **최소 골격** (Task 011, DESIGN).
 *
 * 이 파일은 카테고리 섹션 + 앵커 내비 + 컨테이너 쿼리 기반 뷰포트 프리뷰 프레임(360/768/1280
 * 리사이즈 컨트롤)을 아직 갖추지 않았다 — 그건 Task 012(DESIGN, 다음 회차)의 범위다. 지금은
 * Task 011에서 만든 4개 컴포넌트(`AppShell`·`HeaderNav`·`MobileTabBar`·`PageHeader`)를
 * `docs/CONVENTIONS.md` "`/sample` 4상태 규칙"에 맞춰 기본·로딩·빈·오류 토글로만 등록한다.
 * Task 012는 이 파일을 카테고리별 `<section id="...">` + 상단 앵커 목록 구조로 확장하면 된다.
 *
 * **문자열 경계(팀장 판정 완료, 2026-07-24)**: 아래 섹션 제목·설명·상태 토글 라벨("기본/로딩/
 * 빈/오류")은 `strings` 모듈을 거치지 않는다 — `/sample`은 SC-01~22 제품 화면이 아니라 내부
 * 개발 도구 페이지라 NFR-023(사용자 노출 문자열 분리) 적용 대상 밖이다. **단, 이 페이지가
 * 렌더링하는 실제 제품 컴포넌트(`HeaderNav`·`PageHeader` 등)에 주입하는 문구는 예외 없이
 * `strings`를 거친 값이어야 한다** — 쇼케이스 크롬과 제품 컴포넌트 문구를 혼동하지 말 것.
 */

const GUEST: AuthSession = { status: "guest" };
const LOADING: AuthSession = { status: "loading" };
const AUTHED_EMPTY: AuthSession = {
  status: "authenticated",
  // src/lib/data/mock/fixtures.ts의 시드 profile-1과 값을 맞췄다(get-auth-session.ts와 동일 관례).
  profileId: "profile-1",
  displayName: "테스터",
  hasCompletedOnboarding: true,
  unreadNotificationCount: 0,
};
// RLS 403류 도메인 오류(D-030 ③) — 네트워크 실패가 아니라 "접근 권한 없음"으로 세션 조회가
// 실패한 경우를 흉내낸다. 셸은 크래시하지 않고 게스트 안전값으로 내비게이션을 내려야 한다.
const SESSION_ERROR: AuthSession = { status: "error", reason: "forbidden" };

export default function SamplePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">컴포넌트 쇼케이스</h1>
        <p className="text-sm text-muted-foreground">
          Task 011 산출물(앱 셸 4종)의 기본·로딩·빈·오류 상태. 카테고리·앵커 내비·뷰포트
          프리뷰는 Task 012에서 확장된다.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-medium text-foreground">AppShell</h2>
          <p className="text-sm text-muted-foreground">
            HeaderNav + 콘텐츠 슬롯 + MobileTabBar 조합. 미리보기 상자 안에 고정 요소를 가둔다(
            <code>PreviewFrame</code>) — 실제 페이지 하단의 진짜 MobileTabBar와 겹치지 않는다.
          </p>
        </div>
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={360}>
                <AppShell session={GUEST} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">페이지 콘텐츠 영역</div>
                </AppShell>
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={360}>
                <AppShell session={LOADING} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">페이지 콘텐츠 영역</div>
                </AppShell>
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={360}>
                <AppShell session={AUTHED_EMPTY} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">
                    페이지 콘텐츠 영역 (알림 0건 — 배지 없음)
                  </div>
                </AppShell>
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={360}>
                <AppShell session={SESSION_ERROR} showSkipLink={false}>
                  <div className="p-4 text-sm text-muted-foreground">페이지 콘텐츠 영역</div>
                </AppShell>
              </PreviewFrame>
            ),
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-medium text-foreground">HeaderNav</h2>
          <p className="text-sm text-muted-foreground">
            768px 이상에서 인라인 링크가 보인다 — 프리뷰 상자 폭이 넓지 않으면 링크 대신
            로고만 보일 수 있다(정상, `MobileTabBar`가 좁은 화면을 맡는 설계).
          </p>
        </div>
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={64}>
                <HeaderNav session={GUEST} />
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={64}>
                <HeaderNav session={LOADING} />
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={64}>
                <HeaderNav session={AUTHED_EMPTY} />
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={90}>
                <HeaderNav session={SESSION_ERROR} />
              </PreviewFrame>
            ),
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-medium text-foreground">MobileTabBar</h2>
          <p className="text-sm text-muted-foreground">
            360px 뷰포트(NFR-026)의 1차 내비게이션. 게스트 4항목 / 로그인 5항목, 터치 대상
            44px(NFR-027).
          </p>
        </div>
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={72}>
                <MobileTabBar session={GUEST} />
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={72}>
                <MobileTabBar session={LOADING} />
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={72}>
                <MobileTabBar session={AUTHED_EMPTY} />
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={72}>
                <MobileTabBar session={SESSION_ERROR} />
              </PreviewFrame>
            ),
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-medium text-foreground">PageHeader</h2>
          <p className="text-sm text-muted-foreground">
            페이지별 제목 바. &quot;오류&quot;는 네트워크 실패가 아니라 정원 마감 같은{" "}
            <strong>도메인 오류</strong>(D-030 ③)를 예시로 쓴다.
          </p>
        </div>
        <StatePreview
          panels={{
            default: (
              <PreviewFrame height={100}>
                <PageHeader
                  title={strings.crew.explore.title}
                  description="공개 크루를 검색하고 둘러볼 수 있어요"
                  backHref="/home"
                />
              </PreviewFrame>
            ),
            loading: (
              <PreviewFrame height={100}>
                <PageHeader title="" status="loading" />
              </PreviewFrame>
            ),
            empty: (
              <PreviewFrame height={70}>
                <PageHeader title={strings.crew.explore.title} />
              </PreviewFrame>
            ),
            error: (
              <PreviewFrame height={110}>
                <PageHeader
                  title={strings.meetup.detail.title}
                  status="error"
                  errorMessage={strings.meetup.attendance.full}
                />
              </PreviewFrame>
            ),
          }}
        />
      </section>
    </main>
  );
}
