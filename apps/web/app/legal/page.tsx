import type { Metadata } from 'next';
import Link from 'next/link';
import { legalDocuments } from '@speak-for-me/content';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Medical disclaimer, privacy policy, terms of use and accessibility statement.',
};

export default function LegalIndex() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <h1 className="text-h1 font-bold">Legal</h1>
      <p className="mt-4 max-w-[60ch] text-lead text-muted">
        Start with the medical disclaimer. It is the one that changes how the app should be
        deployed at a bedside.
      </p>

      <ul className="mt-12 flex flex-col gap-4">
        {legalDocuments.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/legal/${doc.slug}`}
              className="flex flex-col gap-2 rounded-control border-2 border-border bg-surface px-6 py-5 transition-colors hover:border-ink"
            >
              <span className="text-h3 font-bold">{doc.title}</span>
              <span className="text-muted">{doc.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
