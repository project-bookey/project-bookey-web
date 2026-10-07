import Link from 'next/link';

/** 바닥글 — 약관·개인정보·환불, FAQ, 문의 메일, 앱 설치 안내 페이지. */
export function SiteFooter({ supportEmail }: { supportEmail: string }) {
  const linkClass = 'pressable inline-flex min-h-11 items-center text-[13px] font-bold text-text-muted';
  return (
    <footer className="mt-12 border-t border-line">
      <div className="content py-6">
        <nav className="flex flex-wrap gap-x-5 gap-y-0" aria-label="사이트 안내">
          <Link href="/legal/terms" className={linkClass}>
            이용약관
          </Link>
          <Link href="/legal/privacy-policy" className={linkClass}>
            개인정보처리방침
          </Link>
          <Link href="/legal/refund" className={linkClass}>
            환불 정책
          </Link>
          <Link href="/faq" className={linkClass}>
            자주 묻는 질문
          </Link>
          <a href={`mailto:${supportEmail}`} className={linkClass}>
            문의
          </a>
          <Link href="/app" className={linkClass}>
            앱 설치
          </Link>
        </nav>
        <p className="t-caption mt-3 text-text-faint">© {new Date().getFullYear()} Bookey. 독서 기록과 독후감이 모이는 곳.</p>
      </div>
    </footer>
  );
}
