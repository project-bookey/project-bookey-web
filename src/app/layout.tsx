import type { Metadata, Viewport } from 'next';
import { Gowun_Batang } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

import { InstallBanner } from '@/components/install/InstallBanner';
import { InstallProvider } from '@/components/install/InstallProvider';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getInstallConfig } from '@/lib/install';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

/** 고운바탕 — 앱과 같은 서체 하나(400·700). 빌드 때 서브셋 WOFF2 로 자가 호스팅한다. */
const gowun = Gowun_Batang({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gowun',
});

const TITLE = `${SITE_NAME} — 독서 기록과 독후감이 모이는 곳`;

export function generateMetadata(): Metadata {
  const { appStoreId } = getInstallConfig();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: TITLE, template: `%s · ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'ko_KR', title: TITLE, description: SITE_DESCRIPTION },
    twitter: { card: 'summary_large_image' },
    // App Store ID 가 생기면 iOS Safari 가 글 위에 스마트 배너를 띄운다.
    itunes: appStoreId ? { appId: appStoreId, appArgument: SITE_URL } : undefined,
  };
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0e0d' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const config = getInstallConfig();
  return (
    <html lang="ko" className={`${gowun.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <InstallProvider config={config}>
          <SiteHeader />
          <main className="flex-1 pb-8">{children}</main>
          <SiteFooter supportEmail={config.supportEmail} />
          <InstallBanner />
        </InstallProvider>
      </body>
    </html>
  );
}
