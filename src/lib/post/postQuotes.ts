import type { BookQuote, Post } from '@/lib/types';

import { parsePhotoLine, type PhotoRef } from './postPhotos';

/**
 * 독후감 본문 안의 문장 조각 — 앱(src/components/post/postQuotes.ts)과 같은 규칙을 그대로 옮겼다.
 *
 * 줄머리가 `>` 인 줄이 이어진 묶음 하나가 조각 하나이고, 그 끝줄이 줄표(`— `)로 시작하면 출처 한 줄(쪽수 등)이다.
 *
 *   > 마음에 걸린 문장
 *   > — 12쪽
 *
 * 옛 글은 밑줄을 `〖오려둔 문장 123〗` 표시로 가리켰고, 서버가 그 밑줄을 `post.quotes` 로 함께 내려준다.
 * `inlineLegacyQuotes` 가 그 표시를 같은 꼴의 조각 글로 바꾼다.
 */
export type BodySegment =
  | { kind: 'text'; text: string }
  | { kind: 'quote'; text: string; source?: string }
  | { kind: 'photo'; ref: PhotoRef };

const QUOTE_LINE = /^>/;
const QUOTE_PREFIX = /^> ?/;
/** 출처 줄 — 줄표(—·–·―) 뒤에 빈칸, 그리고 내용. */
const SOURCE_LINE = /^[—–―]\s+(\S.*)$/;
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})\s*$/;
const LEGACY_MARKER = () => /〖오려둔 문장 (\d+)〗/g;

/** 쪽수 출처 — 없으면 출처 줄을 두지 않는다. */
export function pageSource(page?: number | null): string | undefined {
  return page != null ? `${page}쪽` : undefined;
}

/** 조각 하나를 본문에 넣을 글로 — 줄마다 `> ` 를 달고, 출처가 있으면 끝줄에 `> — 출처`. */
export function quoteBlock(text: string, source?: string | null): string {
  const lines = text
    .replace(/\r\n?/g, '\n')
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .map((line) => (line ? `> ${line}` : '>'));
  const tail = source?.trim();
  if (tail) lines.push(`> — ${tail}`);
  return lines.join('\n');
}

/** `>` 를 벗긴 조각 줄들 → 조각. 끝줄이 출처 꼴이면 떼어 낸다. */
function toQuote(lines: string[]): BodySegment | null {
  const inner = [...lines];
  const trimEdges = () => {
    while (inner.length > 0 && !inner[0].trim()) inner.shift();
    while (inner.length > 0 && !inner[inner.length - 1].trim()) inner.pop();
  };
  trimEdges();
  if (inner.length === 0) return null;
  const source = inner.length > 1 ? SOURCE_LINE.exec(inner[inner.length - 1].trim())?.[1].trim() : undefined;
  if (source) {
    inner.pop();
    trimEdges();
  }
  return { kind: 'quote', text: inner.join('\n'), source };
}

/**
 * 본문을 글 조각·문장 조각·사진으로 쪼갠다. 빈 글 조각과 빈 문장 조각은 버린다.
 * 마크다운 파서에 태우기 전에 쪼갠다 — 문장은 책에서 옮겨 적은 글자 그대로 보여야 한다. 코드 펜스 안의 `>` 는 조각이 아니다.
 */
export function splitBodyBlocks(md: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let text: string[] = [];
  let quote: string[] | null = null;
  let fence: string | null = null;
  const flushText = () => {
    const joined = text.join('\n');
    if (joined.trim()) segments.push({ kind: 'text', text: joined });
    text = [];
  };
  const flushQuote = () => {
    const segment = quote ? toQuote(quote) : null;
    if (segment) segments.push(segment);
    quote = null;
  };
  for (const line of md.replace(/\r\n?/g, '\n').split('\n')) {
    if (fence) {
      text.push(line);
      const close = FENCE_CLOSE.exec(line);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      continue;
    }
    if (QUOTE_LINE.test(line)) {
      if (!quote) {
        flushText();
        quote = [];
      }
      quote.push(line.replace(QUOTE_PREFIX, ''));
      continue;
    }
    flushQuote();
    const photo = parsePhotoLine(line);
    if (photo) {
      flushText();
      segments.push({ kind: 'photo', ref: photo });
      continue;
    }
    fence = FENCE_OPEN.exec(line)?.[1] ?? null;
    text.push(line);
  }
  flushQuote();
  flushText();
  return segments;
}

/** 옛 밑줄 하나 → 조각 글. 출처는 책 제목 · 쪽수(있는 것만). */
function legacyBlock(quote: BookQuote): string {
  const source = [quote.bookTitle || null, pageSource(quote.page) ?? null].filter(Boolean).join(' · ');
  return quoteBlock(quote.content, source);
}

/**
 * 옛 글의 밑줄을 조각 글로 바꿔 넣는다 — 표시 자리에는 그 밑줄을, 표시 없이 엮여만 있던 밑줄은 글 끝에 차례로.
 * 표시가 가리키는 밑줄이 없으면 표시만 지운다. 새 방식 글은 그대로 지나간다.
 */
export function inlineLegacyQuotes(md: string, quotes: readonly BookQuote[]): { text: string; moved: number } {
  if (quotes.length === 0 && !LEGACY_MARKER().test(md)) return { text: md, moved: 0 };
  const byId = new Map(quotes.map((quote) => [quote.id, quote] as const));
  const placed = new Set<number>();
  const out: string[] = [];
  let gap = false;
  let dropBlank = false;
  const push = (line: string) => {
    const blank = line.trim() === '';
    if (dropBlank && blank) {
      dropBlank = false;
      return;
    }
    dropBlank = false;
    if (gap && !blank) out.push('');
    gap = false;
    out.push(line);
  };
  const pushQuote = (quote: BookQuote) => {
    placed.add(quote.id);
    if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
    out.push(...legacyBlock(quote).split('\n'));
    gap = true;
    dropBlank = false;
  };

  for (const line of md.split('\n')) {
    const matches = [...line.matchAll(LEGACY_MARKER())];
    if (matches.length === 0) {
      push(line);
      continue;
    }
    let last = 0;
    let wrote = false;
    for (const match of matches) {
      const start = match.index ?? 0;
      const head = line.slice(last, start).trim();
      if (head) {
        push(head);
        wrote = true;
      }
      const quote = byId.get(Number(match[1]));
      if (quote) {
        pushQuote(quote);
        wrote = true;
      }
      last = start + match[0].length;
    }
    const tail = line.slice(last).trim();
    if (tail) {
      push(tail);
      wrote = true;
    }
    if (!wrote) dropBlank = out.length === 0 || out[out.length - 1].trim() === '';
  }

  const leftovers = quotes.filter((quote) => !placed.has(quote.id));
  for (const quote of leftovers) pushQuote(quote);
  return { text: out.join('\n'), moved: leftovers.length };
}

/** 상세가 그리는 본문 — 옛 밑줄은 조각 글로 바꿔 둔다. */
export function postBodyOf(post: Pick<Post, 'bodyMd' | 'quotes'>): string {
  return inlineLegacyQuotes(post.bodyMd, post.quotes ?? []).text;
}
