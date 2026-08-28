import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findLegalDocument, legalDocuments } from '@speak-for-me/content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return legalDocuments.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = findLegalDocument(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.summary };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = findLegalDocument(slug);
  if (!doc) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="flex flex-col gap-4 border-b border-hairline pb-10">
        <h1 className="text-h1 font-bold">{doc.title}</h1>
        <p className="text-lead text-muted">{doc.summary}</p>
        <p className="text-small text-muted">Last updated {formatDate(doc.updated)}</p>
      </header>

      {/* Shown rather than hidden: this wording is accurate and written from
          the source, but it has not been through legal review, and saying
          so is more use to a reader than a false air of authority. */}
      {doc.needsReview && (
        <p className="mt-10 rounded-control border-2 border-danger px-5 py-4 text-small font-medium text-danger">
          Draft. This wording describes the app accurately but has not been reviewed by a lawyer.
          Do not rely on it as legal advice or publish it as final.
        </p>
      )}

      <div className="mt-12 flex flex-col gap-12">
        {doc.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-4">
            <h2 className="text-h3 font-bold">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="max-w-[68ch] text-muted">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="flex max-w-[68ch] list-disc flex-col gap-2 ps-6 text-muted marker:text-primary">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <nav aria-label="Other legal pages" className="mt-16 border-t border-hairline pt-8">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-small">
          {legalDocuments
            .filter((other) => other.slug !== doc.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/legal/${other.slug}`}
                  className="text-muted underline-offset-4 hover:text-ink"
                >
                  {other.title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </article>
  );
}
