/** Large minimal gift bow — hero mark for onboarding welcome. */
export function OnboardingBow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="ob-bow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="ob-bow-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id="ob-bow-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tails */}
      <path
        d="M72 118 C48 148 38 178 28 192 L52 186 C62 162 78 138 96 122 Z"
        fill="url(#ob-bow-grad)"
        opacity="0.92"
      />
      <path
        d="M168 118 C192 148 202 178 212 192 L188 186 C178 162 162 138 144 122 Z"
        fill="url(#ob-bow-grad)"
        opacity="0.92"
      />

      {/* Left loop */}
      <path
        d="M120 92 C78 92 52 68 52 46 C52 24 76 8 104 14 C118 17 128 28 132 42"
        stroke="url(#ob-bow-grad)"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right loop */}
      <path
        d="M120 92 C162 92 188 68 188 46 C188 24 164 8 136 14 C122 17 112 28 108 42"
        stroke="url(#ob-bow-grad)"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />

      {/* Knot */}
      <ellipse cx="120" cy="98" rx="28" ry="22" fill="url(#ob-bow-grad)" filter="url(#ob-bow-glow)" />
      <ellipse cx="120" cy="92" rx="18" ry="10" fill="url(#ob-bow-shine)" opacity="0.7" />

      {/* Inner ribbon cross */}
      <path
        d="M120 76 L120 118 M98 88 L142 88"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
