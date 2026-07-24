import { defineSection } from "@/components/sample/showcase-types";
import { Badge } from "@/components/ui/badge";

/* ── 접근성·반응형 QA 요약 (Task 024, 10일차) ────────────────────────────
   테스트 러너가 없어(R-002) 이 표 자체가 실행 가능한 검증은 아니다 — 실제 검증은
   Playwright로 라우트를 직접 열어 수행했고, 이 섹션은 그 결과를 `/sample`(유일한
   회귀 확인 지점, CON-09)에 남겨 다음 QA 패스가 이어받을 수 있게 하는 기록이다. */

const CHECK_ROWS = [
  {
    nfr: "NFR-020",
    item: "포커스 트랩·Esc·복귀 포커스",
    scope: "Dialog·BottomSheet(Drawer)·Popover(NotificationBell)·MonthCalendar 날짜 셀",
    result: "통과" as const,
    detail:
      "Base UI 프리미티브(Dialog/Drawer/Popover) 전부 트랩·Esc·트리거 복귀 포커스 실측 확인. MonthCalendar 셀은 방향키·Home·End 이동, Enter/Space로 DayDetailPanel 열림, Esc로 닫히고 트리거 셀로 포커스가 돌아온다.",
  },
  {
    nfr: "NFR-027",
    item: "터치 대상 24×24 최소 / 44×44 권장",
    scope: "전 라우트 상호작용 요소(DOM 실측 스캔)",
    result: "일부 수정" as const,
    detail:
      "24px 하한 위반 3건 발견·수정 — 「캘린더에서 모두 보기」·「원 제안글 보기」·「확정된 모임 보기」 링크에 py-1을 더해 28px로. 「재전송」 버튼은 실패 문구에 인라인된 텍스트 링크라 WCAG 2.5.8 inline 예외로 판단해 유지. 44px 권장치는 문언상 필수가 아니고 Button 기본 크기(32px)가 이미 24px 하한을 넉넉히 넘어 이번엔 손대지 않음(MobileTabBar는 이미 44px).",
  },
  {
    nfr: "NFR-018",
    item: "텍스트 4.5:1 · 비텍스트 UI 요소 3:1 (라이트·다크)",
    scope: "globals.css 디자인 토큰(Canvas 실측 대비 계산)",
    result: "1건 수정" as const,
    detail:
      "본문·보조문구·destructive·ring 등은 라이트·다크 모두 여유 있게 통과(실측값 5.28~19.45). 라이트 모드 --input(폼 필드 테두리)이 1.43:1로 3:1 미달 — Input·Textarea·Select·Checkbox·RadioGroup·Tabs의 유일한 경계선이라 실사용 영향이 커 oklch(0.64 0.009 258)로 낮춰 3.37:1로 수정. 다크는 12.47:1이라 그대로 둠.",
  },
  {
    nfr: "NFR-026",
    item: "360 / 768 / 1280 재배치, 무-가로스크롤",
    scope: "게스트 15개 + 크루원 6개 라우트 전수(scrollWidth 실측)",
    result: "통과" as const,
    detail:
      "360px에서 모든 라우트 overflow 0px. 768px에서 HeaderNav 전환 확인. 캘린더 격자(NFR-005·026 AC4)도 360px 무-가로스크롤 확인.",
  },
  {
    nfr: "NFR-021",
    item: "동적 변경(토스트·투표 집계·새 메시지)의 live region 안내",
    scope: "Toast·PollTally·MessageList",
    result: "2건 추가" as const,
    detail:
      "Toast는 이미 priority→aria-live 배선 완료 상태였다. PollTally·MessageList는 요구사항 원문이 명시한 두 예시(「투표 집계」·「새 메시지」)인데도 live region이 없었다 — PollTally 루트에 aria-live=\"polite\" 추가, MessageList엔 본인 발신은 건너뛰고 상대 메시지 도착만 알리는 시각적 숨김 live region을 추가(위로 이어 로드로 오탐하지 않도록 맨 뒤 메시지 id만 추적).",
  },
] satisfies Array<{
  nfr: string;
  item: string;
  scope: string;
  result: "통과" | "일부 수정" | "1건 수정" | "2건 추가";
  detail: string;
}>;

const RESULT_BADGE_VARIANT: Record<(typeof CHECK_ROWS)[number]["result"], "default" | "secondary"> = {
  통과: "secondary",
  "일부 수정": "default",
  "1건 수정": "default",
  "2건 추가": "default",
};

