// Schedule-X(@schedule-x/*)의 타입은 전역 `Temporal` 네임스페이스를 참조하지만 그 선언을
// 스스로 가져오지 않는다(런타임은 `temporal-polyfill/global` import가 채운다). `temporal-spec`
// 이 TC39 Temporal의 앰비언트 전역 타입을 제공하므로 프로젝트 전역에 한 번 로드해 둔다 —
// 이게 없으면 캘린더 뷰에서 `Temporal.PlainDate`가 "namespace를 찾을 수 없음"으로 뜬다.
/// <reference types="temporal-spec/global" />
