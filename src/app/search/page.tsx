import type { Metadata } from 'next';
import Link from 'next/link';

import { BookShelf, type ShelfBook } from '@/components/book/BookShelf';
import { SearchBar } from '@/components/home/SearchBar';
import { InstallAction } from '@/components/install/InstallButton';
import { BookCover } from '@/components/ui/BookCover';
import { EmptyState, HomeSection } from '@/components/ui/text';
import { ApiError } from '@/lib/api';
import { bookApi } from '@/lib/endpoints';
import { settle } from '@/lib/settle';
import type { Book } from '@/lib/types';

export const metadata: Metadata = {
  title: '책 검색',
  description: '제목이나 지은이로 책을 찾고 독자들의 리뷰와 독후감을 읽어 보세요.',
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 책 검색 — 결과가 있으면 줄 목록, 검색어가 없으면 추천·신간 선반. '담기'는 앱 설치 안내. */
export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const q = (raw ?? '').trim().slice(0, 100);

  if (!q) {
    const [recommended, fresh] = await Promise.all([settle(bookApi.recommended(20), 'recommended'), settle(bookApi.yes24('NEW', 20), 'yes24 new')]);
    return (
      <div className="content flex flex-col gap-6 !px-0 pt-4">
        <div className="px-4">
          <SearchBar autoFocus />
        </div>
        <HomeSection>
          <BookShelf title="추천" books={toShelf(recommended ?? [], 'pick')} />
        </HomeSection>
        <HomeSection>
          <BookShelf title="새로 나온 책" label="YES24" books={toShelf(fresh ?? [], 'new')} />
        </HomeSection>
      </div>
    );
  }

  let results: Book[] = [];
  let failure: string | null = null;
  try {
    results = await bookApi.search(q, 20);
  } catch (error) {
    failure = error instanceof ApiError && error.status === 429 ? error.message : '검색하지 못했어요. 잠시 후 다시 시도해 주세요.';
  }

  return (
    <div className="content flex flex-col gap-4 pt-4">
      <SearchBar defaultValue={q} />
      {failure ? (
        <EmptyState title={failure} />
      ) : results.length === 0 ? (
        <EmptyState title="찾는 책이 없어요" description="제목이나 지은이를 다르게 적어 보세요." />
      ) : (
        <ul className="flex flex-col">
          {results.map((book) => (
            <li key={book.id} className="flex items-center gap-3 border-b border-line py-3">
              <Link href={`/books/${book.id}`} className="pressable flex min-w-0 flex-1 items-center gap-3" aria-label={`${book.title} 책 정보`}>
                <BookCover uri={book.coverUrl} title={book.title} width={48} />
                <span className="min-w-0 flex-1">
                  <span className="clamp-2 t-body-strong text-text">{book.title}</span>
                  <span className="t-caption block truncate text-text-muted">
                    {[book.author, book.publisher].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </Link>
              <InstallAction reason="library" icon="plus" ariaLabel={`${book.title} 서재에 담기 — 앱에서`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toShelf(books: Book[], prefix: string): ShelfBook[] {
  return books.map((book) => ({ key: `${prefix}-${book.id}`, bookId: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl }));
}
