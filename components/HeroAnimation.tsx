"use client";

export function HeroAnimation() {
  return (
    <div className="relative w-full h-full select-none" aria-hidden="true">
      <style>{`
        @keyframes ha-cursor-move {
          0%   { transform: translate(140px, 80px); }
          10%  { transform: translate(210px, 60px); }
          20%  { transform: translate(260px, 110px); }
          30%  { transform: translate(260px, 200px); }
          40%  { transform: translate(200px, 240px); }
          50%  { transform: translate(120px, 240px); }
          60%  { transform: translate(80px,  200px); }
          70%  { transform: translate(80px,  110px); }
          80%  { transform: translate(140px, 80px); }
          88%  { transform: translate(310px, 155px); }
          94%  { transform: translate(310px, 185px); }
          100% { transform: translate(140px, 80px); }
        }
        @keyframes ha-handle-pulse {
          0%,100% { r: 4; opacity: 0.55; }
          50%     { r: 6.5; opacity: 1; }
        }
        @keyframes ha-crop-morph {
          0%,20%   { x: 82; y: 84; width: 176; height: 156; }
          40%,60%  { x: 60; y: 70; width: 220; height: 184; }
          80%,100% { x: 82; y: 84; width: 176; height: 156; }
        }
        @keyframes ha-slide-bright {
          0%,100% { cx: 362; }
          40%,60% { cx: 395; }
        }
        @keyframes ha-slide-contrast {
          0%,100% { cx: 345; }
          40%,60% { cx: 378; }
        }
        @keyframes ha-slide-sat {
          0%,100% { cx: 358; }
          40%,60% { cx: 390; }
        }
        @keyframes ha-panel-fade {
          0%,10%  { opacity: 0; }
          22%,78% { opacity: 1; }
          90%,100%{ opacity: 0; }
        }
        @keyframes ha-glow {
          0%,100% { filter: drop-shadow(0 0 10px rgba(99,102,241,0.18)); }
          50%     { filter: drop-shadow(0 0 28px rgba(99,102,241,0.38)); }
        }
        @keyframes ha-tool1 {
          0%,30%,100%  { fill: rgba(99,102,241,0.10); }
          32%,65%      { fill: rgba(99,102,241,0.30); }
        }
        @keyframes ha-tool2 {
          0%,60%,100%  { fill: rgba(99,102,241,0.10); }
          62%,85%      { fill: rgba(99,102,241,0.30); }
        }
        @keyframes ha-pct-pop {
          0%,80%  { opacity: 0; }
          85%,95% { opacity: 1; }
          100%    { opacity: 0; }
        }
        @keyframes ha-badge-float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-5px); }
        }
        @keyframes ha-resize-drag {
          0%,78%,100% { transform: translate(258px, 240px); }
          84%,92%     { transform: translate(280px, 265px); }
        }

        .ha-cursor    { animation: ha-cursor-move 5.5s ease-in-out infinite; }
        .ha-crop      { animation: ha-crop-morph 5.5s ease-in-out infinite; }
        .ha-hp1       { animation: ha-handle-pulse 1.6s ease-in-out infinite 0s; }
        .ha-hp2       { animation: ha-handle-pulse 1.6s ease-in-out infinite 0.4s; }
        .ha-hp3       { animation: ha-handle-pulse 1.6s ease-in-out infinite 0.8s; }
        .ha-hp4       { animation: ha-handle-pulse 1.6s ease-in-out infinite 1.2s; }
        .ha-panel     { animation: ha-panel-fade 5.5s ease-in-out infinite; }
        .ha-glow-svg  { animation: ha-glow 3s ease-in-out infinite; }
        .ha-t1        { animation: ha-tool1 5.5s ease-in-out infinite; }
        .ha-t2        { animation: ha-tool2 5.5s ease-in-out infinite; }
        .ha-sb        { animation: ha-slide-bright 5.5s ease-in-out infinite; }
        .ha-sc        { animation: ha-slide-contrast 5.5s ease-in-out infinite; }
        .ha-ss        { animation: ha-slide-sat 5.5s ease-in-out infinite; }
        .ha-pct       { animation: ha-pct-pop 5.5s ease-in-out infinite; }
        .ha-badge     { animation: ha-badge-float 2.8s ease-in-out infinite; }
        .ha-resize    { animation: ha-resize-drag 5.5s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 420 480"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full ha-glow-svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="ha-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="ha-sidebar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="ha-brand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="ha-card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8faff" />
            <stop offset="100%" stopColor="#f0f4ff" />
          </linearGradient>
          <mask id="ha-crop-mask">
            <rect width="420" height="480" fill="white" />
            <rect className="ha-crop" fill="black" rx="2" />
          </mask>
        </defs>

        {/* Window shell */}
        <rect x="8" y="8" width="404" height="464" rx="18" fill="url(#ha-card)" stroke="#e0e7ff" strokeWidth="1.5" />
        {/* Title bar */}
        <rect x="8" y="8" width="404" height="36" rx="18" fill="#1e1b4b" />
        <rect x="8" y="26" width="404" height="18" fill="#1e1b4b" />
        <circle cx="32" cy="26" r="5.5" fill="#ff5f57" />
        <circle cx="50" cy="26" r="5.5" fill="#febc2e" />
        <circle cx="68" cy="26" r="5.5" fill="#28c840" />
        <text x="214" y="30" textAnchor="middle" fill="#a5b4fc" fontSize="9.5" fontFamily="system-ui,sans-serif" fontWeight="600">
          editimage.online — Image Editor
        </text>

        {/* Left toolbar */}
        <rect x="8" y="44" width="40" height="428" fill="url(#ha-sidebar)" />

        {/* Crop icon */}
        <g transform="translate(28,70)">
          <rect className="ha-t1" x="-11" y="-11" width="22" height="22" rx="5" />
          <rect x="-6" y="-7" width="13" height="13" rx="1.5" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
          <line x1="-10" y1="-7" x2="-6" y2="-7" stroke="#a5b4fc" strokeWidth="1.5" />
          <line x1="7" y1="6" x2="7" y2="2" stroke="#a5b4fc" strokeWidth="1.5" />
        </g>

        {/* Resize icon */}
        <g transform="translate(28,100)">
          <rect className="ha-t2" x="-11" y="-11" width="22" height="22" rx="5" />
          <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
          <path d="M4 4 L8 8 M6 8 L8 8 L8 6" stroke="#a5b4fc" strokeWidth="1.3" fill="none" />
        </g>

        {/* Wand icon */}
        <g transform="translate(28,130)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="rgba(99,102,241,0.08)" />
          <path d="M-3 7 L5 -5 M-3 7 L-6 8 L-5 5 Z" stroke="#a5b4fc" strokeWidth="1.5" fill="none" />
          <circle cx="6" cy="-6" r="1.8" fill="#c4b5fd" />
        </g>

        {/* Brush icon */}
        <g transform="translate(28,160)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="rgba(99,102,241,0.08)" />
          <path d="M2 -6 L7 -2 L-3 7 C-5 9 -8 8 -8 6 C-8 4 -6 2 -3 7 Z" stroke="#a5b4fc" strokeWidth="1.2" fill="none" />
        </g>

        {/* Eyedropper icon */}
        <g transform="translate(28,190)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="rgba(99,102,241,0.08)" />
          <circle cx="0" cy="0" r="6" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
          <circle cx="0" cy="-4" r="1.5" fill="#a5b4fc" />
          <circle cx="3.5" cy="2.5" r="1.5" fill="#a5b4fc" />
          <circle cx="-3.5" cy="2.5" r="1.5" fill="#a5b4fc" />
        </g>

        {/* Canvas: sky */}
        <rect x="48" y="44" width="244" height="276" fill="url(#ha-sky)" />
        {/* Sun */}
        <circle cx="242" cy="78" r="20" fill="#fde68a" opacity="0.65" />
        {/* Clouds */}
        <ellipse cx="96" cy="88" rx="30" ry="13" fill="white" opacity="0.72" />
        <ellipse cx="118" cy="80" rx="20" ry="11" fill="white" opacity="0.72" />
        <ellipse cx="178" cy="94" rx="24" ry="10" fill="white" opacity="0.6" />
        {/* Mountains */}
        <polygon points="48,280 115,128 175,280" fill="#818cf8" opacity="0.5" />
        <polygon points="98,280 178,112 255,280" fill="#6366f1" opacity="0.65" />
        <polygon points="168,280 244,142 295,280" fill="#4f46e5" opacity="0.72" />
        {/* Snow caps */}
        <polygon points="115,128 126,158 104,158" fill="white" opacity="0.6" />
        <polygon points="178,112 190,144 166,144" fill="white" opacity="0.65" />
        <polygon points="244,142 256,168 232,168" fill="white" opacity="0.6" />
        {/* Water */}
        <rect x="48" y="263" width="244" height="57" fill="#c7d2fe" opacity="0.5" />
        <ellipse cx="172" cy="278" rx="62" ry="8" fill="#a5b4fc" opacity="0.38" />

        {/* Dim overlay outside crop box */}
        <rect x="48" y="44" width="244" height="276" fill="rgba(0,0,0,0.28)" mask="url(#ha-crop-mask)" />

        {/* Animated crop box */}
        <rect className="ha-crop" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="6,3" rx="2" />

        {/* Rule-of-thirds guides */}
        <line x1="82" y1="136" x2="258" y2="136" stroke="#6366f1" strokeWidth="0.7" strokeDasharray="3,3" opacity="0.5" />
        <line x1="82" y1="188" x2="258" y2="188" stroke="#6366f1" strokeWidth="0.7" strokeDasharray="3,3" opacity="0.5" />
        <line x1="141" y1="84" x2="141" y2="240" stroke="#6366f1" strokeWidth="0.7" strokeDasharray="3,3" opacity="0.5" />
        <line x1="200" y1="84" x2="200" y2="240" stroke="#6366f1" strokeWidth="0.7" strokeDasharray="3,3" opacity="0.5" />

        {/* Corner handles */}
        <circle className="ha-hp1" cx="82"  cy="84"  fill="white" stroke="#6366f1" strokeWidth="2" />
        <circle className="ha-hp2" cx="258" cy="84"  fill="white" stroke="#6366f1" strokeWidth="2" />
        <circle className="ha-hp3" cx="82"  cy="240" fill="white" stroke="#6366f1" strokeWidth="2" />
        <circle className="ha-hp4" cx="258" cy="240" fill="white" stroke="#6366f1" strokeWidth="2" />

        {/* Animated resize handle */}
        <g className="ha-resize">
          <rect x="-7" y="-7" width="14" height="14" rx="3" fill="white" stroke="#6366f1" strokeWidth="2" />
          <path d="M-2 2 L4 2 L4 -4" stroke="#6366f1" strokeWidth="1.3" fill="none" />
        </g>

        {/* Right panel */}
        <rect x="292" y="44" width="120" height="428" fill="white" stroke="#e0e7ff" strokeWidth="1" />
        <rect x="292" y="44" width="120" height="32" fill="#f5f3ff" />
        <text x="352" y="63" textAnchor="middle" fill="#4f46e5" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">
          Adjustments
        </text>

        {/* Brightness */}
        <text x="302" y="96" fill="#6b7280" fontSize="7.5" fontFamily="system-ui,sans-serif">Brightness</text>
        <rect x="302" y="101" width="100" height="4" rx="2" fill="#e0e7ff" />
        <rect x="302" y="101" width="60" height="4" rx="2" fill="url(#ha-brand)" />
        <circle className="ha-sb" cy="103" r="6" fill="white" stroke="#6366f1" strokeWidth="1.8" />

        {/* Contrast */}
        <text x="302" y="122" fill="#6b7280" fontSize="7.5" fontFamily="system-ui,sans-serif">Contrast</text>
        <rect x="302" y="127" width="100" height="4" rx="2" fill="#e0e7ff" />
        <rect x="302" y="127" width="46" height="4" rx="2" fill="url(#ha-brand)" />
        <circle className="ha-sc" cy="129" r="6" fill="white" stroke="#6366f1" strokeWidth="1.8" />

        {/* Saturation */}
        <text x="302" y="148" fill="#6b7280" fontSize="7.5" fontFamily="system-ui,sans-serif">Saturation</text>
        <rect x="302" y="153" width="100" height="4" rx="2" fill="#e0e7ff" />
        <rect x="302" y="153" width="55" height="4" rx="2" fill="url(#ha-brand)" />
        <circle className="ha-ss" cy="155" r="6" fill="white" stroke="#6366f1" strokeWidth="1.8" />

        <line x1="302" y1="172" x2="402" y2="172" stroke="#e0e7ff" strokeWidth="1" />

        {/* Histogram */}
        <text x="302" y="183" fill="#6b7280" fontSize="7.5" fontFamily="system-ui,sans-serif">Histogram</text>
        {[5,8,13,18,22,20,16,12,8,5,3].map((h, i) => (
          <rect key={i} x={302 + i * 9} y={208 - h} width="7" height={h} rx="1" fill="#818cf8" opacity={0.45 + i * 0.045} />
        ))}

        <line x1="302" y1="218" x2="402" y2="218" stroke="#e0e7ff" strokeWidth="1" />

        {/* Resize */}
        <text x="302" y="230" fill="#6b7280" fontSize="7.5" fontFamily="system-ui,sans-serif" fontWeight="600">Resize</text>
        <text x="302" y="244" fill="#374151" fontSize="7" fontFamily="system-ui,sans-serif">W:</text>
        <rect x="314" y="237" width="36" height="12" rx="2" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="1" />
        <text x="332" y="246" textAnchor="middle" fill="#4f46e5" fontSize="7" fontFamily="system-ui,sans-serif">1920</text>
        <text x="356" y="244" fill="#374151" fontSize="7" fontFamily="system-ui,sans-serif">H:</text>
        <rect x="366" y="237" width="34" height="12" rx="2" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="1" />
        <text x="383" y="246" textAnchor="middle" fill="#4f46e5" fontSize="7" fontFamily="system-ui,sans-serif">1080</text>

        <text x="302" y="261" fill="#9ca3af" fontSize="6.5" fontFamily="system-ui,sans-serif">Lock aspect ratio</text>
        <line x1="302" y1="270" x2="402" y2="270" stroke="#e0e7ff" strokeWidth="1" />

        {/* Format */}
        <text x="302" y="282" fill="#6b7280" fontSize="7.5" fontFamily="system-ui,sans-serif" fontWeight="600">Format</text>
        {["PNG","JPG","WebP"].map((fmt, i) => (
          <g key={fmt}>
            <rect x={302 + i * 34} y="286" width="30" height="14" rx="3"
              fill={i === 2 ? "url(#ha-brand)" : "#f5f3ff"}
              stroke={i === 2 ? "transparent" : "#c4b5fd"} strokeWidth="1" />
            <text x={302 + i * 34 + 15} y="296" textAnchor="middle"
              fill={i === 2 ? "white" : "#6366f1"} fontSize="7" fontFamily="system-ui,sans-serif" fontWeight="600">
              {fmt}
            </text>
          </g>
        ))}

        {/* Quality */}
        <text x="302" y="314" fill="#6b7280" fontSize="7.5" fontFamily="system-ui,sans-serif">Quality: 85%</text>
        <rect x="302" y="318" width="100" height="4" rx="2" fill="#e0e7ff" />
        <rect x="302" y="318" width="85" height="4" rx="2" fill="url(#ha-brand)" />
        <circle cx="387" cy="320" r="6" fill="white" stroke="#6366f1" strokeWidth="1.8" />

        {/* Export button */}
        <rect x="302" y="338" width="100" height="28" rx="7" fill="url(#ha-brand)" />
        <text x="352" y="356" textAnchor="middle" fill="white" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">
          Download
        </text>

        {/* Status bar */}
        <rect x="48" y="320" width="244" height="26" fill="#f8faff" stroke="#e0e7ff" strokeWidth="1" />
        <text x="60" y="336" fill="#6b7280" fontSize="7" fontFamily="system-ui,sans-serif">1920 x 1080 px</text>
        <text x="155" y="336" fill="#6b7280" fontSize="7" fontFamily="system-ui,sans-serif">100%</text>
        <text x="218" y="336" fill="#6b7280" fontSize="7" fontFamily="system-ui,sans-serif">PNG 2.4 MB</text>

        {/* Before/After strip */}
        <rect x="48" y="346" width="244" height="126" fill="#fafbff" />
        <text x="60" y="365" fill="#374151" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">Before / After</text>

        {/* Before thumbnail */}
        <rect x="60" y="370" width="90" height="62" rx="5" fill="#c7d2fe" />
        <polygon points="60,420 102,378 150,420" fill="#818cf8" opacity="0.65" />
        <rect x="60" y="404" width="90" height="28" fill="#a5b4fc" opacity="0.45" />
        <text x="105" y="366" fill="#9ca3af" fontSize="6.5" fontFamily="system-ui,sans-serif">Before</text>

        {/* After thumbnail */}
        <rect x="166" y="370" width="90" height="62" rx="5" fill="#e0e7ff" />
        <polygon points="166,420 208,374 256,420" fill="#6366f1" opacity="0.72" />
        <rect x="166" y="404" width="90" height="28" fill="#818cf8" opacity="0.38" />
        <text x="211" y="366" fill="#9ca3af" fontSize="6.5" fontFamily="system-ui,sans-serif">After</text>

        {/* Divider between before/after */}
        <line x1="157" y1="370" x2="157" y2="432" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />

        {/* Floating badge */}
        <g className="ha-badge" transform="translate(176, 378)">
          <rect x="0" y="0" width="52" height="16" rx="4" fill="white" stroke="#e0e7ff" strokeWidth="1" opacity="0.95" />
          <text x="26" y="11" textAnchor="middle" fill="#6366f1" fontSize="6.5" fontFamily="system-ui,sans-serif" fontWeight="700">
            +38% brighter
          </text>
        </g>

        {/* Animated cursor */}
        <g className="ha-cursor">
          <polygon
            points="0,0 0,18 4.5,13 8,21 10,20 6.5,12 12,12"
            fill="white"
            stroke="#1e1b4b"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>

        {/* Processing badge */}
        <g className="ha-pct" transform="translate(80, 352)">
          <rect x="0" y="0" width="96" height="22" rx="6" fill="url(#ha-brand)" />
          <text x="48" y="14.5" textAnchor="middle" fill="white" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="700">
            Processed 100%
          </text>
        </g>

        {/* Floating file info panel */}
        <g className="ha-panel" transform="translate(296, 375)">
          <rect x="0" y="0" width="108" height="60" rx="8" fill="white" stroke="#e0e7ff" strokeWidth="1"
            style={{ filter: "drop-shadow(0 4px 14px rgba(99,102,241,0.18))" }} />
          <rect x="0" y="0" width="108" height="22" rx="8" fill="#f5f3ff" />
          <rect x="0" y="12" width="108" height="10" fill="#f5f3ff" />
          <text x="54" y="15" textAnchor="middle" fill="#4f46e5" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">File Info</text>
          <text x="10" y="30" fill="#6b7280" fontSize="7" fontFamily="system-ui,sans-serif">Format:  WebP</text>
          <text x="10" y="42" fill="#6b7280" fontSize="7" fontFamily="system-ui,sans-serif">Size:      584 KB</text>
          <text x="10" y="54" fill="#10b981" fontSize="7" fontFamily="system-ui,sans-serif" fontWeight="600">76% smaller</text>
        </g>
      </svg>
    </div>
  );
}
