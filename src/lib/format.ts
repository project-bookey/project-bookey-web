/** 상대 시각 — 앱과 같은 말('방금'·'3분 전'·'2일 전', 한 달 넘으면 날짜). */
export function formatRelative(iso?: string | null, now = Date.now()): string {
  if (!iso) return '기록 없음';
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return formatDate(iso);
}

/** 날짜 — 2026년 10월 7일. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

/** 천 단위 쉼표. */
export function groupNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

/** 메타 설명용 — 줄바꿈을 접고 앞 n 자만. */
export function clip(text: string | undefined | null, max = 160): string | undefined {
  if (!text) return undefined;
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return undefined;
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** 주소의 숫자 조각 — 양의 정수만 받고 아니면 null. */
export function parseId(raw: string | undefined): number | null {
  if (!raw || !/^\d{1,12}$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}

/** 주소의 쪽 번호 — 0 부터, 없거나 이상하면 0. */
export function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^\d{1,5}$/.test(value)) return 0;
  return Number(value);
}
