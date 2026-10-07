import { BookShelf } from '@/components/book/BookShelf';
import { AppInstallCard } from '@/components/install/AppInstallCard';

import { BannerCarousel } from './BannerCarousel';
import type { HomeData } from './HomeData';
import { HomeScraps } from './HomeScraps';
import { PopularList } from './PopularList';
import { SearchBar } from './SearchBar';

/**
 * 시안 A 잡지형 — 위에 표제와 검색이 선 머리띠, 아래는 본문(오늘의 글 → 요즘 많이 읽는 책 → 추천) + 오른쪽 사이드바(앱 설치 · 배너 · 인기 순위).
 * 휴대폰에서는 사이드바가 본문 아래로 내려온다.
 */
export function HomeMagazine({ data }: { data: HomeData }) {
  return (
    <div className="content pt-2 md:pt-6">
      <section className="border-b border-line-strong py-6 md:py-10">
        <p className="t-mono-eyebrow text-text-muted">독서 기록과 독후감이 모이는 곳</p>
        <h1 className="mt-2 break-keep text-[28px] font-bold leading-[38px] text-text md:text-[40px] md:leading-[52px]">
          책을 찾고,
          <br className="md:hidden" /> 독자들의 생각을 읽어요
        </h1>
        <div className="mt-5 max-w-2xl">
          <SearchBar />
        </div>
      </section>

      <div className="grid gap-10 pt-8 lg:grid-cols-[1fr_320px] lg:gap-14">
        <main className="flex min-w-0 flex-col gap-10 [&>section]:!px-0">
          {data.hotPosts.length > 0 || data.finishes.length > 0 ? <HomeScraps posts={data.hotPosts} finishes={data.finishes} /> : null}
          <BookShelf title="요즘 많이 읽는 책" label="LIVE" books={data.popularBooks} staggered className="[&_ul]:!px-0 [&>div]:!px-0" />
          <BookShelf title="추천" label={data.picksLabel} books={data.picks} className="[&_ul]:!px-0 [&>div]:!px-0" />
        </main>
        <aside className="flex min-w-0 flex-col gap-6">
          <AppInstallCard />
          <BannerCarousel banners={data.banners} />
          <PopularList items={data.popular.slice(0, 10)} />
        </aside>
      </div>
    </div>
  );
}
