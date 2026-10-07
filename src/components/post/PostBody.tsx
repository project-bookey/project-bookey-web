import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { MemoScrap } from '@/components/ui/Card';
import { photoIdsIn } from '@/lib/post/postPhotos';
import { postBodyOf, splitBodyBlocks } from '@/lib/post/postQuotes';
import type { Post, PostImage } from '@/lib/types';

/**
 * 독후감 본문 — 글 사이에 사진과 옮겨 적은 문장 조각이 쓴 자리 그대로 끼어든다(앱 PostBody 와 같은 규칙).
 * 조각(`>` 묶음)과 사진 줄은 마크다운 파서에 태우지 않고 그 앞에서 쪼갠다. 본문에 자리가 없는 사진(옛 글)은 본문 앞에 모아 그린다.
 */
export function PostBody({ post }: { post: Post }) {
  const md = postBodyOf(post);
  const segments = splitBodyBlocks(md);
  const byId = new Map(post.images.map((image) => [image.id, image] as const));
  const placed = new Set(photoIdsIn(md));
  const loose = post.images.filter((image) => !placed.has(image.id));

  // 사진 번호는 본문 앞 사진 → 본문 속 사진 차례. 그리기 전에 번호를 매겨 둔다.
  const blocks: ReactNode[] = [];
  let photoNumber = 0;
  for (const image of loose) {
    photoNumber += 1;
    blocks.push(<Photo key={`loose-${image.id}`} image={image} number={photoNumber} />);
  }
  segments.forEach((segment, index) => {
    if (segment.kind === 'text') {
      blocks.push(
        <div key={`t${index}`} className="prose-post text-text">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {segment.text}
          </ReactMarkdown>
        </div>,
      );
      return;
    }
    if (segment.kind === 'photo') {
      const image = segment.ref.kind === 'image' ? byId.get(segment.ref.id) : undefined;
      if (!image) return;
      photoNumber += 1;
      blocks.push(<Photo key={`p${index}`} image={image} number={photoNumber} />);
      return;
    }
    blocks.push(<QuoteBlock key={`q${index}`} text={segment.text} source={segment.source} />);
  });

  return <div className="flex flex-col gap-3">{blocks}</div>;
}

const MD_COMPONENTS = {
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  img: ({ src, alt }: { src?: string | Blob; alt?: string }) =>
    typeof src === 'string' ? <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" /> : null,
};

/** 본문 사진 — 본문 폭을 채운다. 크기를 알면 자리를 먼저 잡아 레이아웃이 튀지 않는다. */
function Photo({ image, number }: { image: PostImage; number: number }) {
  return (
    <figure className="overflow-hidden rounded-sm border border-line bg-surface-deep">
      <img
        src={image.url}
        alt={`사진 ${number}`}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading="lazy"
        decoding="async"
        className="h-auto w-full"
      />
    </figure>
  );
}

/** 문장 조각 하나 — 괘선 한 겹의 반듯한 메모 안 명조 문장 + 출처 한 줄. 글자 그대로(마크다운 아님). */
function QuoteBlock({ text, source }: { text: string; source?: string }) {
  return (
    <MemoScrap variant="ruled">
      <blockquote className="whitespace-pre-wrap break-keep text-[15px] leading-[25px] text-text">{text}</blockquote>
      {source ? <p className="t-meta clamp-2 mt-2 text-text-muted">{source}</p> : null}
    </MemoScrap>
  );
}
