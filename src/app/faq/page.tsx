import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/Button';
import { iconSize, iconStroke } from '@/components/ui/icon';
import { EmptyState } from '@/components/ui/text';
import { faqApi } from '@/lib/endpoints';
import { getInstallConfig } from '@/lib/install';
import { settle } from '@/lib/settle';
import type { Faq } from '@/lib/types';

export const metadata: Metadata = {
  title: '자주 묻는 질문',
  description: 'Bookey 사용법과 계정·결제에 대해 자주 묻는 질문.',
  alternates: { canonical: '/faq' },
};

/** 자주 묻는 질문 — 카테고리별 아코디언. 문의는 메일로(앱 안 문의함은 앱에서). */
export default async function FaqPage() {
  const faqs = (await settle(faqApi.list(), 'faqs')) ?? [];
  const { supportEmail } = getInstallConfig();
  const groups = groupByCategory(faqs);

  return (
    <div className="content flex flex-col gap-6 pt-4">
      <h1 className="t-title-serif text-text">자주 묻는 질문</h1>
      {groups.length === 0 ? (
        <EmptyState title="아직 올라온 질문이 없어요" description="궁금한 점은 메일로 물어봐 주세요." />
      ) : (
        groups.map((group) => (
          <section key={group.label}>
            <h2 className="t-mono-eyebrow mb-2 text-text-muted">{group.label}</h2>
            <div className="flex flex-col">
              {group.items.map((faq) => (
                <details key={faq.id} className="group border-b border-line">
                  <summary className="pressable flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 [&::-webkit-details-marker]:hidden">
                    <span className="t-body-strong break-keep text-text">{faq.question}</span>
                    <ChevronDown size={iconSize.inline} aria-hidden className="shrink-0 text-text-faint transition-transform group-open:rotate-180" {...iconStroke} />
                  </summary>
                  <p className="t-body whitespace-pre-wrap break-keep pb-4 text-text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))
      )}
      <div>
        <ButtonLink href={`mailto:${supportEmail}`} variant="tonal">
          메일로 문의하기
        </ButtonLink>
        <p className="t-caption mt-2 text-text-faint">앱에서는 설정 › 고객문의에서 사진과 함께 보낼 수 있어요.</p>
      </div>
    </div>
  );
}

function groupByCategory(faqs: Faq[]): { label: string; items: Faq[] }[] {
  const groups = new Map<string, Faq[]>();
  for (const faq of faqs) {
    const list = groups.get(faq.categoryLabel) ?? [];
    list.push(faq);
    groups.set(faq.categoryLabel, list);
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}
