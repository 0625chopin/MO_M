import { ToastTriggerPreview } from "@/components/sample/sections/ToastTriggerPreview";
import { defineSection } from "@/components/sample/showcase-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

/**
 * Task 013 2단계 — 오버레이·피드백 원자(Dialog·BottomSheet·Toast). 셋 다 `@base-ui/react`
 * 원시 위에 얹었고, **포커스 트랩·Esc·복귀 포커스는 프리미티브가 기본 제공한다**(NFR-020).
 *
 * - **Dialog**: 공식 문서(`docs/react/components/dialog.md`) "Focus moves inside the dialog
 *   when it opens. Tab and Shift+Tab loop within, and Esc requests close." / "returns focus
 *   back where it started when closed."
 * - **Drawer(BottomSheet)**: Dialog와 "같은 모달 계열이라 보장이 같을 것"이라고 추정하지 않고,
 *   Drawer 자신의 문서에서 복귀 포커스·포커스 트랩 문구를 **표 두 개에서 각각** 확인했다 —
 *   `docs/react/components/drawer.md`의 **`### Popup` prop 표**: `finalFocus` — "Move focus
 *   based on the default behavior (**trigger or previously focused element**)." (Default
 *   컬럼은 `-`라 "기본값이 이 동작"이라는 문구는 문서 직접 인용이 아니라, `drawer.tsx`가
 *   `finalFocus`를 넘기지 않을 때 `DrawerPopup.js`가 `undefined`를 그대로 내부 포커스
 *   매니저에 전달하는 코드를 근거로 한 추정이다 — 확정 인용과 구분해 둔다). 그리고
 *   **`### Root` prop 표**: `modal`(기본값 `true`) — "focus is trapped, document page scroll
 *   is locked". 두 prop은 서로 다른 표 소속이고(`Drawer`가 `modal`을 받아
 *   `DrawerPrimitive.Root modal={modal}`로 넘긴다), 인용을 합쳐 쓰지 않는다.
 *
 * 이 파일은 그 위에 트리거·제목·설명·버튼 배치만 조립한다 — 포커스 관리 코드를 직접 작성하지
 * 않는다(직접 작성했다면 그게 오히려 "나중에 넣기 어려운 구조"를 만들었을 것이다, 팀장 지시
 * 참고). 다만 이 근거는 문서 확인이고 실제 브라우저 동작 실측(Playwright)은 아직 못 했다 —
 * Task 024 접근성 QA 패스에서 실측한다(`src/components/README.md` "라이트·다크" 항목 참고).
 */
export const overlaysSection = defineSection({
  id: "overlays",
  label: "오버레이·피드백",
  title: "오버레이·피드백 원자",
  description:
    "Dialog · BottomSheet(Drawer) · Toast. 열림·닫힘은 원시 컴포넌트가 비제어로 관리해서, 이 파일은 함수(클로저)를 만들지 않고 정적 JSX만 조립합니다 — Toast만 버튼 클릭이 필요해 별도 클라이언트 트리거(`ToastTriggerPreview`)를 씁니다.",
  items: [
    {
      name: "Dialog",
      note: "모달. 배경 클릭·Esc·오른쪽 위 닫기 버튼 전부 동일하게 닫히고, 트리거로 포커스가 돌아옵니다.",
      content: (
        <div className="flex items-center gap-2 rounded-lg border border-border p-4">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>모임 만들기</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 모임 제안</DialogTitle>
                <DialogDescription>
                  제목과 일정만 먼저 정하고, 세부 사항은 게시글에서 채워도 돼요.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button size="sm">계속</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" size="sm" />}>크루 탈퇴</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>정말 탈퇴할까요?</DialogTitle>
                <DialogDescription>
                  탈퇴하면 이 크루의 채팅·게시글 접근 권한을 잃어요. 다시 가입하려면 초대가 필요해요.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button size="sm" variant="outline">
                  취소
                </Button>
                <Button size="sm" variant="destructive">
                  탈퇴하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
    {
      name: "BottomSheet",
      note: "Drawer(swipeDirection=\"down\")를 모바일 하단 시트로 씁니다. 스와이프 핸들과 아래로 끌어 닫기가 기본 제공됩니다.",
      content: (
        <div className="rounded-lg border border-border p-4">
          <Drawer showSwipeHandle>
            <DrawerTrigger render={<Button variant="outline" size="sm" />}>모임 상세 열기</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>한강 야간 러닝</DrawerTitle>
                <DrawerDescription>8월 14일 19:30 · 정원 20명 중 12명 참석 확정</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button size="sm">참석</Button>
                <DrawerClose render={<Button size="sm" variant="outline" />}>닫기</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      ),
    },
    {
      name: "Toast",
      note: "priority가 aria-live 강도를 정합니다 — 기본은 polite, 파괴적 알림(variant: \"destructive\")만 assertive입니다(NFR-021). 실제 렌더는 루트 레이아웃의 <Toaster />가 맡습니다.",
      content: (
        <div className="rounded-lg border border-border p-4">
          <ToastTriggerPreview />
        </div>
      ),
    },
  ],
});
