import 'server-only';

import { publicGet } from './api';
import type {
  Banner,
  Book,
  BookDetail,
  Faq,
  FeedSort,
  LegalDocument,
  LegalDocumentKey,
  Page,
  PlazaItem,
  PlazaItemType,
  PopularBook,
  Post,
  Remark,
  Review,
  UserProfile,
  Yes24Kind,
} from './types';

/** 캐시 간격(초) — 목록은 짧게, 원문·약관은 길게. */
const FEED = 60;
const DETAIL = 300;
const STATIC = 3600;

/** 책 — 상세·리뷰·독후감·한 줄평·인기·추천·검색. */
export const bookApi = {
  detail: (bookId: number) => publicGet<BookDetail>(`/public/books/${bookId}`, { revalidate: DETAIL }),
  /** 리뷰는 완독 인증과 상관없이 전부 — 앱도 인증 표시를 뺐다. */
  reviews: (bookId: number, page = 0, size = 20) =>
    publicGet<Page<Review>>(`/public/books/${bookId}/reviews`, {
      query: { verifiedOnly: false, page, size },
      revalidate: FEED,
    }),
  posts: (bookId: number, page = 0, size = 10) =>
    publicGet<Page<Post>>(`/public/books/${bookId}/posts`, { query: { page, size }, revalidate: FEED }),
  /** 이 책에 남긴 한 줄평 — 최근에 쓴 순. */
  remarks: (bookId: number, size = 30) =>
    publicGet<Remark[]>(`/public/books/${bookId}/remarks`, { query: { size }, revalidate: DETAIL }),
  popular: (size = 20) => publicGet<PopularBook[]>('/public/books/popular', { query: { size }, revalidate: DETAIL }),
  recommended: (size = 20) => publicGet<Book[]>('/public/books/recommended', { query: { size }, revalidate: DETAIL }),
  /** YES24 큐레이션 — 서버 1시간 캐시. */
  yes24: (kind: Yes24Kind = 'BESTSELLER', size = 20) =>
    publicGet<Book[]>('/public/books/curation/yes24', { query: { kind, size }, revalidate: STATIC }),
  /** 검색 — 외부 도서 API 를 두드리므로 방문자 IP 로 횟수를 묶는다(서버). */
  search: (keyword: string, size = 20) => publicGet<Book[]>('/public/books', { query: { keyword, size }, visitor: true }),
};

/** 독후감 — 광장 피드·단건·사람별 목록. */
export const postApi = {
  feed: (sort: FeedSort = 'HOT', page = 0, size = 10) =>
    publicGet<Page<Post>>('/public/posts/feed', { query: { sort, page, size }, revalidate: FEED }),
  /** 단건 — 방문자마다 조회수를 세므로 캐시하지 않는다. */
  get: (postId: number) => publicGet<Post>(`/public/posts/${postId}`, { visitor: true }),
  byUser: (userId: number, page = 0, size = 20) =>
    publicGet<Page<Post>>(`/public/users/${userId}/posts`, { query: { page, size }, revalidate: FEED }),
};

export const plazaApi = {
  /** 광장 피드 — 홈 '오늘의 글'은 완독 자랑(FINISH)만 받는다. */
  feed: (type: PlazaItemType = 'FINISH', page = 0, size = 5) =>
    publicGet<Page<PlazaItem>>('/public/plaza/feed', { query: { type, page, size }, revalidate: FEED }),
};

export const reviewApi = {
  get: (reviewId: number) => publicGet<Review>(`/public/reviews/${reviewId}`, { revalidate: DETAIL }),
};

export const profileApi = {
  /** 공개 프로필 — 방문 기록은 남지 않고 열람자에 매인 값은 모두 false 로 온다. */
  user: (userId: number) => publicGet<UserProfile>(`/public/users/${userId}/profile`, { revalidate: DETAIL }),
};

export const bannerApi = {
  list: (kind: 'AD' | 'NOTICE' = 'AD') => publicGet<Banner[]>('/banners', { query: { kind }, revalidate: FEED }),
};

export const faqApi = {
  list: () => publicGet<Faq[]>('/faqs', { revalidate: STATIC }),
};

export const legalApi = {
  get: (key: LegalDocumentKey) => publicGet<LegalDocument>(`/public/legal/${key}`, { revalidate: STATIC }),
};
