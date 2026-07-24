import { defineSection } from "@/components/sample/showcase-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Task 013 1단계 — 폼 원자 5종(Input·Textarea·Select·Checkbox·RadioGroup) + Label.
 *
 * 다섯 항목 모두 같은 배선 규칙을 따른다:
 * - `FieldLabel htmlFor`가 컨트롤 `id`와 짝을 이룬다(라벨 클릭 시 포커스 이동).
 * - 설명·오류는 컨트롤의 `aria-describedby`에 자신의 `id`를 등록한다 — 스크린 리더가 값을
 *   읽을 때 라벨 다음에 설명·오류를 이어 읽는다.
 * - 오류 상태는 `aria-invalid`를 컨트롤에 얹고, `FieldError`가 `role="alert"`로 즉시 안내한다
 *   (NFR-021). "오류" 패널만 있고 "로딩"·"빈 상태" 패널이 없는 이유는 원자 자체(입력 필드)가
 *   비동기 목록이 아니라서다 — 그 두 상태는 이 필드를 채우는 화면(예: 글쓰기 폼)의 몫이다.
 * - `@base-ui/react`의 Input·Checkbox·Radio 원시 컴포넌트는 히트 영역을 시각 크기보다 넓혀
 *   터치 대상 24×24(NFR-027)를 만족한다(각 파일의 `after:-inset-*` 참고).
 */
