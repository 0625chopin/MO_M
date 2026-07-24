import { Fragment } from "react";

import type { ShowcaseItem, ShowcaseSection } from "@/components/sample/showcase-types";
import { StatePreview } from "@/components/sample/StatePreview";
import { Separator } from "@/components/ui/separator";

/**
 * `ShowcaseSection` 하나를 헤더 + 항목 목록으로 렌더링한다. `registry.ts`가 조립한 데이터를
 * 그대로 소비하므로, 새 카테고리를 등록해도 이 컴포넌트는 고칠 필요가 없다.
 */
export function ShowcaseSectionBlock({ section }: { section: ShowcaseSection }) {
  return (
    <section id={section.id} className="flex scroll-mt-28 flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {section.description}
        </p>
      </div>
      {section.items.map((item, index) => (
        <Fragment key={item.name}>
          {index > 0 && <Separator />}
          <ShowcaseItemBlock item={item} />
        </Fragment>
      ))}
    </section>
  );
}

function ShowcaseItemBlock({ item }: { item: ShowcaseItem }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        {/* 모노를 쓰지 않는다 — Geist Mono에는 한글 글리프가 없어서 항목 이름에 한글이 섞이면
            OS 폰트로 폴백되고 같은 줄에서 서체가 갈린다. */}
        <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
        {item.note && (
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{item.note}</p>
        )}
      </div>
      {item.panels ? <StatePreview panels={item.panels} /> : item.content}
    </div>
  );
}
