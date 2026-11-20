export function coverHardwareSvg(busActive: boolean): string {
  return `
  <svg class="illus-svg" viewBox="0 0 540 500" role="img" aria-label="Minh họa máy tính, bo mạch và ổ đĩa">
    <defs>
      <linearGradient id="cov-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1E40AF" />
        <stop offset="100%" stop-color="#0A146E" />
      </linearGradient>
      <linearGradient id="cov-screen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F8FBFF" />
        <stop offset="100%" stop-color="#DBEAFE" />
      </linearGradient>
      <linearGradient id="cov-disk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#60A5FA" />
        <stop offset="100%" stop-color="#004AAD" />
      </linearGradient>
      <linearGradient id="cov-glow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#93C5FD" stop-opacity="0.2" />
        <stop offset="50%" stop-color="#FEF08A" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#60A5FA" stop-opacity="0.4" />
      </linearGradient>
      <filter id="cov-soft-shadow" x="-15%" y="-15%" width="135%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#060A36" flood-opacity="0.38" />
      </filter>
    </defs>

    <!-- Subtle blueprint coordinate frame -->
    <g stroke="rgba(191,219,254,0.22)" stroke-width="1" fill="none">
      <line x1="22" y1="42" x2="518" y2="42" stroke-dasharray="4 6" />
      <line x1="22" y1="468" x2="518" y2="468" stroke-dasharray="4 6" />
      <path d="M 22 58 L 22 42 L 38 42" stroke="rgba(255,255,255,0.45)" stroke-width="1.6" />
      <path d="M 518 452 L 518 468 L 502 468" stroke="rgba(255,255,255,0.45)" stroke-width="1.6" />
    </g>

    <!-- Isometric Motherboard base -->
    <g transform="translate(18, 22)" filter="url(#cov-soft-shadow)">
      <polygon points="244,244 474,348 250,450 20,346" fill="url(#cov-board)" stroke="#1C0140" stroke-width="2.6" stroke-linejoin="round" />
      <polygon points="20,346 250,450 250,466 20,362" fill="#0B1348" stroke="#1C0140" stroke-width="2.4" stroke-linejoin="round" />
      <polygon points="250,450 474,348 474,364 250,466" fill="#1D4ED8" stroke="#1C0140" stroke-width="2.4" stroke-linejoin="round" />

      <!-- Fine PCB grid on board top -->
      <g stroke="rgba(147,197,253,0.18)" stroke-width="1">
        <line x1="130" y1="296" x2="360" y2="400" />
        <line x1="185" y1="270" x2="415" y2="374" />
        <line x1="134" y1="398" x2="362" y2="296" />
        <line x1="190" y1="424" x2="418" y2="322" />
      </g>

      <!-- Circuit bus traces with live signal flow when active -->
      <g stroke="${busActive ? '#FEF08A' : '#60A5FA'}" stroke-width="${busActive ? 3.2 : 2}" fill="none" stroke-linecap="round" stroke-linejoin="round" class="${busActive ? 'bus-glow' : ''}">
        <polyline points="140,350 212,318 282,350 342,324" class="${busActive ? 'bus-flow' : ''}" />
        <polyline points="172,370 242,338 304,366 376,334" class="${busActive ? 'bus-flow' : ''}" />
        <polyline points="204,390 274,358 328,382 418,342" class="${busActive ? 'bus-flow' : ''}" />
        <circle cx="140" cy="350" r="4.2" fill="${busActive ? '#FEF08A' : '#93C5FD'}" />
        <circle cx="342" cy="324" r="4.2" fill="${busActive ? '#FEF08A' : '#93C5FD'}" />
        <circle cx="418" cy="342" r="4.8" fill="${busActive ? '#FEF08A' : '#93C5FD'}" />
      </g>

      <!-- Isometric Monitor / Query Console -->
      <g transform="translate(40, 26)">
        <!-- Stand -->
        <polygon points="118,224 168,246 132,262 82,240" fill="#1E3A8A" stroke="#1C0140" stroke-width="2.2" />
        <rect x="116" y="196" width="22" height="38" fill="#004AAD" stroke="#1C0140" stroke-width="2.2" />
        <!-- Chassis side depth -->
        <polygon points="242,10 252,15 252,195 242,190" fill="#1C0140" />
        <!-- Bezel -->
        <polygon points="22,40 242,10 242,190 22,220" fill="#0A146E" stroke="#1C0140" stroke-width="2.8" stroke-linejoin="round" />
        <polygon points="34,52 230,26 230,178 34,204" fill="url(#cov-screen)" stroke="#1C0140" stroke-width="1.8" />
        <!-- Top window bar inside screen -->
        <polygon points="34,52 230,26 230,44 34,70" fill="#004AAD" />
        <text x="52" y="61" fill="#FFFFFF" font-size="10.5" font-weight="700" font-family="'IBM Plex Mono', monospace" transform="skewY(-7.6)">INDEX · B-TREE</text>
        <!-- Mini tree schematic on monitor screen -->
        <g transform="translate(0, 6)">
          <polygon points="94,76 168,66 168,90 94,100" fill="#FFFFFF" stroke="#004AAD" stroke-width="1.8" />
          <line x1="131" y1="71" x2="131" y2="95" stroke="#004AAD" stroke-width="1.4" />
          <text x="112" y="90" text-anchor="middle" fill="#0F1D3A" font-size="11" font-weight="800" font-family="'IBM Plex Mono', monospace">10</text>
          <text x="149" y="85" text-anchor="middle" fill="#0F1D3A" font-size="11" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
          <!-- 3 mini branches -->
          <line x1="104" y1="98" x2="72" y2="128" stroke="#5284FF" stroke-width="2" />
          <line x1="131" y1="95" x2="131" y2="122" stroke="#5284FF" stroke-width="2.4" />
          <line x1="158" y1="91" x2="192" y2="114" stroke="#5284FF" stroke-width="2" />
          <!-- 3 mini leaves -->
          <polygon points="48,132 96,126 96,148 48,154" fill="#EEF7FF" stroke="#004AAD" stroke-width="1.6" />
          <polygon points="108,124 156,118 156,140 108,146" fill="#FEF08A" stroke="#B45309" stroke-width="1.8" />
          <polygon points="168,116 216,110 216,132 168,138" fill="#EEF7FF" stroke="#004AAD" stroke-width="1.6" />
          <text x="132" y="137" text-anchor="middle" fill="#0F1D3A" font-size="10" font-weight="800" font-family="'IBM Plex Mono', monospace">12|17</text>
        </g>
        <!-- Bottom status strip inside monitor -->
        <polygon points="46,172 218,149 218,168 46,191" fill="#004AAD" opacity="0.12" />
        <text x="58" y="183" fill="#004AAD" font-size="10" font-weight="700" font-family="'IBM Plex Mono', monospace" transform="skewY(-7.6)">O(h + 1) PAGE I/O</text>
      </g>

      <!-- Isometric Disk / Page Cylinder on right-front -->
      <g transform="translate(278, 174)">
        <ellipse cx="95" cy="148" rx="74" ry="31" fill="#07103B" stroke="#1C0140" stroke-width="2.4" />
        <path d="M 21 114 L 21 148 A 74 31 0 0 0 169 148 L 169 114 Z" fill="url(#cov-disk)" stroke="#1C0140" stroke-width="2.4" />
        <ellipse cx="95" cy="114" rx="74" ry="31" fill="#93C5FD" stroke="#1C0140" stroke-width="2.4" />
        <path d="M 21 80 L 21 114 A 74 31 0 0 0 169 114 L 169 80 Z" fill="url(#cov-disk)" stroke="#1C0140" stroke-width="2.4" />
        <ellipse cx="95" cy="80" rx="74" ry="31" fill="#E0EEFF" stroke="#1C0140" stroke-width="2.4" />
        <!-- Concentric platter tracks -->
        <ellipse cx="95" cy="80" rx="54" ry="22" fill="none" stroke="#60A5FA" stroke-width="1.3" stroke-dasharray="6 4" />
        <ellipse cx="95" cy="80" rx="36" ry="15" fill="none" stroke="#3B82F6" stroke-width="1.2" />
        <ellipse cx="95" cy="80" rx="18" ry="8" fill="#0200A1" stroke="#1C0140" stroke-width="2" />
        <!-- Read/write head arm -->
        <line x1="160" y1="60" x2="108" y2="79" stroke="#FEF08A" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="160" cy="60" r="7.5" fill="#FEF08A" stroke="#1C0140" stroke-width="2" />
        <circle cx="108" cy="79" r="3.5" fill="#FFFFFF" stroke="#B45309" stroke-width="1.5" />
        <text x="95" y="139" text-anchor="middle" fill="#FFFFFF" font-size="12.5" font-weight="800" letter-spacing="0.06em" font-family="'IBM Plex Mono', monospace">DISK PAGE · 4 KB</text>
      </g>
    </g>
  </svg>
  `;
}

