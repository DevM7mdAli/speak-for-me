/**
 * The app's icon, inlined from apps/mobile/assets/brand/app-icon-v2.svg.
 *
 * A speech bubble carrying a voice waveform, with the coral dot that also
 * gives the page its accent colour. Inlined rather than loaded as an image
 * so it stays crisp at any size and needs no network request.
 */
export function BrandMark({
  className,
  rounded = true,
}: {
  className?: string;
  rounded?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className={className}
      role="img"
      aria-label="Speak For Me"
    >
      <rect width="1024" height="1024" rx={rounded ? 224 : 0} fill="#006C67" />
      <path
        fill="#FFFFFF"
        d="M512 170C322 170 168 306 168 474c0 91 45 173 117 229l-52 151 177-89c33 8 67 13 102 13 190 0 344-136 344-304S702 170 512 170Z"
      />
      <rect x="370" y="410" width="56" height="148" rx="28" fill="#006C67" />
      <rect x="484" y="338" width="56" height="292" rx="28" fill="#006C67" />
      <rect x="598" y="410" width="56" height="148" rx="28" fill="#006C67" />
      <circle cx="744" cy="700" r="92" fill="#E45A55" stroke="#FFFFFF" strokeWidth="20" />
    </svg>
  );
}

/** Just the waveform, for use as a quiet repeating motif. */
export function WaveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 300" className={className} aria-hidden focusable="false">
      <rect x="0" y="72" width="56" height="148" rx="28" fill="currentColor" />
      <rect x="114" y="0" width="56" height="292" rx="28" fill="currentColor" />
      <rect x="228" y="72" width="56" height="148" rx="28" fill="currentColor" />
    </svg>
  );
}
