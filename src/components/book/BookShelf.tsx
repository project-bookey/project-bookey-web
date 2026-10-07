import Link from 'next/link';
import type { ReactNode } from 'react';

import { BookCover } from '@/components/ui/BookCover';
import { rowOffsetFor, tiltFor } from '@/lib/collage';

export type ShelfBook = {
  key: string;
  bookId: number;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  /** 인기 선반의 순위(1부터). */
  rank?: number;
};

const COVER_W = 96;
const MAX_OFFSET = 14;

/**
 * 가로 표지 선반 — 홈 '요즘 많이 읽는 책'·'추천', 검색 빈 화면이 쓴다.
 * staggered 면 표지를 지그재그로 흩는다(기울기 + 세로 오프셋) — 한 화면에 한 선반만.
 */
export function BookShelf({
  title,
  label,
  books,
  staggered = false,
  action,
  emptyNote = '아직 준비 중이에요',
}: {
  title: string;
  label?: string;
  books: ShelfBook[];
  staggered?: boolean;
  action?: ReactNode;
  emptyNote?: string;
}) {
  const hasRank = books.some((book) => book.rank != null);
  const bleedTop = hasRank ? 16 : staggered ? 5 : 0;
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 px-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="text-[18px] font-bold leading-[26px] text-text">{title}</h2>
          {label ? <span className="t-mono-eyebrow text-text-muted">{label}</span> : null}
        </div>
        {action}
      </div>
      {books.length === 0 ? (
        <div className="flex flex-col gap-2 px-4">
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-sm border border-dashed border-line-strong" style={{ width: COVER_W, height: COVER_W * 1.5 }} />
            ))}
          </div>
          <p className="t-mono-label text-text-faint">{emptyNote}</p>
        </div>
      ) : (
        <ul className="shelf gap-3 px-4" style={{ paddingTop: bleedTop, paddingBottom: staggered ? MAX_OFFSET + 4 : 4 }}>
          {books.map((book, index) => {
            const offsetY = staggered ? rowOffsetFor(index) : 0;
            return (
              <li key={book.key} style={{ width: COVER_W, transform: offsetY ? `translateY(${offsetY}px)` : undefined }}>
                <Link href={`/books/${book.bookId}`} className="pressable block" aria-label={book.author ? `${book.title}, ${book.author}` : book.title}>
                  <div className="relative">
                    <BookCover uri={book.coverUrl} title={book.title} width={COVER_W} tilt={staggered ? tiltFor(index) : 0} />
                    {book.rank != null ? (
                      <span className="t-mono-numeral absolute -left-1 -top-2 flex h-[26px] w-[26px] items-center justify-center rounded-sm bg-ink text-on-ink">
                        {book.rank}
                      </span>
                    ) : null}
                  </div>
                  <p className="t-caption mt-2 truncate font-bold text-text" aria-hidden>
                    {book.title}
                  </p>
                  {book.author ? (
                    <p className="t-caption truncate text-text-faint" aria-hidden>
                      {book.author}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
