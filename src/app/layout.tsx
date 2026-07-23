import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/shell/AppShell";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { strings } from "@/lib/strings";

import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell session={session}>{children}</AppShell>
      </body>
    </html>
  );
}
