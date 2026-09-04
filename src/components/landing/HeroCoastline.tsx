/** Left-side South Bay coastline — thin path + city nodes (AthlinkPro reference). */
const CITIES = [
  { name: "El Segundo", x: 118, y: 128 },
  { name: "Manhattan Beach", x: 102, y: 198 },
  { name: "Hermosa Beach", x: 96, y: 268 },
  { name: "Redondo Beach", x: 108, y: 338 },
  { name: "Los Angeles", x: 168, y: 418 },
] as const;

export function HeroCoastline({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg
        className="landing-coast-svg"
        viewBox="0 0 1100 560"
        preserveAspectRatio="xMinYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="coast-line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c7e0" stopOpacity="0.14" />
            <stop offset="35%" stopColor="#3b6ef6" stopOpacity="0.42" />
            <stop offset="70%" stopColor="#22c7e0" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#3b6ef6" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* faint diamond grid behind hero center */}
        <g className="landing-coast-diamond" opacity="0.14">
          <path
            d="M520 80 L780 280 L520 480 L260 280 Z"
            fill="none"
            stroke="#3b6ef6"
            strokeWidth="0.8"
          />
          <path
            d="M520 140 L720 280 L520 420 L320 280 Z"
            fill="none"
            stroke="#22c7e0"
            strokeWidth="0.6"
          />
          <path
            d="M520 200 L660 280 L520 360 L380 280 Z"
            fill="none"
            stroke="#8db0ff"
            strokeWidth="0.5"
          />
        </g>

        {/* coastline path — west edge of South Bay */}
        <path
          className="landing-coast-path"
          d="M 78 36
             C 92 78, 128 108, 118 148
             C 108 188, 88 218, 96 258
             C 104 298, 124 318, 112 358
             C 98 402, 142 438, 178 468
             C 210 492, 248 508, 286 528"
          fill="none"
          stroke="url(#coast-line-grad)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* soft echo stroke */}
        <path
          className="landing-coast-path-echo"
          d="M 78 36
             C 92 78, 128 108, 118 148
             C 108 188, 88 218, 96 258
             C 104 298, 124 318, 112 358
             C 98 402, 142 438, 178 468
             C 210 492, 248 508, 286 528"
          fill="none"
          stroke="#22c7e0"
          strokeOpacity="0.22"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {CITIES.map((city, i) => (
          <g
            key={city.name}
            className="landing-coast-node"
            style={{ animationDelay: `${1.1 + i * 0.12}s` }}
          >
            <circle
              cx={city.x}
              cy={city.y}
              r="3.2"
              fill="#f8fbff"
              stroke="#3b6ef6"
              strokeOpacity="0.65"
              strokeWidth="1"
            />
            <circle cx={city.x} cy={city.y} r="1.15" fill="#22c7e0" fillOpacity="0.8" />
            <text
              x={city.x + 12}
              y={city.y + 3.5}
              className="landing-coast-label"
            >
              {city.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
