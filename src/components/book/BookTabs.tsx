import Link from 'next/link';
import type { ReactNode } from 'react';

import { groupNumber } from '@/lib/format';

export type BookTab = 'review' | 'post';

/**
 * 도서 상세의 리뷰 | 독후감 두 글자 탭 — 켜진 쪽만 밝고 아래 초록 밑줄 토막(앱 A1). 개수는 리뷰에만(서버가 독후감 총수를 주지 않는다).
 * 탭은 주소(?tab=)로 바뀐다.
 */
export function BookTabs({ bookId, active, reviewCount, action }: { bookId: number; active: BookTab; reviewCount?: number; action?: ReactNode }) {
  const tabs: { value: BookTab; label: string; count?: number }[] = [
    { value: 'review', label: '리뷰', count: reviewCount },
    { value: 'post', label: '독후감' },
  ];
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex gap-4" role="tablist">
        {tabs.map((tab) => {
          const on = tab.value === active;
          return (
            <Link
              key={tab.value}
              href={`/books/${bookId}?tab=${tab.value}`}
              role="tab"
              aria-selected={on}
              scroll={false}
              className={`pressable relative inline-flex min-h-11 items-end pb-2 text-[18px] font-bold leading-6 ${on ? 'text-text' : 'text-text-faint'}`}
            >
              {tab.label}
              {tab.count != null ? <span className="t-mono-numeral ml-1 text-text-faint">{groupNumber(tab.count)}</span> : null}
              <span aria-hidden className={`absolute inset-x-0 bottom-0 h-[2px] ${on ? 'bg-accent' : 'bg-transparent'}`} />
            </Link>
          );
        })}
      </div>
      {action}
    </div>
  );
}
