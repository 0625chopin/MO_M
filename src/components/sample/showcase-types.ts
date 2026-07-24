import type { SampleState } from "@/components/sample/StatePreview";

import type { ReactNode } from "react";

/**
 * `/sample` 등록 인터페이스(Task 012). 다른 팀원은 `src/app/sample/page.tsx`를 고치지 않고
 * `src/components/sample/sections/<own-file>.tsx`에서 `defineSection`으로 섹션 하나를 만들고
 * `registry.ts`의 배열에 한 줄만 추가하면 된다. 사용법은 `src/components/sample/README.md` 참고.
 */
interface ShowcaseItemBase {
  /** 항목 이름. 섹션 안에서 고유해야 한다(카드 제목으로 그대로 노출된다). */
  name: string;
  /** 무엇을·왜 확인해야 하는지 한두 문장. */
  note?: ReactNode;
}

/**
 * `panels`(상태 토글)와 `content`(정적 데모)는 정확히 하나만 채운다 — discriminated union이라
 * 둘 다 채우거나 둘 다 비우면 **컴파일 에러**다. 테스트 러너가 없어(R-002) 타입 레벨 강제가
 * 유일한 방어선이라 여기서 잡는다.
 */
export type ShowcaseItem =
  | (ShowcaseItemBase & {
      /**
       * 기본·로딩·빈·오류 상태별 렌더(`StatePreview`에 그대로 전달된다). 일부 상태만 의미 있으면
       * 해당 키만 채운다(예: 빈 화면 컴포넌트는 empty·error만). "오류"에는 네트워크 실패뿐 아니라
       * 도메인 오류(RLS 403·정원 마감·동시 수정 충돌)를 포함한다(D-030 ③).
       */
      panels: Partial<Record<SampleState, ReactNode>>;
      content?: never;
    })
  | (ShowcaseItemBase & {
      /** 상태 토글이 필요 없는 정적 데모(팔레트 스와치 등). */
      content: ReactNode;
      panels?: never;
    });

export interface ShowcaseSection {
  /** 앵커 링크·`id` 속성에 쓰이는 slug. 다른 섹션과 겹치지 않아야 한다. */
  id: string;
  /** 상단 앵커 내비에 쓰이는 짧은 라벨. */
  label: string;
  /** 섹션 헤더 제목. 보통 `label`과 같지만 더 긴 문구를 쓸 수 있다. */
  title: string;
  description: ReactNode;
  items: ShowcaseItem[];
}

/** 타입 추론용 항등 함수. 섹션을 객체 리터럴로 쓰되 IDE 자동완성·타입 검사를 받기 위해 감싼다. */
export function defineSection(section: ShowcaseSection): ShowcaseSection {
  return section;
}
