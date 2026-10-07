import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

/**
 * 사이트 공통 링크 미리보기(1200×630) — 종이색 판에 워드마크와 한 줄. 글마다는 책 표지·사진이 OG 이미지가 된다.
 * 한글 서체는 빌드 때 Google Fonts 에서 글자 몇 개만 받아 쓴다 — 못 받으면 워드마크와 주소만 그린다.
 */
export const alt = 'Bookey — 독서 기록과 독후감이 모이는 곳';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TAGLINE = '독서 기록과 독후감이 모이는 곳';

async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    // 옛 Firefox UA 로 부르면 Google Fonts 가 WOFF(woff2 아님) 서브셋을 준다 — 이미지 렌더러(Satori)는 TTF·OTF·WOFF 만 읽는다.
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&text=${encodeURIComponent(text)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:11.0) Gecko/20100101 Firefox/11.0' },
    }).then((response) => response.text());
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:woff|truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.arrayBuffer();
    // 서명이 TTF(0x00010000·'true')·OTF('OTTO')·WOFF('wOFF') 가 아니면 쓰지 않는다 — 깨진 글꼴은 빌드를 죽인다.
    const head = new DataView(data.slice(0, 4));
    const tag = String.fromCharCode(head.getUint8(0), head.getUint8(1), head.getUint8(2), head.getUint8(3));
    return head.getUint32(0) === 0x00010000 || tag === 'true' || tag === 'OTTO' || tag === 'wOFF' ? data : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const wordmark = await readFile(join(process.cwd(), 'public/brand/wordmark-on-light.png'));
  const wordmarkSrc = `data:image/png;base64,${wordmark.toString('base64')}`;
  const font = await loadKoreanFont(`${TAGLINE}www.bookey.site`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#faf8f4',
          backgroundImage: 'radial-gradient(circle, #e7e3d9 2px, transparent 2px)',
          backgroundSize: '32px 32px',
          gap: 36,
        }}
      >
        <img src={wordmarkSrc} alt="" width={660} height={220} />
        {font ? (
          <div style={{ fontFamily: 'Gowun', fontSize: 44, color: '#57554f', letterSpacing: -1 }}>{TAGLINE}</div>
        ) : null}
        <div style={{ fontSize: 28, color: '#8b887f', fontFamily: font ? 'Gowun' : 'sans-serif' }}>www.bookey.site</div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: 'Gowun', data: font, weight: 700, style: 'normal' }] : undefined,
    },
  );
}
