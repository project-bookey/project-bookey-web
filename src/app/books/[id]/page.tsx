import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BookHero, BookSidePanel } from '@/components/book/BookHero';
import { BookTabs, type BookTab } from '@/components/book/BookTabs';
import { RemarkTicker } from '@/components/book/RemarkTicker';
import { InstallAction, InstallButton } from '@/components/install/InstallButton';
import { PostList } from '@/components/post/PostList';
import { ReviewScrap } from '@/components/review/ReviewScrap';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, SectionHeader, TextLink } from '@/components/ui/text';
import { isNotFound } from '@/lib/api';
import { bookApi } from '@/lib/endpoints';
import { clip, parseId } from '@/lib/format';
import { settle } from '@/lib/settle';
import type { BookDetail } from '@/lib/types';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function loadBook(raw: string): Promise<BookDetail> {
  const id = parseId(raw);
  if (id == null) notFound();
  try {
    return await bookApi.detail(id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await loadBook(id);
  const { book } = detail;
  const description = clip(detail.description) ?? `${book.title}${book.author ? ` · ${book.author}` : ''} — 독자들의 리뷰와 독후감을 Bookey 에서 읽어 보세요.`;
  return {
    title: book.title,
    description,
    alternates: { canonical: `/books/${book.id}` },
    openGraph: { type: 'book', title: book.title, description, images: book.coverUrl ? [{ url: book.coverUrl }] : undefined },
  };
}

const PREVIEW = 6;

/**
 * 도서 상세 — 휴대폰은 히어로(표지·표제·좋아요·평점) → 한 줄평 → 소개·목차 → 리뷰 | 독후감 탭 → 구매 링크, 하단에 '앱에서 읽기 시작'.
 * 넓은 화면은 왼쪽 판(표지·표제·주요 버튼, sticky) + 오른쪽 본문 두 단.
 * 쓰기 동작(읽고 싶은 책·독서 시작·리뷰/독후감 쓰기)은 모두 앱 설치 안내다 — 화면의 주요 버튼은 '앱에서 읽기 시작' 하나.
 */
export default async function BookPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await loadBook(id);
  const bookId = detail.book.id;
  const tabParam = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const tab: BookTab = tabParam === 'post' ? 'post' : 'review';

  const [reviews, posts, remarks] = await Promise.all([
    settle(bookApi.reviews(bookId, 0, PREVIEW), 'reviews'),
    settle(bookApi.posts(bookId, 0, PREVIEW), 'posts'),
    settle(bookApi.remarks(bookId, 30), 'remarks'),
  ]);
  const reviewItems = reviews?.content ?? [];
  const postItems = posts?.content ?? [];
  const purchase = detail.addonLink ?? detail.purchaseLink;

  const body = (
    <div className="flex flex-col gap-8 md:gap-10">
      {remarks && remarks.length > 0 ? <RemarkTicker remarks={remarks} /> : null}

      {detail.description ? <Expandable title="책 소개" text={detail.description} /> : null}
      {detail.tableOfContents ? <Expandable title="목차" text={detail.tableOfContents} lines={6} /> : null}

      <section>
        <BookTabs
          bookId={bookId}
          active={tab}
          reviewCount={reviews?.totalElements}
          action={
            <InstallAction reason={tab === 'post' ? 'compose' : 'review'} ariaLabel={tab === 'post' ? '앱에서 독후감 쓰기' : '앱에서 리뷰 쓰기'}>
              앱에서 쓰기
            </InstallAction>
          }
        />
        {tab === 'post' ? (
          <>
            <PostList posts={postItems} columns={2} emptyDescription="이 책의 첫 독후감은 앱에서 남길 수 있어요." />
            {posts?.hasNext ? (
              <div className="mt-2 flex justify-end">
                <TextLink href={`/books/${bookId}/posts`} label="모두 보기" />
              </div>
            ) : null}
          </>
        ) : reviewItems.length === 0 ? (
          <EmptyState title="아직 리뷰가 없어요" description="이 책의 첫 리뷰는 앱에서 남길 수 있어요." />
        ) : (
          <>
            <div className="grid items-start gap-3 md:grid-cols-2">
              {reviewItems.map((review) => (
                <ReviewScrap key={review.id} review={review} />
              ))}
            </div>
            {reviews?.hasNext ? (
              <div className="mt-2 flex justify-end">
                <TextLink href={`/books/${bookId}/reviews`} label="모두 보기" />
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );

  return (
    <>
      {/* 휴대폰 — 한 단. */}
      <div className="content flex flex-col gap-8 !px-0 pt-2 lg:hidden">
        <BookHero detail={detail} />
        <div className="px-4">{body}</div>
        {purchase ? (
          <div className="px-4">
            <ButtonLink href={purchase} external variant="tonal">
              YES24에서 구매하기
            </ButtonLink>
          </div>
        ) : null}
        <div className="sticky bottom-0 z-20 bg-gradient-to-t from-bg via-bg/95 to-transparent px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-6">
          <InstallButton reason="read" variant="primary" className="w-full">
            앱에서 읽기 시작
          </InstallButton>
        </div>
      </div>

      {/* 넓은 화면 — 왼쪽 판 + 오른쪽 본문. */}
      <div className="content hidden gap-14 pt-8 lg:grid lg:grid-cols-[260px_1fr]">
        <BookSidePanel detail={detail} />
        <div className="min-w-0">{body}</div>
      </div>
    </>
  );
}

/** 책 소개·목차 — 몇 줄만 보이고 '더 보기'로 편다(자바스크립트 없이 <details>). */
function Expandable({ title, text, lines = 4 }: { title: string; text: string; lines?: number }) {
  const long = text.length > 160 || text.split('\n').length > lines;
  const textClass = 'whitespace-pre-wrap break-keep text-text-muted';
  const textStyle = { fontSize: 15, lineHeight: '25px' } as const;
  return (
    <section>
      <SectionHeader title={title} />
      {long ? (
        <details className="group">
          <summary className="list-none [&::-webkit-details-marker]:hidden">
            <p className={`clamp-${lines} ${textClass} group-open:hidden`} style={textStyle}>
              {text}
            </p>
            <p className={`hidden ${textClass} group-open:block`} style={textStyle}>
              {text}
            </p>
            <span className="pressable mt-2 inline-flex min-h-11 cursor-pointer items-center text-[13px] font-bold text-text">
              <span className="group-open:hidden">더 보기</span>
              <span className="hidden group-open:inline">접기</span>
            </span>
          </summary>
        </details>
      ) : (
        <p className={textClass} style={textStyle}>
          {text}
        </p>
      )}
    </section>
  );
}
