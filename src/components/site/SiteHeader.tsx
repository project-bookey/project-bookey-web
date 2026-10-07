import { Search } from 'lucide-react';
import Link from 'next/link';

import { InstallButton } from '@/components/install/InstallButton';
import { iconSize, iconStroke } from '@/components/ui/icon';

import { SiteNav } from './SiteNav';
import { Wordmark } from './Wordmark';

/**
 * 공통 헤더 — 종이색 고정 띠(하단 헤어라인). 왼쪽 워드마크(홈), 가운데 홈·광장·책 찾기, 오른쪽 검색 칸(데스크톱)과 '앱 설치' 보조 버튼.
 * 휴대폰에서는 검색 칸 대신 검색 아이콘 링크가 선다. 설치 버튼은 보조(tonal)다 — 페이지의 주요(초록) 버튼은 그 페이지의 핵심 전환 하나뿐.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="content flex min-h-[60px] items-center gap-3 md:min-h-[72px] md:gap-6">
        <Link href="/" aria-label="Bookey 홈" className="pressable shrink-0 py-2">
          <Wordmark width={92} className="md:hidden" />
          <Wordmark width={120} className="hidden md:block" />
        </Link>
        <SiteNav />
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <form action="/search" method="get" role="search" className="hidden items-center gap-2 rounded-md border border-line bg-surface px-3 md:flex md:w-64 lg:w-80">
            <Search size={iconSize.inline} aria-hidden className="shrink-0 text-text-faint" {...iconStroke} />
            <input
              type="search"
              name="q"
              placeholder="책 제목이나 지은이"
              aria-label="책 검색"
              autoComplete="off"
              enterKeyHint="search"
              className="min-h-10 w-full bg-transparent text-[14px] text-text placeholder:text-text-faint focus:outline-none"
            />
          </form>
          <InstallButton reason="generic" size="sm" icon="none" className="shrink-0 md:min-h-10 md:px-4 md:text-[13px]">
            앱 설치
          </InstallButton>
        </div>
      </div>
    </header>
  );
}
