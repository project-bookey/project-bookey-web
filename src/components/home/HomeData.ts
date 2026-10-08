import 'server-only';

import type { ShelfBook } from '@/components/book/BookShelf';
import { bannerApi, bookApi, plazaApi, postApi } from '@/lib/endpoints';
import { settle } from '@/lib/settle';
import type { Banner, PlazaItem, PopularBook, Post } from '@/lib/types';

export type HomeData = {
  banners: Banner[];
  hotPosts: Post[];
  finishes: PlazaItem[];
  popular: PopularBook[];
  popularBooks: ShelfBook[];
  picks: ShelfBook[];
  picksLabel?: string;
};

/** 홈이 쓰는 묶음 전부 — 한 묶음이 못 와도 나머지는 그린다. 추천이 비면 YES24 베스트셀러로 채운다(앱과 같다). */
export async function loadHomeData(): Promise<HomeData> {
  const [banners, hot, finishes, popular, recommended] = await Promise.all([
    settle(bannerApi.list('AD'), 'banners'),
    settle(postApi.feed('HOT', 0, 6), 'hot posts'),
    settle(plazaApi.feed('FINISH', 0, 6), 'finishes'),
    settle(bookApi.popular(12), 'popular'),
    settle(bookApi.recommended(12), 'recommended'),
  ]);

  let picks: ShelfBook[] = (recommended ?? []).map((book) => ({
    key: `pick-${book.id}`,
    bookId: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
  }));
  let picksLabel: string | undefined;
  if (picks.length === 0) {
    const bestsellers = (await settle(bookApi.yes24('BESTSELLER', 12), 'yes24')) ?? [];
    picks = bestsellers.map((book) => ({ key: `best-${book.id}`, bookId: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl }));
    picksLabel = 'YES24';
  }

  const popularItems = popular ?? [];
  return {
    banners: banners ?? [],
    hotPosts: hot?.content ?? [],
    finishes: finishes?.content ?? [],
    popular: popularItems,
    popularBooks: popularItems.map((item, index) => ({
      key: `popular-${item.book.id}`,
      bookId: item.book.id,
      title: item.book.title,
      author: item.book.author,
      coverUrl: item.book.coverUrl,
      rank: index + 1,
    })),
    picks,
    picksLabel,
  };
}
