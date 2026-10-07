'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { iconSize, iconStroke } from '@/components/ui/icon';

const LINKS = [
  { href: '/', label: '홈', match: (path: string) => path === '/' },
  { href: '/plaza', label: '광장', match: (path: string) => path.startsWith('/plaza') },
] as const;

/** 헤더 가운데 글자 링크 — 지금 있는 곳은 잉크 글자 + 아래 초록 표식(앱 구역 탭과 같은 예외). */
export function SiteNav() {
  const pathname = usePathname();
  const searching = pathname.startsWith('/search');
  return (
    <nav className="flex items-center gap-1" aria-label="주요 메뉴">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`pressable relative inline-flex min-h-11 items-center px-2 text-[14px] font-bold ${active ? 'text-text' : 'text-text-muted'}`}
          >
            {link.label}
            {active ? <span aria-hidden className="absolute inset-x-2 bottom-1.5 h-[2px] bg-accent" /> : null}
          </Link>
        );
      })}
      <Link
        href="/search"
        aria-label="책 검색"
        aria-current={searching ? 'page' : undefined}
        className={`pressable relative inline-flex h-11 w-11 items-center justify-center ${searching ? 'text-text' : 'text-text-muted'}`}
      >
        <Search size={iconSize.button} aria-hidden {...iconStroke} />
        {searching ? <span aria-hidden className="absolute inset-x-2.5 bottom-1.5 h-[2px] bg-accent" /> : null}
      </Link>
    </nav>
  );
}