export const a11ySection = defineSection({
  id: "a11y",
  label: "접근성 QA",
  title: "접근성·반응형 QA 결과 (Task 024)",
  description: (
    <>
      Phase 3 화면 전량(015~023 산출물)을 대상으로 한 수동 접근성·반응형 QA 패스 결과다.
      자동화 검증 도구 도입 결정은{" "}
      <code className="font-mono text-xs">docs/decisions/accessibility-tooling.md</code>에 별도로
      남겼다(요약: <code className="font-mono text-xs">eslint-plugin-jsx-a11y</code> recommended
      34개 규칙을 켰고 — 실제 위반 1건 발견·수정 — axe-core류 런타임 검증은 테스트 러너가 없어
      (R-002) 보류했다).
    </>
  ),
  items: [
    {
      name: "점검 항목별 결과",
      note: "각 행의 '범위'는 실제로 연 라우트·컴포넌트다. 상세는 detail 열 참고.",
      content: (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2 font-medium text-foreground">NFR</th>
                <th className="px-3 py-2 font-medium text-foreground">점검 항목</th>
                <th className="px-3 py-2 font-medium text-foreground">결과</th>
                <th className="px-3 py-2 font-medium text-foreground">상세</th>
              </tr>
            </thead>
            <tbody>
              {CHECK_ROWS.map((row) => (
                <tr key={row.nfr} className="border-b border-border last:border-0 align-top">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.nfr}</td>
                  <td className="px-3 py-2 text-foreground">
                    {row.item}
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.scope}</p>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={RESULT_BADGE_VARIANT[row.result]}>{row.result}</Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      name: "10일차 중 구현·해소된 후속 사항 (크루 설정·받은 초대함)",
      note: "이 QA 패스가 시작된 뒤 CREW가 Task 017B로 두 화면을 구현했고, 그 과정에서 나온 접근성 지적 세 건도 같은 10일차 안에 전부 해소됐다 — 다음 QA 패스가 스코프 밖으로 건너뛰지 않도록 남기는 기록이다.",
      content: (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-foreground">
          <li>
            <code className="font-mono text-xs">invitations/page.tsx</code>·
            <code className="font-mono text-xs">crews/[crewId]/settings/page.tsx</code> 구현
            (크루 정보 폼의 팔레트 12색 라디오 그룹·공개 범위 폼·받은 초대함 수락/거절) 및
            교차검증 — 12색 라디오는 Base UI의 selection-follows-focus라 방향키 이동 시 포커스
            링과 체크가 함께 갱신됨을 실측했고, 폼 필드는 위 「폼 필드 대비」 수정분(
            <code className="font-mono text-xs">--input</code>)을 그대로 상속해 3.37:1이다.
          </li>
          <li>
            <strong className="font-medium text-foreground">터치 대상(이슈 B, 해소됨)</strong> —
            색상 스와치 <code className="font-mono text-xs">FieldLabel</code>에{" "}
            <code className="font-mono text-xs">px-2 py-1</code>을 더해 유효 히트 영역이 24×42px
            → <strong className="font-medium text-foreground">40×50px</strong>로 넓어졌다(닷
            시각 크기는 24px 그대로). 재실측 결과 라디오 그룹 키보드 내비·포커스 링 모두 정상.
          </li>
          <li>
            <strong className="font-medium text-foreground">색 이름 라벨(이슈 D, 해소됨)</strong>{" "}
            — <code className="font-mono text-xs">crew-palette.ts</code>에 12색 전부{" "}
            <code className="font-mono text-xs">nameKo</code>가 채워지고{" "}
            <code className="font-mono text-xs">colorOptionLabel</code>이{" "}
            <code className="font-mono text-xs">{"{n}번 {name}"}</code>로 바뀌어{" "}
            <code className="font-mono text-xs">aria-label</code>이 「1번 올리브색」처럼 읽힌다.
            <code className="font-mono text-xs">globals.css</code>의 색상명 주석과 12개 전부
            대조해 일치를 확인했다 — 스크린 리더 사용자가 이제 순번이 아니라 실제 색으로
            식별할 수 있다.
          </li>
          <li>
            <strong className="font-medium text-foreground">오류 패널 완결성(이슈 C, 해소됨)</strong>{" "}
            — <code className="font-mono text-xs">invitations</code> 섹션의 「오류」 패널이{" "}
            <code className="font-mono text-xs">evaluateInvitationResponseEligibility</code>의
            도메인 오류 3종(이미 응답함·크루 해산·만료)을 <code className="font-mono text-xs">PollBallot</code>과
            같은 패턴으로 나란히 보여주도록 확장됐다. 세 캡션이 전부 렌더되는 것을 직접
            확인했다.
          </li>
        </ul>
      ),
    },
    {
      name: "이월·미해결 사항",
      note: "이번 QA 범위에서 의도적으로 손대지 않았거나, 근거를 남기고 넘긴 항목이다.",
      content: (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-foreground">
          <li>
            Button 원자의 크기 체계(기본 32px)를 44px 권장치에 맞춰 전면 확대하지 않았다 — NFR-027
            문언상 44px는 「권장」이고 24px 하한은 이미 만족하며, 버튼 크기 체계는 Task 013에서
            CREW 리뷰를 거친 디자인 시스템 결정이라 근거 없이 이번 QA에서 바꾸지 않는다.
          </li>
          <li>
            axe-core 등 런타임 접근성 자동 검증은 테스트 러너 도입(R-002 해소)이 선행돼야 한다 —{" "}
            <code className="font-mono text-xs">docs/decisions/accessibility-tooling.md</code> 참고.
          </li>
        </ul>
      ),
    },
  ],
});
