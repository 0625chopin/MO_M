import { strings } from "@/lib/strings";

/**
 * 크루 개설 페이지 (SC-08, PRD §6 "크루 개설 페이지", F005). 색상은 자동 배정이라 이 폼에서
 * 묻지 않는다(D-016).
 */
export default function CrewCreatePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.crew.create.title}
      </h1>
    </main>
  );
}
