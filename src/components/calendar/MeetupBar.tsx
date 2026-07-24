import { crewCertaintyVars } from "@/lib/crew-palette";
import { t } from "@/lib/strings";
import { cn } from "@/lib/utils";

import type { CSSProperties } from "react";

/**
 * 캘린더 날짜 셀 하나 안의 Meetup 막대(FR-060 AC4, FR-062, D-026) — Task 021A.
 *
 * **색 계산은 이 컴포넌트 안에 없다.** `colorIndex`는 호출자(컨테이너 또는 `/sample`의
 * 사전 준비 코드)가 `hash(crew.id) mod 12`(`crewColorIndex`)와 같은 날짜 셀 충돌 회피
 * (`resolveCrewColorCollision`, 둘 다 `@/lib/rules/crew-color-hash`)로 **이미 결정한** 값이다.
 * 이 컴포넌트는 그 결과값을 `crewCertaintyVars`로 **조회**만 한다 — 판정(D-026의 "판단")과
 * 데이터 조회(`crew-palette.ts`의 "값")를 섞지 않는다는 경계를 컴포넌트 레벨에서도 지킨다.
 *
 * `certainty-confirmed` 유틸리티(`globals.css`)를 그대로 쓴다 — Meetup은 투표가 가결(FR-060)
 * 되어야만 존재하므로 항상 "확정" 상태이고, 별도 확정성 단계를 새로 만들 이유가 없다.
 */
export interface MeetupBarProps {
  crewName: string;
  title: string;
  /** 이 날짜 셀에서 최종 확정된 팔레트 인덱스(0-11). */
  colorIndex: number;
  /**
   * 상위 요소(날짜 셀 버튼)의 `aria-describedby`가 크루명·제목을 이미 전달할 때 `true`로
   * 넘긴다 — 이중 안내를 피하려고 이 바 자신의 `aria-label`을 끄고 `aria-hidden`을 켠다
   * (FR-061 AC3는 "바 하나"의 접근성을 요구하지만, 그 정보 전달 경로가 바 자신일 필요는
   * 없다 — `MonthCalendar.tsx`의 셀 구현 참고). `/sample`의 단독 데모처럼 감싸는 설명이
   * 없는 맥락에서는 생략해 바 자신이 라벨을 낸다.
   */
  hideOwnLabel?: boolean;
  className?: string;
}

export function MeetupBar({ crewName, title, colorIndex, hideOwnLabel, className }: MeetupBarProps) {
  const vars = crewCertaintyVars(colorIndex) as CSSProperties;
  // 마우스 사용자용 네이티브 툴팁과 스크린 리더용 aria-label은 같은 정보(크루명 + 제목)를
  // 전달하므로 같은 문구를 공유한다 — 구분자를 따로 하드코딩하면 두 사용자군이 서로 다른
  // 표기를 받는다(팀장 지적, D-1). 툴팁과 라벨의 문구를 의도적으로 다르게 가야 할 이유가
  // 생기면 그때 `ko.ts`에 별도 키를 만들고 이유를 주석으로 남긴다.
  const barLabel = t((s) => s.calendar.month.barAriaLabel, { crewName, title });

  return (
    <div
      className={cn(
        "certainty-confirmed flex h-5 w-full min-w-0 items-center overflow-hidden rounded-sm px-1.5",
        className,
      )}
      style={vars}
      // `title`과 `aria-label`을 같은 렌더 경로에서 절대 동시에 채우지 않는다(D-1 마지막 겹,
      // CORE 재판정 fail(minor) 반영). 근거 — W3C accname-1.2(Accessible Name and Description
      // Computation): 이름 계산에서 `aria-label`이 있으면 그 값이 이름으로 확정되고, `title`은
      // "이름 계산에 쓰이지 않았을 때만" 설명으로 채택된다. 즉 `aria-label`이 이름을 이미
      // 가져갔으므로 같은 요소의 `title`은 **설명**으로 넘어가 이름·설명 둘 다 노출된다 — 실측으로도
      // NVDA + Chrome/Firefox가 `aria-label`을 읽은 뒤 같은 문자열의 `title`을 이어 읽는 이중
      // 발화가 보고돼 있다(NVDA 이슈 #7841·#11764. JAWS는 title을 무시해 AT마다 갈린다는 점
      // 자체가 예측 불가능한 잉여 정보라는 뜻이다).
      //
      // 그래서 두 속성을 상호 배타적으로 둔다: `hideOwnLabel`(프로덕션 — `MonthCalendar.tsx`가
      // 셀 안에서 `aria-hidden`으로 감쌀 때)에는 이 div가 접근성 트리에서 아예 빠지므로 `title`이
      // 마우스 전용 네이티브 툴팁으로만 남는다 — 여기서는 켠다(크루명 span이 좁은 폭에서
      // 말줄임되므로 마우스 사용자가 전체 텍스트를 볼 유일한 수단). 반대로 `hideOwnLabel`이 없는
      // 단독 렌더(현재 `/sample`의 정적 데모가 유일한 소비처)에서는 `aria-label`이 이미 같은
      // 문자열을 접근성 트리에 올리므로 `title`을 끈다 — 마우스 툴팁 하나를 잃는 대가로
      // 스크린리더 이중 발화를 막는 쪽을 택했다(이 경로는 프로덕션 캘린더 격자가 아니라 쇼케이스
      // 카드 하나뿐이라 트레이드오프가 작다). **여기 `title`을 다시 채우고 싶다면 이 주석부터
      // 다시 읽을 것** — 단독 렌더 경로에서 되돌리면 위 이중 발화가 그대로 재현된다.
      title={hideOwnLabel ? barLabel : undefined}
      aria-hidden={hideOwnLabel ? true : undefined}
      aria-label={hideOwnLabel ? undefined : barLabel}
    >
      <span className="truncate text-xs leading-none font-medium">{crewName}</span>
    </div>
  );
}
