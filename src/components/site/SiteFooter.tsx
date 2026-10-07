import Link from 'next/link';

import { Wordmark } from './Wordmark';

const BROWSE = [
  ['/', '홈'],
  ['/plaza', '광장'],
  ['/search', '책 찾기'],
  ['/app', '앱 설치'],
] as const;

const GUIDE = [
  ['/legal/terms', '이용약관'],
  ['/legal/privacy-policy', '개인정보처리방침'],
  ['/legal/refund', '환불 정책'],
  ['/faq', '자주 묻는 질문'],
] as const;

/** 바닥글 — 데스크톱은 세 단(브랜드 · 둘러보기 · 안내), 휴대폰은 차례로 쌓인다. */
export function SiteFooter({ supportEmail }: { supportEmail: string }) {
  const linkClass = 'pressable inline-flex min-h-10 items-center text-[13px] font-bold text-text-muted';
  return (
    <footer className="mt-16 border-t border-line bg-bg-alt/60">
      <div className="content grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark width={100} />
          <p className="t-body mt-3 max-w-xs break-keep text-text-muted">독서 기록과 독후감이 모이는 곳. 웹에서는 둘러보고, 기록은 앱에서 남겨요.</p>
          <p className="t-caption mt-4 text-text-faint">© {new Date().getFullYear()} Bookey</p>
        </div>
        <nav aria-label="둘러보기">
          <p className="t-mono-eyebrow mb-2 text-text-faint">둘러보기</p>
          <ul className="flex flex-wrap gap-x-5 md:flex-col md:gap-0">
            {BROWSE.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="안내">
          <p className="t-mono-eyebrow mb-2 text-text-faint">안내</p>
          <ul className="flex flex-wrap gap-x-5 md:flex-col md:gap-0">
            {GUIDE.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${supportEmail}`} className={linkClass}>
                문의
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
