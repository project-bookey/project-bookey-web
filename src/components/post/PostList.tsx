import { EmptyState } from '@/components/ui/text';
import type { Post } from '@/lib/types';

import { PostCard } from './PostCard';

/**
 * 독후감 카드 목록 — 광장·프로필·도서 상세가 같이 쓴다. 휴대폰은 한 단, 넓은 화면은 두 단(광장은 세 단까지). 비면 안내 한 줄.
 */
export function PostList({
  posts,
  columns = 2,
  emptyTitle = '아직 독후감이 없어요',
  emptyDescription,
}: {
  posts: Post[];
  /** 넓은 화면에서 몇 단까지 펼칠지 — 1 이면 늘 한 단(좁은 칸 안). */
  columns?: 1 | 2 | 3;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (posts.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  const grid = columns === 3 ? 'md:grid-cols-2 xl:grid-cols-3' : columns === 2 ? 'md:grid-cols-2' : '';
  return (
    <div className={`grid items-start gap-4 ${grid}`}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
