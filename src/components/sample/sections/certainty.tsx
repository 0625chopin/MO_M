import { defineSection } from "@/components/sample/showcase-types";
import { CREW_PALETTE, crewCertaintyVars } from "@/lib/crew-palette";

import type { CSSProperties } from "react";

/* ── 확정성 스케일 (시그니처) ──────────────────────────────────────────── */

const CERTAINTY_STEPS = [
  {
    key: "draft",
    cls: "certainty-draft",
    label: "제안",
    when: "투표 중 · 아직 아무것도 아니다",
  },
  {
    key: "pending",
    cls: "certainty-pending",
    label: "대기",
    when: "정족수 충족, 판정 대기 · 굳어지는 중",
  },
  {
    key: "confirmed",
    cls: "certainty-confirmed",
    label: "확정",
    when: "가결 · 달력에 박혔다",
  },
] as const;

export const certaintySection = defineSection({
  id: "certainty",
  label: "확정성 스케일",
  title: "확정성 스케일",
  description: (
    <>
      이 제품의 한 줄은 &ldquo;채팅에 묻힌 약속을 투표로 확정해 캘린더에 남긴다&rdquo;입니다.
      그 서사를 <strong className="font-medium text-foreground">채도</strong>에 실었습니다.
      캘린더 셀·투표 카드·Meetup 배지·알림이 전부 같은 세 단계를 씁니다. 채움 위 글자색은
      색마다 다릅니다 — 12색의 휘도가 0.1365~0.2725에 걸쳐 있어 한 가지 글자색으로는 본문
      4.5:1을 맞출 수 없습니다. 어느 쪽을 쓸지는{" "}
      <code className="font-mono text-xs">crew-palette.ts</code>의{" "}
      <code className="font-mono text-xs">textOn</code>이 지정합니다.
    </>
  ),
  items: [
    {
      name: "3단계",
      note: "크루 색 없이(무채 폴백) 쓰면 크루 맥락 밖에서도 안전합니다.",
      content: (
        <div className="flex flex-wrap gap-3">
          {CERTAINTY_STEPS.map((step) => (
            <div key={step.key} className="flex flex-col gap-1.5">
              <span
                className={`${step.cls} inline-flex h-8 items-center rounded-md px-3 text-xs font-medium`}
              >
                {step.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{step.when}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "크루 12색 × 3단계",
      note: "색 순서는 색상환 순서가 아니라 2형 색각 시뮬레이션 CIEDE2000 거리 기준 최원점 정렬입니다(D-026). 같은 날 색이 겹칠 때 걷는 순서라 임의로 정렬하면 안 됩니다.",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          {CREW_PALETTE.map((color) => {
            const vars = crewCertaintyVars(color.index) as CSSProperties;
            return (
              <div
                key={color.index}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2"
              >
                <code className="tnum w-6 shrink-0 font-mono text-[11px] text-muted-foreground">
                  {String(color.index + 1).padStart(2, "0")}
                </code>
                {CERTAINTY_STEPS.map((step) => (
                  <span
                    key={step.key}
                    style={vars}
                    className={`${step.cls} inline-flex h-7 flex-1 items-center justify-center rounded px-2 text-[11px] font-medium`}
                  >
                    {step.label}
                  </span>
                ))}
                <span className="w-14 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                  {color.textOn}
                </span>
              </div>
            );
          })}
        </div>
      ),
    },
  ],
});
