import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { InstallAction } from '@/components/install/InstallButton';
import { ReviewScrap } from '@/components/review/ReviewScrap';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, SectionHeader, TextLink } from '@/components/ui/text';
import { isNotFound } from '@/lib/api';
import { bookApi } from '@/lib/endpoints';
import { parseId, parsePage } from '@/lib/format';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id == null) notFound();
  const detail = await bookApi.detail(id).catch(() => null);
  return { title: detail ? `${detail.book.title} 리뷰` : '리뷰', robots: { index: false, follow: true } };
}

const PAGE_SIZE = 20;

/** 책의 리뷰 전체 — 쪽 넘기기. */
export default async function BookReviewsPage({ params, searchParams }: Props) {
  const [{ id: raw }, query] = await Promise.all([params, searchParams]);
  const id = parseId(raw);
  if (id == null) notFound();
  const page = parsePage(query.page);
  let detail;
  let reviews;
  try {
    [detail, reviews] = await Promise.all([bookApi.detail(id), bookApi.reviews(id, page, PAGE_SIZE)]);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
  const items = reviews.content ?? [];

  return (
    <div className="content pt-4">
      <TextLink href={`/books/${id}`} label={detail.book.title} ariaLabel={`${detail.book.title} 상세로`} kind="action" className="mb-2 text-text-muted" />
      <SectionHeader
        title="리뷰"
        action={
          <InstallAction reason="review" ariaLabel="앱에서 리뷰 쓰기">
            앱에서 쓰기
          </InstallAction>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="아직 리뷰가 없어요" description="이 책의 첫 리뷰는 앱에서 남길 수 있어요." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((review) => (
            <ReviewScrap key={review.id} review={review} />
          ))}
        </div>
      )}
      <Pagination page={page} hasNext={reviews.hasNext ?? false} totalPages={reviews.totalPages} hrefFor={(p) => `/books/${id}/reviews${p > 0 ? `?page=${p}` : ''}`} />
    </div>
  );
}
