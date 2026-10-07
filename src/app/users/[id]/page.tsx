import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { InstallAction } from '@/components/install/InstallButton';
import { PostList } from '@/components/post/PostList';
import { Avatar } from '@/components/ui/Avatar';
import { Pagination } from '@/components/ui/Pagination';
import { SectionHeader } from '@/components/ui/text';
import { isNotFound } from '@/lib/api';
import { postApi, profileApi } from '@/lib/endpoints';
import { groupNumber, parseId, parsePage } from '@/lib/format';
import type { UserProfile } from '@/lib/types';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function loadProfile(raw: string): Promise<UserProfile> {
  const id = parseId(raw);
  if (id == null) notFound();
  try {
    return await profileApi.user(id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await loadProfile((await params).id);
  return {
    title: `${profile.nickname}님의 독후감`,
    description: `${profile.nickname}(@${profile.handle})님이 Bookey 에 남긴 독후감 ${groupNumber(profile.publicPostCount)}편.`,
    alternates: { canonical: `/users/${profile.userId}` },
    openGraph: { type: 'profile', title: `${profile.nickname}님의 독후감`, images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined },
  };
}

const PAGE_SIZE = 10;

/**
 * 공개 프로필 — 닉네임·사진·숫자와 공개 독후감만(서재·통계는 앱에서). 팔로우·엽서는 앱 설치 안내.
 */
export default async function UserPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await loadProfile(id);
  const page = parsePage(query.page);
  const posts = await postApi.byUser(profile.userId, page, PAGE_SIZE);

  return (
    <div className="content flex flex-col gap-6 pt-4">
      <section className="flex items-start gap-4">
        <Avatar uri={profile.avatarUrl} nickname={profile.nickname} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="t-title-serif truncate text-text">{profile.nickname}</h1>
              <p className="t-mono-label truncate text-text-faint">@{profile.handle}</p>
            </div>
            <InstallAction reason="follow" ariaLabel={`${profile.nickname}님 팔로우 — 앱에서`}>
              팔로우
            </InstallAction>
          </div>
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Stat label="팔로워" value={profile.followerCount} />
            <Stat label="팔로잉" value={profile.followingCount} />
            <Stat label="독후감" value={profile.publicPostCount} />
          </dl>
          <div className="mt-3">
            <InstallAction reason="postcard" size="xs" ariaLabel={`${profile.nickname}님에게 엽서 쓰기 — 앱에서`}>
              엽서 쓰기
            </InstallAction>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="독후감" />
        <PostList posts={posts.content ?? []} emptyTitle="아직 공개한 독후감이 없어요" />
        <Pagination page={page} hasNext={posts.hasNext ?? false} totalPages={posts.totalPages} hrefFor={(p) => `/users/${profile.userId}${p > 0 ? `?page=${p}` : ''}`} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1">
      <dt className="t-caption text-text-muted">{label}</dt>
      <dd className="t-mono-numeral text-text">{groupNumber(value)}</dd>
    </div>
  );
}
