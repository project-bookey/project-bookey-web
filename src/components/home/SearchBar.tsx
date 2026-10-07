import { Search } from 'lucide-react';

import { iconSize, iconStroke } from '@/components/ui/icon';

/** 책 검색 칸 — 표준 GET 폼. Enter 로 /search?q= 에 보낸다(자바스크립트 없이도 동작). */
export function SearchBar({ defaultValue = '', autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" method="get" role="search" className="flex items-center gap-2 rounded-md border border-line bg-surface px-3">
      <Search size={iconSize.inline} aria-hidden className="shrink-0 text-text-faint" {...iconStroke} />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="책 제목이나 지은이로 찾기"
        aria-label="책 검색"
        autoComplete="off"
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="min-h-12 w-full bg-transparent text-[15px] text-text placeholder:text-text-faint focus:outline-none"
      />
      <button type="submit" className="pressable t-label shrink-0 text-text-muted">
        찾기
      </button>
    </form>
  );
}
