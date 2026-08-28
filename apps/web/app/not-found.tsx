import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-24">
      <h1 className="text-h1 font-bold">That page does not exist</h1>
      <p className="max-w-[54ch] text-lead text-muted">
        The link may be out of date. Everything on this site is reachable from the home page.
      </p>
      <p>
        <Link href="/" className="font-bold text-primary underline underline-offset-4">
          Back to the home page
        </Link>
      </p>
    </div>
  );
}
