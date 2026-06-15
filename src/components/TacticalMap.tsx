// Stylized SVG "tactical map" — no external map dependency.
// Renders a dark grid, soft heat blobs, a victim track and predicted corridors.

type Props = {
  variant?: "calm" | "alert";
  className?: string;
  showRoutes?: boolean;
};

export function TacticalMap({ variant = "alert", className = "", showRoutes = true }: Props) {
  const alert = variant === "alert";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-hairline ${className}`}
      style={{ background: "radial-gradient(120% 80% at 30% 20%, #14141a 0%, #0a0a0b 60%, #050506 100%)" }}
    >
      {/* grid */}
      <svg className="absolute inset-0 w-full h-full opacity-40" aria-hidden>
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* heat blobs */}
      <div
        className="absolute -top-10 -left-8 size-48 rounded-full blur-3xl drift-slow"
        style={{ background: alert ? "rgba(255,59,48,0.25)" : "rgba(52,199,89,0.18)" }}
      />
      <div
        className="absolute bottom-0 right-0 size-56 rounded-full blur-3xl drift-slow"
        style={{ background: alert ? "rgba(255,159,10,0.18)" : "rgba(10,132,255,0.15)" }}
      />

      {/* route lines */}
      {showRoutes && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
          {/* historic / safe route */}
          <path
            d="M30,260 C90,230 110,180 160,170 C220,160 240,120 320,90"
            fill="none"
            stroke="rgba(52,199,89,0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* victim track */}
          <path
            d="M40,250 C100,220 130,200 170,190 C210,180 230,160 260,150"
            fill="none"
            stroke="#ff3b30"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* predicted corridor */}
          <path
            d="M260,150 C300,135 320,110 360,70"
            fill="none"
            stroke="#ff3b30"
            strokeWidth="2"
            strokeDasharray="2 6"
            opacity="0.9"
          />
          <path
            d="M260,150 C300,170 340,180 380,200"
            fill="none"
            stroke="#ff9f0a"
            strokeWidth="1.6"
            strokeDasharray="2 6"
            opacity="0.7"
          />

          {/* victim dot */}
          <circle cx="260" cy="150" r="6" fill="#ff3b30">
            <animate attributeName="r" values="5;8;5" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="260" cy="150" r="3.2" fill="#fff" />

          {/* possible destinations */}
          <circle cx="360" cy="70" r="4" fill="#ff3b30" />
          <circle cx="380" cy="200" r="3" fill="#ff9f0a" />

          {/* origin */}
          <circle cx="40" cy="250" r="3" fill="rgba(255,255,255,0.6)" />
        </svg>
      )}

      {/* scanline sweep */}
      <div className="absolute inset-y-0 w-1/3 sweep-x bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />
    </div>
  );
}
