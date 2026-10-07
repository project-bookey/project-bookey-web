import type { Metadata } from 'next';

import { BookShelf, type ShelfBook } from '@/components/book/BookShelf';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { HomeScraps } from '@/components/home/HomeScraps';
import { SearchBar } from '@/components/home/SearchBar';
import { HomeSection } from '@/components/ui/text';
import { bannerApi, bookApi, plazaApi, postApi } from '@/lib/endpoints';
import { settle } from '@/lib/settle';
import { SITE_DESCRIPTION } from '@/lib/site';

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

/** 홈 — 검색 → 배너 → 오늘의 글 → 요즘 많이 읽는 책 → 추천. 내 서재·클럽처럼 로그인이 있어야 보이는 묶음은 없다. */
export default async function HomePage() {
  const [banners, hot, finishes, popular, recommended] = await Promise.all([
    settle(bannerApi.list('AD'), 'banners'),
    settle(postApi.feed('HOT', 0, 5), 'hot posts'),
    settle(plazaApi.feed('FINISH', 0, 5), 'finishes'),
    settle(bookApi.popular(20), 'popular'),
    settle(bookApi.recommended(20), 'recommended'),
  ]);

  // 추천이 비었거나 못 받았으면 YES24 베스트셀러로 채운다(앱과 같다).
  let picks: ShelfBook[] = (recommended ?? []).map((book) => ({
    key: `pick-${book.id}`,
    bookId: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
  }));
  let picksLabel: string | undefined;
  if (picks.length === 0) {
    const bestsellers = (await settle(bookApi.yes24('BESTSELLER', 20), 'yes24')) ?? [];
    picks = bestsellers.map((book) => ({ key: `best-${book.id}`, bookId: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl }));
    picksLabel = 'YES24';
  }

  const popularBooks: ShelfBook[] = (popular ?? []).map((item, index) => ({
    key: `popular-${item.book.id}`,
    bookId: item.book.id,
    title: item.book.title,
    author: item.book.author,
    coverUrl: item.book.coverUrl,
    rank: index + 1,
  }));
  const hotPosts = hot?.content ?? [];
  const finishItems = finishes?.content ?? [];

  return (
    <div className="content flex flex-col gap-6 !px-0 pt-4">
      <div className="px-4">
        <SearchBar />
      </div>
      <div className="px-4">
        <BannerCarousel banners={banners ?? []} />
      </div>

      {hotPosts.length > 0 || finishItems.length > 0 ? (
        <HomeSection>
          <HomeScraps posts={hotPosts} finishes={finishItems} />
        </HomeSection>
      ) : null}

      <HomeSection>
        <BookShelf title="요즘 많이 읽는 책" label="LIVE" books={popularBooks} staggered />
      </HomeSection>

      <HomeSection>
        <BookShelf title="추천" label={picksLabel} books={picks} />
      </HomeSection>
    </div>
  );
}
