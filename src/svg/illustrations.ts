export function coverHardwareSvg(busActive: boolean): string {
  return `
  <svg class="illus-svg" viewBox="0 0 540 470" role="img" aria-label="Minh họa máy tính, bo mạch và ổ đĩa trang B-tree">
    <defs>
      <linearGradient id="cov-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1E40AF" />
        <stop offset="100%" stop-color="#091254" />
      </linearGradient>
      <linearGradient id="cov-screen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#E6F0FF" />
      </linearGradient>
      <linearGradient id="cov-disk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#60A5FA" />
        <stop offset="100%" stop-color="#003E99" />
      </linearGradient>
      <filter id="cov-soft-shadow" x="-15%" y="-15%" width="135%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#040829" flood-opacity="0.42" />
      </filter>
      <path id="cov-bus-a" d="M 332 326 L 266 356 L 204 328 L 154 304" />
      <path id="cov-bus-b" d="M 358 342 L 288 374 L 222 344 L 166 318" />
    </defs>

    <!-- Crisp architectural corner brackets -->
    <g stroke="rgba(191,219,254,0.28)" stroke-width="1.2" fill="none">
      <path d="M 20 44 L 20 24 L 40 24" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" />
      <path d="M 520 44 L 520 24 L 500 24" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" />
      <path d="M 20 426 L 20 446 L 40 446" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" />
      <path d="M 520 426 L 520 446 L 500 446" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" />
      <line x1="50" y1="24" x2="490" y2="24" stroke-dasharray="4 6" />
      <line x1="50" y1="446" x2="490" y2="446" stroke-dasharray="4 6" />
    </g>

    <!-- Isometric System Baseplate -->
    <g transform="translate(18, 8)" filter="url(#cov-soft-shadow)">
      <polygon points="246,232 478,336 250,434 18,330" fill="url(#cov-board)" stroke="#0A0F3D" stroke-width="2.6" stroke-linejoin="round" />
      <polygon points="18,330 250,434 250,448 18,344" fill="#070E3A" stroke="#0A0F3D" stroke-width="2.2" stroke-linejoin="round" />
      <polygon points="250,434 478,336 478,350 250,448" fill="#1D4ED8" stroke="#0A0F3D" stroke-width="2.2" stroke-linejoin="round" />

      <!-- Fine PCB coordinate grid on baseplate -->
      <g stroke="rgba(147,197,253,0.18)" stroke-width="1">
        <line x1="126" y1="284" x2="358" y2="388" />
        <line x1="184" y1="258" x2="416" y2="362" />
        <line x1="130" y1="382" x2="362" y2="282" />
        <line x1="188" y1="408" x2="420" y2="308" />
      </g>

      <!-- Continuous Data Bus connecting Disk Cylinder -> RAM Bridge -> Terminal -->
      <g stroke="${busActive ? '#FEF08A' : '#60A5FA'}" stroke-width="${busActive ? 3 : 2}" fill="none" stroke-linecap="round" stroke-linejoin="round" class="${busActive ? 'bus-glow' : ''}">
        <path d="M 332 326 L 266 356 L 204 328 L 154 304" class="${busActive ? 'bus-flow' : ''}" />
        <path d="M 358 342 L 288 374 L 222 344 L 166 318" class="${busActive ? 'bus-flow' : ''}" />
        <circle cx="154" cy="304" r="4" fill="${busActive ? '#FEF08A' : '#93C5FD'}" />
        <circle cx="332" cy="326" r="4" fill="${busActive ? '#FEF08A' : '#93C5FD'}" />
        <circle cx="358" cy="342" r="4" fill="${busActive ? '#FEF08A' : '#93C5FD'}" />
      </g>

      <!-- Live animated gold page packets flowing Disk -> Terminal when active -->
      ${
        busActive
          ? `
        <circle r="4.6" fill="#FEF08A" stroke="#0B1B59" stroke-width="1.5">
          <animateMotion dur="2s" repeatCount="indefinite"><mpath href="#cov-bus-a"/></animateMotion>
        </circle>
        <circle r="4.2" fill="#38BDF8" stroke="#0B1B59" stroke-width="1.4">
          <animateMotion dur="2s" begin="-1s" repeatCount="indefinite"><mpath href="#cov-bus-b"/></animateMotion>
        </circle>`
          : ''
      }

      <!-- Mini Isometric RAM Cache Chip on the bus -->
      <g transform="translate(216, 326)">
        <polygon points="32,0 64,14 32,28 0,14" fill="${busActive ? '#FEF08A' : '#93C5FD'}" stroke="#0A0F3D" stroke-width="1.8" />
        <polygon points="0,14 32,28 32,37 0,23" fill="#1E3A8A" stroke="#0A0F3D" stroke-width="1.6" />
        <polygon points="32,28 64,14 64,23 32,37" fill="#004AAD" stroke="#0A0F3D" stroke-width="1.6" />
        <text x="32" y="17" text-anchor="middle" fill="#0A0F3D" font-size="8.8" font-weight="800" font-family="'IBM Plex Mono', monospace">RAM</text>
      </g>

      <!-- Isometric Query Terminal / Monitor -->
      <g transform="translate(36, 26)">
        <!-- Pedestal Base -->
        <polygon points="116,222 174,248 134,266 76,240" fill="#1E3A8A" stroke="#0A0F3D" stroke-width="2.2" stroke-linejoin="round" />
        <polygon points="76,240 134,266 134,274 76,248" fill="#0A146E" stroke="#0A0F3D" stroke-width="1.8" />
        <polygon points="134,266 174,248 174,256 134,274" fill="#2563EB" stroke="#0A0F3D" stroke-width="1.8" />
        <rect x="115" y="196" width="24" height="40" fill="#004AAD" stroke="#0A0F3D" stroke-width="2.2" />
        <!-- Chassis 3D side + top -->
        <polygon points="22,38 32,32 252,3 242,9" fill="#1D4ED8" stroke="#0A0F3D" stroke-width="2" stroke-linejoin="round" />
        <polygon points="242,9 252,3 252,188 242,194" fill="#091254" stroke="#0A0F3D" stroke-width="2" stroke-linejoin="round" />
        <!-- Bezel & Screen -->
        <polygon points="22,38 242,9 242,194 22,223" fill="#0A146E" stroke="#0A0F3D" stroke-width="2.6" stroke-linejoin="round" />
        <polygon points="34,50 230,24 230,180 34,206" fill="url(#cov-screen)" stroke="#0A0F3D" stroke-width="1.6" />
        <!-- Window Chrome Bar -->
        <polygon points="34,50 230,24 230,44 34,70" fill="#004AAD" />
        <text x="48" y="61" fill="#FEF08A" font-size="10.2" font-weight="800" font-family="'IBM Plex Mono', monospace" transform="skewY(-7.6)">B-TREE INDEX ENGINE</text>
        <!-- Crisp Mini B-tree inside Screen -->
        <g transform="translate(0, 6)">
          <polygon points="94,76 168,66 168,90 94,100" fill="#FFFFFF" stroke="#004AAD" stroke-width="1.8" />
          <line x1="131" y1="71" x2="131" y2="95" stroke="#004AAD" stroke-width="1.4" />
          <text x="112" y="90" text-anchor="middle" fill="#0F1D3A" font-size="11.5" font-weight="800" font-family="'IBM Plex Mono', monospace">10</text>
          <text x="149" y="85" text-anchor="middle" fill="#0F1D3A" font-size="11.5" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
          <line x1="104" y1="98" x2="72" y2="128" stroke="#3B82F6" stroke-width="2" />
          <line x1="131" y1="95" x2="131" y2="122" stroke="${busActive ? '#16A34A' : '#3B82F6'}" stroke-width="2.5" />
          <line x1="158" y1="91" x2="192" y2="114" stroke="#3B82F6" stroke-width="2" />
          <polygon points="48,132 96,126 96,148 48,154" fill="#EEF7FF" stroke="#004AAD" stroke-width="1.5" />
          <polygon points="108,124 156,118 156,140 108,146" fill="${busActive ? '#DCFCE7' : '#FEF08A'}" stroke="${busActive ? '#15803D' : '#B45309'}" stroke-width="1.9" />
          <polygon points="168,116 216,110 216,132 168,138" fill="#EEF7FF" stroke="#004AAD" stroke-width="1.5" />
          <text x="72" y="144" text-anchor="middle" fill="#64748B" font-size="9.5" font-weight="700" font-family="'IBM Plex Mono', monospace">5|6</text>
          <text x="132" y="137" text-anchor="middle" fill="#0F1D3A" font-size="10" font-weight="800" font-family="'IBM Plex Mono', monospace">12|17</text>
          <text x="192" y="128" text-anchor="middle" fill="#64748B" font-size="9.5" font-weight="700" font-family="'IBM Plex Mono', monospace">30</text>
        </g>
        <!-- Bottom Query Status Strip -->
        <polygon points="46,174 218,151 218,170 46,193" fill="#004AAD" opacity="0.12" />
        <text x="56" y="185" fill="#004AAD" font-size="10" font-weight="800" font-family="'IBM Plex Mono', monospace" transform="skewY(-7.6)">QUERY: k=17 → O(h+1) I/O</text>
      </g>

      <!-- Isometric Disk / Page Cylinder on right-front -->
      <g transform="translate(278, 172)">
        <ellipse cx="95" cy="148" rx="74" ry="30" fill="#07103B" stroke="#0A0F3D" stroke-width="2.4" />
        <path d="M 21 114 L 21 148 A 74 30 0 0 0 169 148 L 169 114 Z" fill="url(#cov-disk)" stroke="#0A0F3D" stroke-width="2.4" />
        <ellipse cx="95" cy="114" rx="74" ry="30" fill="#93C5FD" stroke="#0A0F3D" stroke-width="2.4" />
        <path d="M 21 80 L 21 114 A 74 30 0 0 0 169 114 L 169 80 Z" fill="url(#cov-disk)" stroke="#0A0F3D" stroke-width="2.4" />
        <ellipse cx="95" cy="80" rx="74" ry="30" fill="#E0EEFF" stroke="#0A0F3D" stroke-width="2.4" />
        <!-- Concentric platter tracks -->
        <ellipse cx="95" cy="80" rx="54" ry="21" fill="none" stroke="#60A5FA" stroke-width="1.3" stroke-dasharray="6 4" />
        <ellipse cx="95" cy="80" rx="35" ry="14" fill="none" stroke="#3B82F6" stroke-width="1.2" />
        <ellipse cx="95" cy="80" rx="16" ry="7" fill="#0200A1" stroke="#0A0F3D" stroke-width="2" />
        <!-- Read/write head arm -->
        <line x1="158" y1="60" x2="108" y2="79" stroke="#FEF08A" stroke-width="4.2" stroke-linecap="round" />
        <circle cx="158" cy="60" r="7" fill="#FEF08A" stroke="#0A0F3D" stroke-width="2" />
        <circle cx="108" cy="79" r="3.4" fill="#FFFFFF" stroke="#B45309" stroke-width="1.5" />
        <!-- Clean label centered inside cylinder wall -->
        <rect x="41" y="124" width="108" height="20" rx="3" fill="rgba(7,16,59,0.68)" />
        <text x="95" y="138" text-anchor="middle" fill="#FEF08A" font-size="11" font-weight="800" letter-spacing="0.05em" font-family="'IBM Plex Mono', monospace">4 KB PAGE</text>
      </g>
    </g>
  </svg>
  `;
}

