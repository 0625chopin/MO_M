import { Badge } from "@/components/ui/badge";
import { strings } from "@/lib/strings";
import type { PostType } from "@/lib/types";

/** 일반글/모임 제안 유형 배지(FR-031 AC3). 순수 표현 — props만 받는다(D-030 ①). */
export function PostTypeBadge({ type }: { type: PostType }) {
  const label = type === "meetup_proposal" ? strings.board.postType.proposal : strings.board.postType.free;
  return <Badge variant={type === "meetup_proposal" ? "default" : "secondary"}>{label}</Badge>;
}
