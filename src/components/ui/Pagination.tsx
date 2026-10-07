import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { buttonClass } from './Button';
import { iconStroke } from './icon';

/** 쪽 넘기기 — '이전'·'다음' 보조 버튼과 가운데 쪽수. 주소의 ?page= 로 서버가 다시 그린다. */
export function Pagination({
  page,
  hasNext,
  totalPages,
  hrefFor,
}: {
  page: number;
  hasNext: boolean;
  totalPages?: number;
  hrefFor: (page: number) => string;
}) {
  if (page === 0 && !hasNext) return null;
  const disabled = 'pointer-events-none opacity-35';
  return (
    <nav className="mt-6 flex items-center justify-between gap-3" aria-label="쪽 넘기기">
      <Link
        href={hrefFor(Math.max(0, page - 1))}
        aria-disabled={page === 0}
        className={buttonClass('tonal', 'sm', page === 0 ? disabled : '')}
      >
        <ChevronLeft size={14} aria-hidden {...iconStroke} />
        이전
      </Link>
      <span className="t-mono-numeral text-text-faint">
        {page + 1}
        {totalPages ? ` / ${totalPages}` : ''}
      </span>
      <Link href={hrefFor(page + 1)} aria-disabled={!hasNext} className={buttonClass('tonal', 'sm', hasNext ? '' : disabled)}>
        다음
        <ChevronRight size={14} aria-hidden {...iconStroke} />
      </Link>
    </nav>
  );
}

/** 세그먼트(링크) — 회색 톤 트랙 안에 고른 칸만 종이색(thumb). 칸은 주소로 바뀐다. */
export function SegmentedLinks({ items, className = '' }: { items: { href: string; label: string; active: boolean }[]; className?: string }) {
  return (
    <div className={`inline-flex gap-[3px] rounded-button bg-tonal p-[3px] ${className}`} role="tablist">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          role="tab"
          aria-selected={item.active}
          className={`pressable inline-flex min-h-[38px] min-w-20 items-center justify-center rounded-control px-3 text-[12px] font-bold ${
            item.active ? 'bg-thumb text-text' : 'text-text-muted'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
