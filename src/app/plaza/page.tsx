import type { Metadata } from 'next';

import { InstallAction } from '@/components/install/InstallButton';
import { PostList } from '@/components/post/PostList';
import { Pagination, SegmentedLinks } from '@/components/ui/Pagination';
import { postApi } from '@/lib/endpoints';
import { parsePage } from '@/lib/format';
import type { FeedSort } from '@/lib/types';

export const metadata: Metadata = {
  title: '광장',
  description: '독자들이 남긴 독후감이 모이는 광장. 지금 뜨거운 글과 새 글을 읽어 보세요.',
  alternates: { canonical: '/plaza' },
};

const PAGE_SIZE = 10;

/** 광장 — 독후감 피드. HOT(좋아요·시간 감쇠) 또는 NEW(최신순). 쪽은 주소로 넘긴다. */
export default async function PlazaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort: FeedSort = sortParam === 'NEW' ? 'NEW' : 'HOT';
  const page = parsePage(params.page);
  const feed = await postApi.feed(sort, page, PAGE_SIZE);
  const posts = feed.content ?? [];
  const hrefFor = (p: number) => `/plaza?sort=${sort}${p > 0 ? `&page=${p}` : ''}`;

  return (
    <div className="content pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SegmentedLinks
          items={[
            { href: '/plaza?sort=HOT', label: '지금 뜨는', active: sort === 'HOT' },
            { href: '/plaza?sort=NEW', label: '새 글', active: sort === 'NEW' },
          ]}
        />
        <InstallAction reason="compose" ariaLabel="앱에서 독후감 쓰기">
          독후감 쓰기
        </InstallAction>
      </div>
      <PostList posts={posts} emptyDescription="첫 독후감은 앱에서 남길 수 있어요." />
      <Pagination page={page} hasNext={feed.hasNext ?? false} totalPages={feed.totalPages} hrefFor={hrefFor} />
    </div>
  );
}
