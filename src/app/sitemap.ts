import type { MetadataRoute } from 'next';

import { postApi } from '@/lib/endpoints';
import { settle } from '@/lib/settle';
import { absoluteUrl } from '@/lib/site';

/** 사이트맵 — 고정 페이지와 최근 독후감 200편, 그 책들. 하루에 한 번 다시 만든다. */
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'hourly', priority: 1 },
    { url: absoluteUrl('/plaza'), changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/app'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/faq'), changeFrequency: 'monthly', priority: 0.3 },
    { url: absoluteUrl('/legal/terms'), changeFrequency: 'yearly', priority: 0.1 },
    { url: absoluteUrl('/legal/privacy-policy'), changeFrequency: 'yearly', priority: 0.1 },
    { url: absoluteUrl('/legal/refund'), changeFrequency: 'yearly', priority: 0.1 },
  ];

  const books = new Set<number>();
  for (let page = 0; page < 4; page++) {
    const feed = await settle(postApi.feed('NEW', page, 50), 'sitemap feed');
    const posts = feed?.content ?? [];
    for (const post of posts) {
      if (post.visibility !== 'PUBLIC') continue;
      entries.push({ url: absoluteUrl(`/posts/${post.id}`), lastModified: post.publishedAt ?? post.createdAt, changeFrequency: 'weekly', priority: 0.7 });
      if (post.bookId != null) books.add(post.bookId);
    }
    if (!feed?.hasNext) break;
  }
  for (const bookId of books) {
    entries.push({ url: absoluteUrl(`/books/${bookId}`), changeFrequency: 'weekly', priority: 0.6 });
  }
  return entries;
}