export const formsSection = defineSection({
  id: "forms",
  label: "폼 원자",
  title: "폼 원자",
  description:
    "Input · Textarea · Select · Checkbox · RadioGroup. 전부 shadcn 레지스트리(base-nova 스타일 → @base-ui/react)에서 그대로 받았고, 라벨·설명·오류 배선만 이 파일에서 맞췄습니다.",
  items: [
    {
      name: "Input",
      note: "라벨 htmlFor/id 연결, 오류 메시지는 aria-describedby로 컨트롤과 묶입니다.",
      panels: {
        default: (
          <div className="flex max-w-sm flex-col gap-4 rounded-lg border border-border p-4">
            <Field>
              <FieldLabel htmlFor="sample-input-nickname">닉네임</FieldLabel>
              <Input id="sample-input-nickname" placeholder="크루에서 보일 이름" aria-describedby="sample-input-nickname-desc" />
              <FieldDescription id="sample-input-nickname-desc">최대 20자, 다른 크루원에게 공개됩니다.</FieldDescription>
            </Field>
            <Field data-disabled>
              <FieldLabel htmlFor="sample-input-locked">크루 ID</FieldLabel>
              <Input id="sample-input-locked" defaultValue="weekend-hiking" disabled />
              <FieldDescription>개설 후에는 바꿀 수 없어요.</FieldDescription>
            </Field>
          </div>
        ),
        error: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <Field>
              <FieldLabel htmlFor="sample-input-nickname-invalid">닉네임</FieldLabel>
              <Input
                id="sample-input-nickname-invalid"
                defaultValue="관"
                aria-invalid="true"
                aria-describedby="sample-input-nickname-invalid-error"
              />
              <FieldError id="sample-input-nickname-invalid-error">닉네임은 2자 이상이어야 해요.</FieldError>
            </Field>
          </div>
        ),
      },
    },
    {
      name: "Textarea",
      note: "field-sizing-content라 내용에 맞춰 늘어납니다. 배선 규칙은 Input과 같습니다.",
      panels: {
        default: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <Field>
              <FieldLabel htmlFor="sample-textarea-bio">한줄 소개</FieldLabel>
              <Textarea id="sample-textarea-bio" placeholder="크루원에게 보여줄 소개를 적어 주세요" aria-describedby="sample-textarea-bio-desc" />
              <FieldDescription id="sample-textarea-bio-desc">최대 200자.</FieldDescription>
            </Field>
          </div>
        ),
        error: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <Field>
              <FieldLabel htmlFor="sample-textarea-bio-invalid">한줄 소개</FieldLabel>
              <Textarea
                id="sample-textarea-bio-invalid"
                defaultValue={"200자를 넘겨 작성한 매우 긴 소개 문구입니다. ".repeat(6)}
                aria-invalid="true"
                aria-describedby="sample-textarea-bio-invalid-error"
              />
              <FieldError id="sample-textarea-bio-invalid-error">200자를 넘었어요. 34자를 줄여 주세요.</FieldError>
            </Field>
          </div>
        ),
      },
    },
    {
      name: "Select",
      note: "SelectTrigger가 컨트롤 역할을 합니다 — 라벨·설명·오류 배선은 트리거의 id에 건다.",
      panels: {
        default: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <Field>
              <FieldLabel htmlFor="sample-select-capacity">모임 정원</FieldLabel>
              <Select defaultValue="8">
                <SelectTrigger id="sample-select-capacity" aria-describedby="sample-select-capacity-desc" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4명</SelectItem>
                  <SelectItem value="8">8명</SelectItem>
                  <SelectItem value="12">12명</SelectItem>
                  <SelectItem value="20">20명 (제한 없음에 가까움)</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription id="sample-select-capacity-desc">참석 확정 인원 상한이에요. 나중에 늘릴 수 있어요.</FieldDescription>
            </Field>
          </div>
        ),
        error: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <Field>
              <FieldLabel htmlFor="sample-select-capacity-invalid">모임 정원</FieldLabel>
              <Select>
                <SelectTrigger
                  id="sample-select-capacity-invalid"
                  aria-invalid="true"
                  aria-describedby="sample-select-capacity-invalid-error"
                  className="w-full"
                >
                  <SelectValue placeholder="정원을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4명</SelectItem>
                  <SelectItem value="8">8명</SelectItem>
                </SelectContent>
              </Select>
              <FieldError id="sample-select-capacity-invalid-error">정원을 선택해 주세요.</FieldError>
            </Field>
          </div>
        ),
      },
    },
    {
      name: "Checkbox",
      note: "체크박스는 시각 크기 16px이지만 히트 영역이 after 의사요소로 넓혀져 있어 24×24(NFR-027)를 만족합니다.",
      panels: {
        default: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <Field orientation="horizontal">
              <Checkbox id="sample-checkbox-agree" aria-describedby="sample-checkbox-agree-desc" />
              <FieldContent>
                <FieldLabel htmlFor="sample-checkbox-agree">이용약관에 동의합니다</FieldLabel>
                <FieldDescription id="sample-checkbox-agree-desc">크루 규칙과 개인정보 처리방침에 동의해야 개설할 수 있어요.</FieldDescription>
              </FieldContent>
            </Field>
          </div>
        ),
        error: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <Field orientation="horizontal">
              <Checkbox id="sample-checkbox-agree-invalid" aria-invalid="true" aria-describedby="sample-checkbox-agree-invalid-error" />
              <FieldContent>
                <FieldLabel htmlFor="sample-checkbox-agree-invalid">이용약관에 동의합니다</FieldLabel>
                <FieldError id="sample-checkbox-agree-invalid-error">계속하려면 동의가 필요해요.</FieldError>
              </FieldContent>
            </Field>
          </div>
        ),
      },
    },
    {
      name: "RadioGroup",
      note: "네이티브 fieldset·legend로 그룹을 묶습니다 — aria-label만 쓰는 것보다 보조기술 지원이 넓습니다.",
      panels: {
        default: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <FieldSet>
              <FieldLegend variant="label">공개 범위</FieldLegend>
              <RadioGroup defaultValue="crew" aria-describedby="sample-radio-visibility-desc">
                <Field orientation="horizontal">
                  <RadioGroupItem id="sample-radio-crew" value="crew" />
                  <FieldLabel htmlFor="sample-radio-crew">크루 공개</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem id="sample-radio-public" value="public" />
                  <FieldLabel htmlFor="sample-radio-public">전체 공개</FieldLabel>
                </Field>
              </RadioGroup>
              <FieldDescription id="sample-radio-visibility-desc">나중에 크루 설정에서 바꿀 수 있어요.</FieldDescription>
            </FieldSet>
          </div>
        ),
        error: (
          <div className="max-w-sm rounded-lg border border-border p-4">
            <FieldSet>
              <FieldLegend variant="label">공개 범위</FieldLegend>
              <RadioGroup aria-invalid="true" aria-describedby="sample-radio-visibility-invalid-error">
                <Field orientation="horizontal">
                  <RadioGroupItem id="sample-radio-crew-invalid" value="crew" aria-invalid="true" />
                  <FieldLabel htmlFor="sample-radio-crew-invalid">크루 공개</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem id="sample-radio-public-invalid" value="public" aria-invalid="true" />
                  <FieldLabel htmlFor="sample-radio-public-invalid">전체 공개</FieldLabel>
                </Field>
              </RadioGroup>
              <FieldError id="sample-radio-visibility-invalid-error">공개 범위를 선택해 주세요.</FieldError>
            </FieldSet>
          </div>
        ),
      },
    },
  ],
});
