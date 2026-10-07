import Link from 'next/link';

import { InstallButton } from '@/components/install/InstallButton';

import { SiteNav } from './SiteNav';
import { Wordmark } from './Wordmark';

/**
 * 공통 헤더 — 종이색 고정 띠(하단 헤어라인). 왼쪽 워드마크(홈), 가운데 홈·광장·검색, 오른쪽 '앱 설치' 보조 버튼.
 * 설치 버튼은 보조(tonal)다 — 페이지의 주요(초록) 버튼은 그 페이지의 핵심 전환 하나뿐이다.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="content flex min-h-[60px] items-center justify-between gap-2">
        <Link href="/" aria-label="Bookey 홈" className="pressable shrink-0 py-2">
          <Wordmark width={92} />
        </Link>
        <SiteNav />
        <InstallButton reason="generic" size="sm" icon="none" className="shrink-0">
          앱 설치
        </InstallButton>
      </div>
    </header>
  );
}
