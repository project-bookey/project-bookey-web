import Link from 'next/link';

import { BookCover } from '@/components/ui/BookCover';
import type { PopularBook } from '@/lib/types';

/** 인기 순위 목록(사이드바) — 순위·작은 표지·제목·지은이 한 줄씩. */
export function PopularList({ items, title = '요즘 많이 읽는 책' }: { items: PopularBook[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="mb-3 text-[17px] font-bold leading-6 text-text">{title}</h2>
      <ol className="flex flex-col">
        {items.map((item, index) => (
          <li key={item.book.id} className="border-t border-line first:border-t-0">
            <Link href={`/books/${item.book.id}`} className="pressable flex items-center gap-3 py-2" aria-label={`${index + 1}위 ${item.book.title}`}>
              <span className="t-mono-numeral w-5 shrink-0 text-text-faint">{index + 1}</span>
              <BookCover uri={item.book.coverUrl} title={item.book.title} width={32} />
              <span className="min-w-0 flex-1">
                <span className="t-label block truncate text-text">{item.book.title}</span>
                {item.book.author ? <span className="t-caption block truncate text-text-faint">{item.book.author}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
