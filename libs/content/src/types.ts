export interface LegalSection {
  heading: string;
  /** Paragraphs. Rendered in order. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  list?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  /** One sentence describing what the document covers. */
  summary: string;
  /** ISO date the wording last changed. */
  updated: string;
  /** Shown at the top when the document has not been through legal review. */
  needsReview?: boolean;
  sections: LegalSection[];
}
