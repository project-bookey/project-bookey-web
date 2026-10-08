import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { InstallAction } from '@/components/install/InstallButton';
import { PostList } from '@/components/post/PostList';
import { Pagination } from '@/components/ui/Pagination';
import { SectionHeader, TextLink } from '@/components/ui/text';
import { isNotFound } from '@/lib/api';
import { bookApi } from '@/lib/endpoints';
import { parseId, parsePage } from '@/lib/format';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id == null) notFound();
  const detail = await bookApi.detail(id).catch(() => null);
  return { title: detail ? `${detail.book.title} 독후감` : '독후감', robots: { index: false, follow: true } };
}

const PAGE_SIZE = 10;

/** 책의 독후감 전체 — 쪽 넘기기. */
export default async function BookPostsPage({ params, searchParams }: Props) {
  const [{ id: raw }, query] = await Promise.all([params, searchParams]);
  const id = parseId(raw);
  if (id == null) notFound();
  const page = parsePage(query.page);
  let detail;
  let posts;
  try {
    [detail, posts] = await Promise.all([bookApi.detail(id), bookApi.posts(id, page, PAGE_SIZE)]);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }

  return (
    <div className="content pt-4">
      <TextLink href={`/books/${id}`} label={detail.book.title} ariaLabel={`${detail.book.title} 상세로`} kind="action" className="mb-2 text-text-muted" />
      <SectionHeader
        title="독후감"
        action={
          <InstallAction reason="compose" ariaLabel="앱에서 독후감 쓰기">
            앱에서 쓰기
          </InstallAction>
        }
      />
      <PostList posts={posts.content ?? []} emptyDescription="이 책의 첫 독후감은 앱에서 남길 수 있어요." />
      <Pagination page={page} hasNext={posts.hasNext ?? false} totalPages={posts.totalPages} hrefFor={(p) => `/books/${id}/posts${p > 0 ? `?page=${p}` : ''}`} />
    </div>
  );
}
