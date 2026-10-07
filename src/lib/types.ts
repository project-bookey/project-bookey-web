import type { components } from '@/api/generated';

/**
 * 서버 응답 타입 — 생성 파일(src/api/generated.ts)의 스키마를 앱 친화적 이름으로 다시 내보낸다.
 * 서버 필드를 손으로 적지 않는다. 타입이 없으면 여기에 별칭을 더하고, 스키마가 없으면 `npm run types` 로 다시 만든다.
 */
type Schemas = components['schemas'];

export type Book = Schemas['BookSummary'];
export type BookDetail = Schemas['BookDetail'];
export type PopularBook = Schemas['PopularBookView'];
export type Review = Schemas['ReviewView'];
export type Remark = Schemas['RemarkView'];
export type Post = Schemas['PostView'];
export type PostImage = Schemas['PostImageView'];
export type BookQuote = Schemas['BookQuoteView'];
export type PlazaItem = Schemas['PlazaItemView'];
export type Banner = Schemas['BannerView'];
export type Faq = Schemas['FaqView'];
export type LegalDocument = Schemas['LegalDocumentView'];
export type UserProfile = Schemas['UserProfileView'];

/** 페이지 응답 — 서버는 PageResponse{Name} 으로 하나씩 내지만 모양은 같다. */
export type Page<T> = {
  content?: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
};

export type FeedSort = 'HOT' | 'NEW';
export type PlazaItemType = PlazaItem['type'];
export type Yes24Kind = 'BESTSELLER' | 'STEADY' | 'NEW';
export type LegalDocumentKey =
  | 'terms'
  | 'privacy-consent'
  | 'profile-optional'
  | 'marketing'
  | 'privacy-policy'
  | 'refund';