export function tocServerSvg(): string {
  return `
  <svg class="illus-svg" viewBox="0 0 420 460" role="img" aria-label="Máy chủ cơ sở dữ liệu isometric">
    <defs>
      <linearGradient id="srv-side" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#004AAD" />
        <stop offset="100%" stop-color="#0200A1" />
      </linearGradient>
      <linearGradient id="srv-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5284FF" />
        <stop offset="100%" stop-color="#1D4ED8" />
      </linearGradient>
    </defs>

    <!-- Floor shadow -->
    <polygon points="210,335 375,392 210,442 45,392" fill="#9FCDFF" opacity="0.45" />

    <!-- Isometric Server Tower -->
    <g transform="translate(20, 12)">
      <!-- Top -->
      <polygon points="190,46 322,102 190,158 58,102" fill="#9FCDFF" stroke="#1C0140" stroke-width="3" stroke-linejoin="round" />
      <!-- Left front face -->
      <polygon points="58,102 190,158 190,390 58,334" fill="url(#srv-front)" stroke="#1C0140" stroke-width="3" stroke-linejoin="round" />
      <!-- Right side face -->
      <polygon points="190,158 322,102 322,334 190,390" fill="url(#srv-side)" stroke="#1C0140" stroke-width="3" stroke-linejoin="round" />

      <!-- 4 Server Blade Bays -->
      ${[0, 1, 2, 3]
        .map((i) => {
          const y = 128 + i * 52;
          return `
            <polygon points="74,${y} 174,${y + 42} 174,${y + 74} 74,${y + 32}" fill="#EEF7FF" stroke="#0200A1" stroke-width="2" />
            <circle class="srv-led" style="--li:${i}" cx="90" cy="${y + 22}" r="4.5" fill="${i === 0 ? '#16A34A' : '#5284FF'}" />
            <circle class="srv-led" style="--li:${i + 2}" cx="104" cy="${y + 28}" r="4.5" fill="${i === 1 ? '#FEF08A' : '#93C5FD'}" />
            <line x1="120" y1="${y + 34}" x2="162" y2="${y + 52}" stroke="#004AAD" stroke-width="3.5" stroke-linecap="round" />
            <line class="srv-bar" style="--li:${i}" x1="208" y1="${y + 46}" x2="306" y2="${y + 4}" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
          `;
        })
        .join('')}

      <!-- Floating B-tree Badge above server -->
      <g class="srv-float" transform="translate(115, 0)">
        <rect x="0" y="0" width="150" height="36" rx="18" fill="#0200A1" stroke="#1C0140" stroke-width="2" />
        <text x="75" y="23" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="800" font-family="'IBM Plex Mono', monospace">B-TREE INDEX</text>
      </g>
    </g>
  </svg>
  `;
}

