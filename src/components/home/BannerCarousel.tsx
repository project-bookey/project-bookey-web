'use client';

import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';

import type { Banner } from '@/lib/types';

/**
 * 홈 이벤트 배너 — 가로로 한 장씩 넘기는 캐러셀(스크롤 스냅) + 표식. `tall` 이면 넓은 화면에서 더 높다.
 * 사진 위 영역이라 모드와 무관하게 어두운 톤이다. 배너가 없으면 같은 높이의 '이벤트 준비 중' 띠로 자리를 지킨다.
 * 링크가 바깥 주소면 새 탭, 앱 안 경로면 설치 안내 페이지(/app)로.
 */
export function BannerCarousel({ banners, tall = false }: { banners: Banner[]; tall?: boolean }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const heightClass = tall ? 'h-[108px] md:h-[180px]' : 'h-[108px]';

  if (banners.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-md border border-dashed border-line-strong ${heightClass}`}>
        <span className="t-mono-label text-text-faint">이벤트 준비 중</span>
      </div>
    );
  }

  const onScroll = () => {
    const list = listRef.current;
    if (!list || list.clientWidth === 0) return;
    setPage(Math.round(list.scrollLeft / list.clientWidth));
  };

  return (
    <div className="flex flex-col gap-2">
      <div ref={listRef} onScroll={onScroll} className={`shelf snap-x snap-mandatory rounded-md ${heightClass}`}>
        {banners.map((banner) => (
          <BannerLink key={banner.id} banner={banner}>
            <div
              className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-md"
              style={{ backgroundColor: banner.bgColor ?? '#1d211c' }}
            >
              {banner.imageUrl ? (
                <>
                  <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-black/45" aria-hidden />
                </>
              ) : null}
              <div className="relative flex flex-col gap-[2px] p-3 md:p-5">
                <span className="t-mono-eyebrow mb-1 self-start rounded-sm bg-on-photo px-[6px] py-[2px] text-[#0c0e0d]">EVENT</span>
                <p className={`truncate text-on-photo ${tall ? 't-body-strong md:text-[20px] md:leading-7' : 't-body-strong'}`}>{stripStrong(banner.title)}</p>
                {banner.subtitle ? <p className="t-caption truncate text-on-photo-muted md:text-[14px]">{stripStrong(banner.subtitle)}</p> : null}
              </div>
            </div>
          </BannerLink>
        ))}
      </div>
      {banners.length > 1 ? (
        <div className="flex justify-center gap-1" aria-hidden>
          {banners.map((banner, i) => (
            <span key={banner.id} className={`h-1 ${i === page ? 'w-3 bg-ink' : 'w-1 bg-line-strong'}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BannerLink({ banner, children }: { banner: Banner; children: ReactNode }) {
  const className = 'pressable block h-full w-full shrink-0 snap-start';
  const label = banner.title;
  if (!banner.linkUrl) {
    return (
      <div className={className} aria-label={label}>
        {children}
      </div>
    );
  }
  if (/^https?:\/\//.test(banner.linkUrl)) {
    return (
      <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>
        {children}
      </a>
    );
  }
  // 앱 안 경로(/club/… 등)는 웹에 없다 — 설치 안내 페이지로.
  return (
    <Link href="/app" className={className} aria-label={label}>
      {children}
    </Link>
  );
}

/** 배너 제목의 **굵게** 표시는 글자만 남긴다. */
function stripStrong(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}
