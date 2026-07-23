import { Geist_Mono, Noto_Sans_KR } from "next/font/google";

import { AppShell } from "@/components/shell/AppShell";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { strings } from "@/lib/strings";

import type { Metadata } from "next";
import "./globals.css";

/**
 * 본문·제목 서체. **개편 전까지 이 앱에는 한글 서체가 지정돼 있지 않았다** —
 * Geist에는 한글 글리프가 없어서 화면의 거의 모든 문자(제품 언어가 한국어다,
 * D-011)가 OS 폴백(Windows 맑은 고딕 / macOS Apple SD Gothic Neo)으로 렌더됐고,
 * 자간·굵기·행간이 기기마다 달라 조판을 통제할 수 없었다.
 *
 * **굵기를 지정하지 않는 것은 의도적이다** — 생략하면 next/font가 **가변 폰트**를 쓴다.
 * 한글 웹폰트에서 이건 단순한 취향이 아니라 용량 문제다. 구글 CSS API 실측:
 *
 *   고정 400 + 600 → 조각 248개 · 6,874KB
 *   가변 100~900   → 조각 124개 · 3,437KB
 *
 * 가변 쪽이 **조각 수도 용량도 절반**이면서 굵기 전 범위를 준다. 고정 굵기를 하나만
 * 써도 124조각·3.4MB로 가변과 같으므로, 이 폰트에서는 가변이 언제나 이득이다.
 * (직전까지 쓰던 IBM Plex Sans KR은 가변 판이 없어 굵기마다 별도 파일이었고, 그래서
 * 거기서는 굵기를 400·600 두 종으로 묶어야 했다.)
 *
 * `preload: false`도 **의도적이며 실측에 근거한다.** 구글은 한글 폰트를 유니코드 범위별로
 * 잘게 쪼개 배포하고 next/font는 그 조각을 전부 셀프 호스팅한다. preload를 켜 두면 그중
 * 수십 개가 `<link rel="preload">`로 초기 문서에 박혀 첫 화면에서 폰트 요청이 한꺼번에
 * 나간다 — 실제로 그 페이지에 쓰인 글자가 속한 조각은 몇 개뿐인데도 그렇다.
 *
 * 끄면 브라우저가 `unicode-range`를 보고 **화면에 실제로 나온 글자가 속한 조각만** 내려받는다.
 * 대가는 첫 페인트에서 폴백 서체가 잠깐 보이는 것(`display: "swap"`)인데, next/font가 폴백
 * 메트릭을 자동으로 맞춰 주므로 레이아웃 이동(CLS)은 생기지 않는다.
 */
const sansKr = Noto_Sans_KR({
  variable: "--font-sans-kr",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/**
 * 수·시각 전용 서체. 코드 블록용이 아니라 **득표수·정족수·시각·날짜의 서체**로
 * 쓴다(`globals.css`의 `--font-mono` 주석, `.tnum` 유틸리티 참고). 투표 집계와
 * 캘린더가 이 제품의 뼈대라 숫자에 고유한 얼굴을 준 것이 위계 장치다.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: strings.common.appName,
  description: strings.landing.hero.title,
};

/**
 * 루트 레이아웃 — Task 011의 구성 루트(D-030 ④). `getAuthSession()`으로 세션을 조회해
 * `AppShell`(표현 컴포넌트)에 props로 내려준다(D-030 ①). 실제 인증 스택이 들어와도
 * `getAuthSession()` 내부만 바뀌고 이 조립 방식은 그대로다.
 *
 * `lang="ko"` — v0.1은 한국어 단독이고 로케일 경로 세그먼트를 두지 않는다(D-011). 이전 값
 * `lang="en"`은 `create-next-app` 스캐폴드 기본값이 그대로 남아 있던 것으로, 실제 콘텐츠
 * 언어와 불일치해 접근성 문제(스크린 리더 발음)였다 — 이번에 함께 고쳤다.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <html
      lang="ko"
      className={`${sansKr.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell session={session}>{children}</AppShell>
      </body>
    </html>
  );
}
