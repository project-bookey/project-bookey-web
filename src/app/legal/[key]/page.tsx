import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isNotFound } from '@/lib/api';
import { legalApi } from '@/lib/endpoints';
import { formatDate } from '@/lib/format';
import type { LegalDocument, LegalDocumentKey } from '@/lib/types';

const KEYS: readonly LegalDocumentKey[] = ['terms', 'privacy-policy', 'refund', 'privacy-consent', 'profile-optional', 'marketing'];

type Props = { params: Promise<{ key: string }> };

async function loadDocument(raw: string): Promise<LegalDocument> {
  const key = KEYS.find((candidate) => candidate === raw);
  if (!key) notFound();
  try {
    return await legalApi.get(key);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const document = await loadDocument((await params).key);
  return { title: document.title, alternates: { canonical: `/legal/${document.key}` } };
}

/** 약관·정책 원문 — 백엔드가 쥔 글과 버전을 그대로 보여 준다(앱·웹이 같은 글). */
export default async function LegalPage({ params }: Props) {
  const document = await loadDocument((await params).key);
  return (
    <article className="content flex flex-col gap-4 pt-4">
      <header>
        <h1 className="t-title-serif text-text">{document.title}</h1>
        <p className="t-mono-label mt-1 text-text-faint">
          버전 {document.version} · 시행일 {formatDate(document.effectiveDate)}
        </p>
      </header>
      <div className="legal-body text-text">{document.body}</div>
    </article>
  );
}
