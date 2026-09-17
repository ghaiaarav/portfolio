const DEPTH_LAYERS = [
  { depth: 18, color: "#111111" },
  { depth: 14, color: "#242323" },
  { depth: 10, color: "#393737" },
  { depth: 6, color: "#555151" },
  { depth: 2, color: "#716c6a" },
];

export default function TitleLogo() {
  return (
    <div className="title-logo-wrap">
      <h1 className="title-logo" aria-label="Aarav Ghai">
        <svg
          className="title-logo__svg"
          viewBox="0 0 1000 210"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="logo-face" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2efed" />
              <stop offset="43%" stopColor="#d3cecc" />
              <stop offset="49%" stopColor="#9d9896" />
              <stop offset="52%" stopColor="#d8d4d2" />
              <stop offset="75%" stopColor="#aaa5a3" />
              <stop offset="100%" stopColor="#777270" />
            </linearGradient>
          </defs>

          <g className="title-logo__text" transform="translate(57 0)">
            {DEPTH_LAYERS.map(({ depth, color }) => (
              <g key={depth} fill={color} stroke="#080808" strokeWidth="8">
                <text
                  x="485"
                  y="132"
                  textAnchor="end"
                  transform={`translate(${-depth * 0.42} ${depth})`}
                >
                  AARAV
                </text>
                <text
                  x="515"
                  y="132"
                  textAnchor="start"
                  transform={`translate(${depth * 0.42} ${depth})`}
                >
                  GHAI
                </text>
              </g>
            ))}

            <g fill="url(#logo-face)" stroke="#101010" strokeWidth="8">
              <text x="485" y="132" textAnchor="end">
                AARAV
              </text>
              <text x="515" y="132" textAnchor="start">
                GHAI
              </text>
            </g>
          </g>
        </svg>
      </h1>
    </div>
  );
}