export function tocServerSvg(): string {
  return `
  <svg class="illus-svg" viewBox="0 0 380 310" role="img" aria-label="Máy chủ cơ sở dữ liệu isometric dùng chỉ mục B-tree">
    <defs>
      <linearGradient id="srv-side" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1D4ED8" />
        <stop offset="100%" stop-color="#07124A" />
      </linearGradient>
      <linearGradient id="srv-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#60A5FA" />
        <stop offset="100%" stop-color="#2563EB" />
      </linearGradient>
    </defs>

    <!-- Soft isometric ground halo -->
    <polygon points="190,224 334,274 190,304 46,274" fill="rgba(96,165,250,0.22)" />

    <g transform="translate(18, 6)">
      <!-- Top cap -->
      <polygon points="172,22 288,70 172,118 56,70" fill="#93C5FD" stroke="#0A0F3D" stroke-width="2.4" stroke-linejoin="round" />
      <!-- Mini etched B-tree glyph on top cap -->
      <g stroke="#003594" stroke-width="2" fill="none" stroke-linecap="round">
        <line x1="172" y1="54" x2="140" y2="76" />
        <line x1="172" y1="54" x2="172" y2="82" />
        <line x1="172" y1="54" x2="204" y2="76" />
        <circle cx="172" cy="54" r="5" fill="#FEF08A" />
        <circle cx="140" cy="76" r="4" fill="#FFFFFF" />
        <circle cx="172" cy="82" r="4" fill="#FFFFFF" />
        <circle cx="204" cy="76" r="4" fill="#FFFFFF" />
      </g>

      <!-- Left front face -->
      <polygon points="56,70 172,118 172,282 56,234" fill="url(#srv-front)" stroke="#0A0F3D" stroke-width="2.4" stroke-linejoin="round" />
      <!-- Right side face -->
      <polygon points="172,118 288,70 288,234 172,282" fill="url(#srv-side)" stroke="#0A0F3D" stroke-width="2.4" stroke-linejoin="round" />

      <!-- 4 Server Blade Bays with animated LEDs -->
      ${[0, 1, 2, 3]
        .map((i) => {
          const y = 92 + i * 37;
          return `
            <polygon points="70,${y} 158,${y + 36} 158,${y + 60} 70,${y + 24}" fill="#EEF7FF" stroke="#0B1B59" stroke-width="1.6" />
            <circle class="srv-led" style="--li:${i}" cx="84" cy="${y + 18}" r="3.6" fill="${i === 0 ? '#16A34A' : '#3B82F6'}" />
            <circle class="srv-led" style="--li:${i + 2}" cx="96" cy="${y + 23}" r="3.6" fill="${i === 1 ? '#FACC15' : '#93C5FD'}" />
            <line x1="110" y1="${y + 28}" x2="148" y2="${y + 44}" stroke="#004AAD" stroke-width="3" stroke-linecap="round" />
            <line class="srv-bar" style="--li:${i}" x1="188" y1="${y + 39}" x2="272" y2="${y + 4}" stroke="#93C5FD" stroke-width="2.2" stroke-linecap="round" opacity="0.72" />
          `;
        })
        .join('')}
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
