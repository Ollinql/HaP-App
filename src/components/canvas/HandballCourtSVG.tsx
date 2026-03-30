// Half handball court SVG — viewBox 0 0 300 400
// Goal at top, 6m solid arc, 9m dashed arc, center line
export function HandballCourtSVG() {
  // Court dimensions (units):
  // Width: 300, Height: 400
  // Goal: centered at top, 70 wide × 20 tall, at y=0
  // 6m line: radius ~90, arc center at top-center (150, 0)
  // 9m line: radius ~150, same center
  // Free-throw line (7m): small tick at x=150, around y=230
  // Half-line: y=200

  const cx = 150
  const r6 = 90  // 6m arc radius
  const r9 = 150 // 9m arc radius

  // SVG arc: cx±r at y=0 (top of field), draw downward arc
  const arc6 = `M ${cx - r6} 0 A ${r6} ${r6} 0 0 1 ${cx + r6} 0`
  const arc9 = `M ${cx - r9} 0 A ${r9} ${r9} 0 0 1 ${cx + r9} 0`

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Court outline */}
      <rect x="0" y="0" width="300" height="400" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

      {/* Half-court line */}
      <line x1="0" y1="200" x2="300" y2="200" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

      {/* Goal */}
      <rect
        x="115" y="0" width="70" height="22"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2"
      />
      {/* Goal posts */}
      <line x1="115" y1="0" x2="115" y2="22" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
      <line x1="185" y1="0" x2="185" y2="22" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
      {/* Crossbar hatching */}
      <line x1="115" y1="22" x2="185" y2="22" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />

      {/* 6m line — solid */}
      <path
        d={arc6}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
      />
      {/* Goal area side lines */}
      <line x1={cx - r6} y1="0" x2={cx - r6} y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <line x1={cx + r6} y1="0" x2={cx + r6} y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

      {/* 9m line — dashed */}
      <path
        d={arc9}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
        strokeDasharray="8 5"
      />

      {/* 7m free-throw mark */}
      <line x1="145" y1="230" x2="155" y2="230" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

      {/* Center mark */}
      <circle cx="150" cy="200" r="3" fill="rgba(255,255,255,0.35)" />
      <circle cx="150" cy="200" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    </svg>
  )
}
