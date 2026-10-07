/**
 * 독후감 본문 안의 사진 자리 — 앱(src/components/post/postPhotos.ts)과 같은 규칙.
 *
 * 사진은 글을 쓰다 올린 자리에 그대로 선다 — 본문 마크다운에 제 줄 하나로 `![사진](image:123)` 를 남긴다.
 * 표준 이미지 문법이라 서버 발췌(PostExcerpt)가 통째로 걷어 내고, 본문을 다른 곳에서 읽어도 깨지지 않는다.
 * 올라가는 중인 사진은 `upload:<타일 키>` 로 적히는데, 공개된 글에는 남아 있지 않다(있어도 그리지 않는다).
 */
export type PhotoRef = { kind: 'image'; id: number } | { kind: 'upload'; key: string };

/** 사진 줄 — 줄 하나가 통째로 사진 표시일 때만. 앞뒤 빈칸은 봐준다. */
const PHOTO_LINE = /^\s*!\[[^\]\n]*\]\((image|upload):([A-Za-z0-9_-]+)\)\s*$/;

/** 사진 줄이면 무엇을 가리키는지, 아니면 null. */
export function parsePhotoLine(line: string): PhotoRef | null {
  const match = PHOTO_LINE.exec(line);
  if (!match) return null;
  if (match[1] === 'upload') return { kind: 'upload', key: match[2] };
  const id = Number(match[2]);
  return Number.isSafeInteger(id) ? { kind: 'image', id } : null;
}

/** 본문에 자리를 잡은 사진 id — 나온 차례대로, 겹치면 처음 것만. */
export function photoIdsIn(md: string): number[] {
  const ids: number[] = [];
  for (const line of md.split('\n')) {
    const ref = parsePhotoLine(line);
    if (ref?.kind === 'image' && !ids.includes(ref.id)) ids.push(ref.id);
  }
  return ids;
}
