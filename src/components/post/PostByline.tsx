import { Eye } from 'lucide-react';
import Link from 'next/link';

import { Avatar } from '@/components/ui/Avatar';
import { IconMeta } from '@/components/ui/text';
import { formatRelative } from '@/lib/format';
import type { Post } from '@/lib/types';

/**
 * 독후감 상세의 작성자 줄 — 아바타 · 닉네임 · 메타(올린 때 · 조회). 누르면 그 사람의 공개 프로필로.
 * 조판은 앱 공통 작성자 줄과 같다 — 아바타 40, 닉네임 15/20, 메타 10/14.
 */
export function PostByline({ post, showViews = true }: { post: Post; showViews?: boolean }) {
  const when = formatRelative(post.publishedAt ?? post.createdAt);
  return (
    <Link href={`/users/${post.authorId}`} className="pressable flex items-center gap-2" aria-label={`${post.authorNickname} 프로필 열기`}>
      <Avatar uri={post.authorAvatarUrl} nickname={post.authorNickname} />
      <span className="min-w-0 flex-1">
        <span className="t-body-strong block truncate text-text">{post.authorNickname}</span>
        <span className="t-meta mt-[2px] flex items-center gap-1 text-text-faint">
          <span className="truncate">{when}</span>
          {showViews ? (
            <>
              <span aria-hidden>·</span>
              <IconMeta icon={Eye} label={`조회 ${post.viewCount}`}>
                {post.viewCount}
              </IconMeta>
            </>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
