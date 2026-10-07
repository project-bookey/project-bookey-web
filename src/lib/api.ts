import 'server-only';

import { headers } from 'next/headers';

/**
 * 백엔드 공개 API 호출 — 서버 컴포넌트·route handler 에서만 쓴다(브라우저는 API 를 직접 부르지 않는다).
 *
 * 비회원 조회 전용이라 토큰이 없고, 경로는 `/api/v1/public/**` 와 배너·FAQ 처럼 로그인 없이 열린 것뿐이다.
 * 주소는 `BOOKEY_API_URL`(같은 compose 망이면 http://backend:8080) — 없으면 운영 API.
 */
const API_BASE = (process.env.BOOKEY_API_URL ?? 'https://api.bookey.site').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

type Query = Record<string, string | number | boolean | undefined | null>;

export type GetOptions = {
  query?: Query;
  /** 재검증 간격(초). 기본 60초. `visitor` 를 켜면 무시되고 매번 새로 받는다. */
  revalidate?: number;
  /**
   * 방문자 단위로 달라지는 요청(독후감 상세의 조회수, 검색의 IP 제한) — 브라우저가 보낸 X-Forwarded-For·User-Agent 를
   * 백엔드에 그대로 전달하고 캐시하지 않는다. 백엔드는 이 헤더로 방문자를 가른다(Tomcat RemoteIpValve).
   */
  visitor?: boolean;
};

export async function publicGet<T>(path: string, options: GetOptions = {}): Promise<T> {
  const { query, revalidate = 60, visitor = false } = options;
  const url = new URL(`${API_BASE}/api/v1${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }
  }

  const requestHeaders: Record<string, string> = { Accept: 'application/json' };
  let init: RequestInit & { next?: { revalidate?: number } } = { next: { revalidate } };
  if (visitor) {
    const incoming = await headers();
    const forwardedFor = incoming.get('x-forwarded-for');
    const userAgent = incoming.get('user-agent');
    if (forwardedFor) requestHeaders['X-Forwarded-For'] = forwardedFor;
    if (userAgent) requestHeaders['User-Agent'] = userAgent;
    init = { cache: 'no-store' };
  }

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: requestHeaders });
  } catch (error) {
    throw new ApiError(0, 'NETWORK', `불러오지 못했어요. 잠시 후 다시 시도해 주세요. (${(error as Error).message})`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data: { code?: string; message?: string } | undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.code ?? 'UNKNOWN',
      data?.message ?? '불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
    );
  }
  return data as T;
}
