import { certaintySection } from "@/components/sample/sections/certainty";
import { errorsSection } from "@/components/sample/sections/errors";
import { formsSection } from "@/components/sample/sections/forms";
import { foundationSection } from "@/components/sample/sections/foundation";
import { overlaysSection } from "@/components/sample/sections/overlays";
import { primitivesSection } from "@/components/sample/sections/primitives";
import { shellSection } from "@/components/sample/sections/shell";
import type { ShowcaseSection } from "@/components/sample/showcase-types";
export { defineSection } from "@/components/sample/showcase-types";
export type { ShowcaseItem, ShowcaseSection } from "@/components/sample/showcase-types";

/**
 * `/sample`에 실제로 렌더링되는 섹션 목록 — Task 012 등록 인터페이스의 진입점.
 *
 * 새 카테고리를 등록하려면:
 * 1. `src/components/sample/sections/<my-domain>.tsx`에서 `defineSection({...})`으로 섹션을 만든다.
 * 2. 아래 배열에 import + 한 줄만 추가한다. `src/app/sample/page.tsx`와 다른 섹션 파일은
 *    건드리지 않는다.
 *
 * 자세한 사용법·예시는 `src/components/sample/README.md` 참고.
 */
export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  foundationSection,
  certaintySection,
  shellSection,
  primitivesSection,
  formsSection,
  overlaysSection,
  errorsSection,
];
