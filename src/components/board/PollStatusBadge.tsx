import { Badge, type badgeVariants } from "@/components/ui/badge";
import { strings } from "@/lib/strings";
import type { PollStatus } from "@/lib/types";

import type { VariantProps } from "class-variance-authority";


type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

/**
 * 모임 제안글의 투표 현재 상태 배지(FR-031 AC3). 문구는 `vote.status`를 그대로 재사용한다 —
 * 목록·상세가 같은 상태 머신 값에 두 벌의 문구 세트를 두지 않는다(`ko.ts`의 `board` 주석 참고).
 * 색만으로 상태를 구분하지 않도록 상태별 문구 자체가 이미 다르다(WCAG 1.4.1) — 아이콘은
 * 더하지 않았다: 배지는 목록에서 좁은 폭에 여러 개가 나란히 오므로 문구만으로 충분하다.
 */
const VARIANT_BY_STATUS: Record<PollStatus, BadgeVariant> = {
  open: "outline",
  closed_passed: "default",
  closed_rejected: "secondary",
  closed_invalid: "secondary",
  cancelled: "secondary",
};

const LABEL_BY_STATUS: Record<PollStatus, string> = {
  open: strings.vote.status.open,
  closed_passed: strings.vote.status.closedPassed,
  closed_rejected: strings.vote.status.closedRejected,
  closed_invalid: strings.vote.status.closedInvalid,
  cancelled: strings.vote.status.cancelled,
};

export function PollStatusBadge({ status }: { status: PollStatus }) {
  return <Badge variant={VARIANT_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</Badge>;
}
