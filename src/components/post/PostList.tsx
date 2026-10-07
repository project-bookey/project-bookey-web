import { EmptyState } from '@/components/ui/text';
import type { Post } from '@/lib/types';

import { PostCard } from './PostCard';

/** 독후감 카드 목록 — 광장·프로필·도서 상세가 같이 쓴다. 비면 안내 한 줄. */
export function PostList({ posts, emptyTitle = '아직 독후감이 없어요', emptyDescription }: { posts: Post[]; emptyTitle?: string; emptyDescription?: string }) {
  if (posts.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
