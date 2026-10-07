/** 컨테이너 헬스 체크 — 백엔드와 무관하게 Next 서버가 살아 있는지만 답한다. */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
