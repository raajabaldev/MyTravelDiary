import React from 'react';
import type { PaperTheme, StickerMotif } from '../types/journal';

interface DoodleProps {
  className?: string;
}

export const AeroplaneDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 120 64"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 46C22 44 33 34 45 36C54 37.5 52 49 43 49C35 49 36 37 49 32C60 28 70 29 79 25"
      stroke="#86776A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 5"
    />
    <path
      d="M78 23L110 11L91 34L86 26L78 23Z"
      fill="#F6E2E2"
      stroke="#362C25"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M110 11L86 26L87 38L93 31"
      fill="#DB9FA3"
      stroke="#362C25"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MountainsDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 110 64"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 54L38 16L58 44L72 26L100 54H10Z"
      fill="#E2EBE0"
      stroke="#362C25"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M38 16L46 28L39 26L33 30L38 16Z"
      fill="#FFFDF8"
      stroke="#362C25"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M72 26L79 35L73 33L67 36L72 26Z"
      fill="#FFFDF8"
      stroke="#362C25"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="88" cy="14" r="7" fill="#FBF0CB" stroke="#362C25" strokeWidth="1.8" />
  </svg>
);

export const FlowersDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 80 80"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M40 70C39 55 41 44 40 34"
      stroke="#4E694A"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M40 55C32 52 27 46 26 42C32 42 37 47 40 55Z"
      fill="#A4BC9F"
      stroke="#362C25"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M40 49C47 45 53 42 56 38C50 37 44 42 40 49Z"
      fill="#A4BC9F"
      stroke="#362C25"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="40" cy="18" r="7" fill="#F6E2E2" stroke="#362C25" strokeWidth="1.8" />
    <circle cx="51" cy="26" r="7" fill="#F6E2E2" stroke="#362C25" strokeWidth="1.8" />
    <circle cx="47" cy="38" r="7" fill="#F6E2E2" stroke="#362C25" strokeWidth="1.8" />
    <circle cx="33" cy="38" r="7" fill="#F6E2E2" stroke="#362C25" strokeWidth="1.8" />
    <circle cx="29" cy="26" r="7" fill="#F6E2E2" stroke="#362C25" strokeWidth="1.8" />
    <circle cx="40" cy="28" r="6" fill="#ECD07B" stroke="#362C25" strokeWidth="1.8" />
  </svg>
);

export const CameraDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 88 68"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M27 18L33 11H55L61 18"
      fill="#E0EBF2"
      stroke="#362C25"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect
      x="12"
      y="18"
      width="64"
      height="40"
      rx="9"
      fill="#E0EBF2"
      stroke="#362C25"
      strokeWidth="2"
    />
    <circle cx="44" cy="38" r="13" fill="#FFFDF8" stroke="#362C25" strokeWidth="2" />
    <circle cx="44" cy="38" r="7.5" fill="#99B4CA" stroke="#362C25" strokeWidth="1.8" />
    <circle cx="41.5" cy="35.5" r="2" fill="#FFFDF8" />
    <circle cx="64" cy="27" r="3" fill="#F6E2E2" stroke="#362C25" strokeWidth="1.5" />
    <path d="M18 15H24" stroke="#362C25" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const StarsDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 80 68"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M32 10L36.5 22.5L49.5 23L39.2 31L42.8 43.5L32 36.2L21.2 43.5L24.8 31L14.5 23L27.5 22.5L32 10Z"
      fill="#FBF0CB"
      stroke="#362C25"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M60 32L62.5 39L69.5 39.5L64 44L66 51L60 47L54 51L56 44L50.5 39.5L57.5 39L60 32Z"
      fill="#F6E2E2"
      stroke="#362C25"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="48" r="2.2" fill="#99B4CA" />
    <circle cx="63" cy="14" r="2.2" fill="#A4BC9F" />
  </svg>
);

export const CloudDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 96 54"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 44H74C81.5 44 87 38.5 87 31.5C87 25.2 82.4 20 76.2 19.2C74.2 11.6 67.3 6 59 6C51.2 6 44.6 10.9 42.1 17.8C39.8 16.3 37 15.5 34 15.5C25.7 15.5 19 22.2 19 30.5C19 31.2 19.1 31.9 19.2 32.5C14.5 33.8 11 38 11 43C11 43.6 17.2 44 24 44Z"
      fill="#FFFDF8"
      stroke="#362C25"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const CompassDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 76 76"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="38" cy="38" r="29" fill="#FBF0CB" stroke="#362C25" strokeWidth="2" />
    <circle
      cx="38"
      cy="38"
      r="23"
      fill="#FFFDF8"
      stroke="#86776A"
      strokeWidth="1.4"
      strokeDasharray="3 3"
    />
    <path
      d="M38 15L43 35L38 38L33 35L38 15Z"
      fill="#DB9FA3"
      stroke="#362C25"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M38 61L33 41L38 38L43 41L38 61Z"
      fill="#99B4CA"
      stroke="#362C25"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="38" cy="38" r="3" fill="#362C25" />
  </svg>
);

export const FoldedMapDoodle: React.FC<DoodleProps> = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 90 66"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 17L31 11L55 18L78 12V50L55 56L31 49L10 55V17Z"
      fill="#E2EBE0"
      stroke="#362C25"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M31 11V49" stroke="#362C25" strokeWidth="1.6" strokeDasharray="3 3" />
    <path d="M55 18V56" stroke="#362C25" strokeWidth="1.6" strokeDasharray="3 3" />
    <path
      d="M21 38C28 32 39 39 48 31C56 24 63 30 69 24"
      stroke="#915258"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
    />
    <circle cx="69" cy="24" r="3.5" fill="#DB9FA3" stroke="#362C25" strokeWidth="1.5" />
  </svg>
);

export const StickerByMotif: React.FC<{ motif: StickerMotif; className?: string }> = ({
  motif,
  className = '',
}) => {
  switch (motif) {
    case 'aeroplane':
      return <AeroplaneDoodle className={className} />;
    case 'mountains':
      return <MountainsDoodle className={className} />;
    case 'flowers':
      return <FlowersDoodle className={className} />;
    case 'camera':
      return <CameraDoodle className={className} />;
    case 'stars':
      return <StarsDoodle className={className} />;
    case 'compass':
      return <CompassDoodle className={className} />;
  }
};

export const WashiTape: React.FC<{
  tone?: PaperTheme;
  style?: React.CSSProperties;
  className?: string;
}> = ({ tone = 'sage', style, className = '' }) => (
  <span
    aria-hidden="true"
    className={`washi-tape washi-tape--${tone} ${className}`}
    style={style}
  />
);