export function iconSvg(kind: 'tree' | 'disk' | 'input' | 'output'): string {
  switch (kind) {
    case 'tree':
      return `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
        <rect x="14" y="4" width="20" height="10" rx="2" fill="#EEF7FF" stroke="#004AAD" stroke-width="2.2"/>
        <line x1="18" y1="14" x2="10" y2="30" stroke="#004AAD" stroke-width="2.2"/>
        <line x1="24" y1="14" x2="24" y2="30" stroke="#004AAD" stroke-width="2.2"/>
        <line x1="30" y1="14" x2="38" y2="30" stroke="#004AAD" stroke-width="2.2"/>
        <rect x="3" y="30" width="14" height="10" rx="2" fill="#5284FF" stroke="#004AAD" stroke-width="2"/>
        <rect x="17" y="30" width="14" height="10" rx="2" fill="#5284FF" stroke="#004AAD" stroke-width="2"/>
        <rect x="31" y="30" width="14" height="10" rx="2" fill="#5284FF" stroke="#004AAD" stroke-width="2"/>
      </svg>`;
    case 'disk':
      return `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
        <ellipse cx="24" cy="12" rx="16" ry="6" fill="#EEF7FF" stroke="#004AAD" stroke-width="2.2"/>
        <path d="M8 12 v22 a16 6 0 0 0 32 0 v-22" fill="#5284FF" stroke="#004AAD" stroke-width="2.2"/>
        <ellipse cx="24" cy="23" rx="16" ry="6" fill="none" stroke="#EEF7FF" stroke-width="1.8"/>
        <ellipse cx="24" cy="12" rx="16" ry="6" fill="#DBEAFE" stroke="#004AAD" stroke-width="2.2"/>
      </svg>`;
    case 'input':
      return `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
        <rect x="5" y="10" width="38" height="28" rx="5" fill="#EEF7FF" stroke="#004AAD" stroke-width="2.2"/>
        <line x1="12" y1="19" x2="36" y2="19" stroke="#5284FF" stroke-width="3" stroke-linecap="round"/>
        <line x1="12" y1="27" x2="28" y2="27" stroke="#004AAD" stroke-width="3" stroke-linecap="round"/>
        <circle cx="34" cy="27" r="3" fill="#16A34A"/>
      </svg>`;
    case 'output':
      return `<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
        <rect x="5" y="7" width="38" height="26" rx="4" fill="#EEF7FF" stroke="#004AAD" stroke-width="2.2"/>
        <path d="M16 20 l5 5 l11 -11" fill="none" stroke="#16A34A" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="24" y1="33" x2="24" y2="41" stroke="#004AAD" stroke-width="3"/>
        <line x1="14" y1="41" x2="34" y2="41" stroke="#004AAD" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
  }
}

export function xfsBlockRowHtml(
  blocks: ('free' | 'used')[],
  opts?: {
    windowStart?: number;
    windowLen?: number;
    windowFit?: boolean;
    labels?: number[];
    highlightRange?: [number, number];
    cutAfterAddr?: number;
  },
): string {
  const cells = blocks
    .map((state, idx) => {
      const addr = opts?.labels ? opts.labels[idx] : idx;
      const inWin =
        opts?.windowStart !== undefined &&
        opts?.windowLen !== undefined &&
        idx >= opts.windowStart &&
        idx < opts.windowStart + opts.windowLen;
      const isAllocated =
        opts?.highlightRange && addr >= opts.highlightRange[0] && addr <= opts.highlightRange[1];
      const isCutAfter = opts?.cutAfterAddr !== undefined && addr === opts.cutAfterAddr;
      const cls = [
        'xfs-cell',
        state === 'free' ? 'is-free' : 'is-used',
        inWin ? (opts?.windowFit ? 'is-win-ok' : 'is-win-fail') : '',
        isAllocated ? 'is-alloc' : '',
        isCutAfter ? 'is-cut-right' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const sym = state === 'free' ? '○' : '■';
      return `<button type="button" class="${cls}" style="--bi:${idx}" data-block-addr="${addr}" data-block-state="${state}" tabindex="${opts?.labels ? 0 : -1}">
        <span class="xfs-cell__addr">${opts?.labels ? addr : idx + 1}</span>
        <span class="xfs-cell__sym" aria-hidden="true">${sym}</span>
      </button>`;
    })
    .join('');

  let frameHtml = '';
  if (opts?.windowStart !== undefined && opts?.windowLen !== undefined) {
    const cls = opts.windowFit ? 'xfs-measure-frame is-frame-ok' : 'xfs-measure-frame is-frame-fail';
    const lbl = opts.windowFit ? 'Khung đo 10 block · Vừa khít' : 'Khung đo 10 block · Vướng block đã dùng';
    frameHtml = `<div class="${cls}" style="--ws:${opts.windowStart};--wl:${opts.windowLen}" aria-hidden="true"><span>${lbl}</span></div>`;
  }

  return `<div class="xfs-strip-wrap"><div class="xfs-strip">${cells}</div>${frameHtml}</div>`;
}
