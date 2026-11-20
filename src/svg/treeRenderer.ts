import type { KeyTone, TreeNodeSpec, TreeSceneSpec } from '../types';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface PosMap {
  nodes: Map<string, { x: number; y: number; state: string }>;
  keys: Map<string, { x: number; y: number; nodeId: string; tone: KeyTone }>;
  chips: Map<string, { x: number; y: number }>;
}

const containerPositions = new WeakMap<HTMLElement, PosMap>();
const containerAnims = new WeakMap<HTMLElement, Animation[]>();

export function cancelTreeAnimations(container: HTMLElement): void {
  const anims = containerAnims.get(container);
  if (anims) {
    for (const a of anims) {
      try {
        a.cancel();
      } catch {
        // ignore
      }
    }
    containerAnims.set(container, []);
  }
}

interface NodeGeom {
  spec: TreeNodeSpec;
  cellW: number;
  cellH: number;
  slotCount: number;
  width: number;
  height: number;
  left: number;
  top: number;
  bottom: number;
  right: number;
  keyCenters: { id: string; x: number; y: number }[];
  portCoords: { x: number; y: number }[];
}

function computeNodeGeom(n: TreeNodeSpec): NodeGeom {
  const cellW = n.cellW ?? 52;
  const cellH = n.cellH ?? 42;
  const slotCount = Math.max(n.capacity ?? 0, n.keys.length, 1);
  const width = slotCount * cellW;
  const height = cellH;
  const left = n.x - width / 2;
  const top = n.y - height / 2;
  const bottom = top + height;
  const right = left + width;

  const keyCenters = n.keys.map((k, idx) => ({
    id: k.id,
    x: left + idx * cellW + cellW / 2,
    y: top + cellH / 2,
  }));

  // Child ports: n.keys.length + 1 ports spread cleanly at bottom dividers
  const keyCount = n.keys.length;
  const portCoords: { x: number; y: number }[] = [];
  if (keyCount === 0) {
    portCoords.push({ x: n.x, y: bottom });
  } else {
    const activeW = keyCount * cellW;
    for (let p = 0; p <= keyCount; p++) {
      let px = left + p * cellW;
      if (p === 0) px = left + 8;
      else if (p === keyCount) px = left + activeW - 8;
      portCoords.push({ x: px, y: bottom });
    }
  }

  return {
    spec: n,
    cellW,
    cellH,
    slotCount,
    width,
    height,
    left,
    top,
    bottom,
    right,
    keyCenters,
    portCoords,
  };
}

function toneFillStroke(tone: KeyTone = 'default'): { fill: string; stroke: string; text: string; dash?: string; doubleBorder?: boolean } {
  switch (tone) {
    case 'active':
      return { fill: '#FEF08A', stroke: '#B45309', text: '#0F1D3A', doubleBorder: true };
    case 'success':
      return { fill: '#BBF7D0', stroke: '#16A34A', text: '#14532D' };
    case 'error':
      return { fill: '#FEE2E2', stroke: '#DC2626', text: '#991B1B', dash: '5 3' };
    case 'muted':
      return { fill: '#F1F5F9', stroke: '#94A3B8', text: '#64748B' };
    case 'guide':
      return { fill: '#E0ECFF', stroke: '#004AAD', text: '#004AAD' };
    case 'record':
      return { fill: '#FFFFFF', stroke: '#0284C7', text: '#0F1D3A' };
    case 'empty':
      return { fill: '#F8FAFC', stroke: '#94A3B8', text: '#94A3B8', dash: '4 3' };
    default:
      return { fill: '#FFFFFF', stroke: '#004AAD', text: '#0F1D3A' };
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tagColors(tone: TreeNodeSpec['tagTone'] = 'default'): { bg: string; fg: string; border: string } {
  switch (tone) {
    case 'cobalt':
      return { bg: '#5284FF', fg: '#FFFFFF', border: '#004AAD' };
    case 'error':
      return { bg: '#FEE2E2', fg: '#B91C1C', border: '#DC2626' };
    case 'success':
      return { bg: '#DCFCE7', fg: '#15803D', border: '#16A34A' };
    case 'warn':
      return { bg: '#FEF3C7', fg: '#92400E', border: '#D97706' };
    default:
      return { bg: '#EEF7FF', fg: '#004AAD', border: '#5284FF' };
  }
}

export function renderTreeScene(
  container: HTMLElement,
  scene: TreeSceneSpec,
  opts?: { reducedMotion?: boolean; animate?: boolean; durationMs?: number },
): SVGSVGElement {
  cancelTreeAnimations(container);
  const prevPos = containerPositions.get(container);

  const [vx, vy, vw, vh] = scene.viewBox;
  const geomMap = new Map<string, NodeGeom>();
  for (const n of scene.nodes) {
    geomMap.set(n.id, computeNodeGeom(n));
  }

  const nextPos: PosMap = {
    nodes: new Map(),
    keys: new Map(),
    chips: new Map(),
  };

  const markerPrefix = `tr-${Math.random().toString(36).slice(2, 7)}`;

  const parts: string[] = [];
  parts.push(`
    <defs>
      <marker id="${markerPrefix}-arrow-normal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#1E3A8A" />
      </marker>
      <marker id="${markerPrefix}-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#5284FF" />
      </marker>
      <marker id="${markerPrefix}-arrow-error" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#DC2626" />
      </marker>
      <marker id="${markerPrefix}-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#16A34A" />
      </marker>
      <marker id="${markerPrefix}-arrow-warn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#D97706" />
      </marker>
      <filter id="${markerPrefix}-shadow" x="-15%" y="-15%" width="135%" height="145%">
        <feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#0F1D3A" flood-opacity="0.14" />
      </filter>
    </defs>
  `);

  if (scene.underlaySvg) {
    parts.push(`<g class="tr-underlay">${scene.underlaySvg}</g>`);
  }

  // Baseline equal-depth horizontal guide
  if (scene.baselineY) {
    const b = scene.baselineY;
    const pillW = b.label ? Math.max(260, Math.round(b.label.length * 7.6 + 38)) : 280;
    parts.push(`
      <g class="tr-baseline">
        <line x1="${b.x1}" y1="${b.y}" x2="${b.x2}" y2="${b.y}" stroke="#004AAD" stroke-width="2.5" stroke-dasharray="7 5" opacity="0.85" />
        ${b.label ? `<rect x="${(b.x1 + b.x2) / 2 - pillW / 2}" y="${b.y + 6}" width="${pillW}" height="24" rx="12" fill="#004AAD" />
        <text x="${(b.x1 + b.x2) / 2}" y="${b.y + 22}" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">${escapeXml(b.label)}</text>` : ''}
      </g>
    `);
  }

  // Edges
  parts.push('<g class="tr-edges">');
  for (const e of scene.edges) {
    const fg = geomMap.get(e.fromNode);
    const tg = geomMap.get(e.toNode);
    if (!fg || !tg) continue;
    const pIdx = Math.min(Math.max(e.portIndex, 0), fg.portCoords.length - 1);
    const start = fg.portCoords[pIdx];
    const end = { x: tg.spec.x, y: tg.top - 7 }; // land cleanly on top bevel
    const isActive = e.state === 'active';
    const isMuted = e.state === 'muted';
    const isError = e.state === 'error';
    const isDashed = e.state === 'dashed';
    const stroke = isActive ? '#5284FF' : isError ? '#DC2626' : isMuted ? '#94A3B8' : '#1E3A8A';
    const strokeW = isActive ? 3.5 : 2.2;
    const dash = isDashed ? '6 4' : isError ? '5 3' : '';
    const opacity = isMuted ? 0.35 : 1;
    const marker = e.arrow || isActive
      ? ` marker-end="url(#${markerPrefix}-arrow-${isActive ? 'active' : isError ? 'error' : 'normal'})"`
      : '';
    const midY = (start.y + end.y) / 2;
    const d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${start.x.toFixed(1)} ${midY.toFixed(1)}, ${end.x.toFixed(1)} ${midY.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
    parts.push(
      `<path class="tr-edge${isActive ? ' is-active' : ''}" data-edge-id="${escapeXml(e.id)}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeW}"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${opacity}"${marker} />`,
    );
    if (e.label) {
      const lx = (start.x + end.x) / 2;
      const ly = midY - 4;
      const lw = Math.max(38, e.label.length * 8 + 14);
      parts.push(`
        <g class="tr-edge-label">
          <rect x="${lx - lw / 2}" y="${ly - 11}" width="${lw}" height="21" rx="10" fill="${isActive ? '#5284FF' : '#EEF7FF'}" stroke="${stroke}" stroke-width="1.3" />
          <text x="${lx}" y="${ly + 4}" text-anchor="middle" fill="${isActive ? '#FFFFFF' : '#004AAD'}" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">${escapeXml(e.label)}</text>
        </g>
      `);
    }
  }
  parts.push('</g>');

  // Horizontal leaf links (B+ tree)
  if (scene.leafLinks && scene.leafLinks.length > 0) {
    parts.push('<g class="tr-leaf-links">');
    for (const lk of scene.leafLinks) {
      const fg = geomMap.get(lk.fromNode);
      const tg = geomMap.get(lk.toNode);
      if (!fg || !tg) continue;
      const x1 = fg.right + 8;
      const y1 = fg.spec.y;
      const x2 = tg.left - 4;
      const y2 = tg.spec.y;
      const color = lk.active ? '#16A34A' : '#5284FF';
      const sw = lk.active ? 3.5 : 2.2;
      const mId = lk.active ? `${markerPrefix}-arrow-success` : `${markerPrefix}-arrow-active`;
      parts.push(
        `<line class="tr-leaf-link${lk.active ? ' is-active' : ''}" data-link-id="${escapeXml(lk.id)}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-dasharray="${lk.active ? '' : '5 3'}" marker-end="url(#${mId})" />`,
      );
      if (lk.label) {
        parts.push(
          `<text x="${(x1 + x2) / 2}" y="${y1 - 8}" text-anchor="middle" fill="${color}" font-size="11" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">${escapeXml(lk.label)}</text>`,
        );
      }
    }
    parts.push('</g>');
  }

  // Nodes (3D extruded Canva blocks)
  parts.push('<g class="tr-nodes">');
  const BEVEL = 6;
  for (const n of scene.nodes) {
    const g = geomMap.get(n.id)!;
    nextPos.nodes.set(n.id, { x: n.x, y: n.y, state: n.state ?? 'normal' });
    const nodeOpacity = n.opacity ?? (n.state === 'muted' ? 0.36 : 1);
    const isOverflow = n.state === 'overflow';
    const isUnderflow = n.state === 'underflow' || n.state === 'empty-root';
    const isActiveNode = n.state === 'active';
    const isSuccessNode = n.state === 'success';

    const outerStroke = isOverflow || isUnderflow
      ? '#DC2626'
      : isSuccessNode
        ? '#16A34A'
        : isActiveNode
          ? '#5284FF'
          : '#004AAD';

    const topBevelFill = isOverflow || isUnderflow
      ? '#FCA5A5'
      : isSuccessNode
        ? '#86EFAC'
        : isActiveNode
          ? '#93C5FD'
          : '#BDD8FF';

    const rightBevelFill = isOverflow || isUnderflow
      ? '#F87171'
      : isSuccessNode
        ? '#4ADE80'
        : isActiveNode
          ? '#5284FF'
          : '#7EB2FF';

    parts.push(`<g class="tr-node" data-node-id="${escapeXml(n.id)}" opacity="${nodeOpacity}" filter="url(#${markerPrefix}-shadow)">`);

    // Highlight halo around node if overflow / underflow / active / highlight-box
    if (isOverflow || isUnderflow || n.state === 'highlight-box') {
      const haloStroke = isOverflow || isUnderflow ? '#DC2626' : '#5284FF';
      parts.push(
        `<rect x="${g.left - 6}" y="${g.top - BEVEL - 6}" width="${g.width + BEVEL + 12}" height="${g.height + BEVEL + 12}" rx="8" fill="${isOverflow || isUnderflow ? 'rgba(254,226,226,0.45)' : 'rgba(82,132,255,0.12)'}" stroke="${haloStroke}" stroke-width="2.4" stroke-dasharray="6 4" />`,
      );
    }

    // 3D Top face polygon
    parts.push(
      `<polygon points="${g.left},${g.top} ${g.left + BEVEL},${g.top - BEVEL} ${g.right + BEVEL},${g.top - BEVEL} ${g.right},${g.top}" fill="${topBevelFill}" stroke="${outerStroke}" stroke-width="1.6" stroke-linejoin="round" />`,
    );
    // 3D Right face polygon
    parts.push(
      `<polygon points="${g.right},${g.top} ${g.right + BEVEL},${g.top - BEVEL} ${g.right + BEVEL},${g.bottom - BEVEL} ${g.right},${g.bottom}" fill="${rightBevelFill}" stroke="${outerStroke}" stroke-width="1.6" stroke-linejoin="round" />`,
    );

    // Individual key slots
    if (n.keys.length === 0) {
      parts.push(
        `<rect x="${g.left}" y="${g.top}" width="${g.width}" height="${g.height}" fill="#FEE2E2" stroke="#DC2626" stroke-width="2.2" stroke-dasharray="5 3" />`,
      );
      parts.push(
        `<text x="${n.x}" y="${n.y + 5}" text-anchor="middle" fill="#B91C1C" font-size="14" font-weight="700" font-family="'IBM Plex Mono', monospace">∅</text>`,
      );
    } else {
      for (let idx = 0; idx < g.slotCount; idx++) {
        const cx = g.left + idx * g.cellW;
        const k = n.keys[idx];
        if (!k) {
          // Empty capacity slot
          parts.push(
            `<rect x="${cx}" y="${g.top}" width="${g.cellW}" height="${g.cellH}" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.6" stroke-dasharray="4 3" />`,
          );
          continue;
        }
        const style = toneFillStroke(k.tone);
        const keyCenterX = cx + g.cellW / 2;
        const keyCenterY = g.top + g.cellH / 2;
        nextPos.keys.set(k.id, { x: keyCenterX, y: keyCenterY, nodeId: n.id, tone: k.tone ?? 'default' });

        const clickClass = k.clickable ? ' tr-key--clickable' : '';
        const extraAttr = k.dataAttr ? ` ${k.dataAttr}` : '';
        parts.push(`<g class="tr-key${clickClass}" data-key-id="${escapeXml(k.id)}"${extraAttr}>`);
        parts.push(
          `<rect x="${cx}" y="${g.top}" width="${g.cellW}" height="${g.cellH}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.doubleBorder ? 2.6 : 1.9}"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''} />`,
        );
        if (style.doubleBorder) {
          parts.push(
            `<rect x="${cx + 3.5}" y="${g.top + 3.5}" width="${g.cellW - 7}" height="${g.cellH - 7}" fill="none" stroke="#D97706" stroke-width="1.5" rx="2" />`,
          );
        }
        const fontSize = k.label.length > 6 ? 13 : k.label.length > 4 ? 15 : 18;
        const textY = k.sublabel ? keyCenterY - 1 : keyCenterY + 6;
        parts.push(
          `<text x="${keyCenterX}" y="${textY}" text-anchor="middle" fill="${style.text}" font-size="${fontSize}" font-weight="700" font-family="'IBM Plex Mono', monospace">${escapeXml(k.label)}</text>`,
        );
        if (k.sublabel) {
          parts.push(
            `<text x="${keyCenterX}" y="${keyCenterY + 13}" text-anchor="middle" fill="#475569" font-size="10.5" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">${escapeXml(k.sublabel)}</text>`,
          );
        }
        if (k.badge) {
          parts.push(
            `<rect x="${cx + 2}" y="${g.top - 16}" width="${Math.max(g.cellW - 4, 34)}" height="15" rx="7" fill="#0284C7" />` +
            `<text x="${keyCenterX}" y="${g.top - 5}" text-anchor="middle" fill="#FFFFFF" font-size="9.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">${escapeXml(k.badge)}</text>`,
          );
        }
        parts.push('</g>');
      }
    }

    // Outer frame border for crisp edges
    parts.push(
      `<rect x="${g.left}" y="${g.top}" width="${g.width}" height="${g.height}" fill="none" stroke="${outerStroke}" stroke-width="2.1" />`,
    );

    // Optional port dots
    if (n.showPorts) {
      for (const p of g.portCoords) {
        parts.push(`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#004AAD" stroke="#FFFFFF" stroke-width="1.2" />`);
      }
    }

    // Floating node tag
    if (n.tag) {
      const tc = tagColors(n.tagTone);
      const tw = Math.max(54, n.tag.length * 7.6 + 18);
      let tx = n.x;
      let ty = g.top - 22;
      if (n.tagPos === 'bottom') ty = g.bottom + 20;
      else if (n.tagPos === 'left') { tx = g.left - tw / 2 - 10; ty = n.y; }
      else if (n.tagPos === 'right') { tx = g.right + BEVEL + tw / 2 + 10; ty = n.y; }
      parts.push(`
        <g class="tr-node-tag">
          <rect x="${tx - tw / 2}" y="${ty - 11}" width="${tw}" height="22" rx="11" fill="${tc.bg}" stroke="${tc.border}" stroke-width="1.4" />
          <text x="${tx}" y="${ty + 4}" text-anchor="middle" fill="${tc.fg}" font-size="11.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">${escapeXml(n.tag)}</text>
        </g>
      `);
    }

    // B+ leaf record note below node
    if (n.recordNote) {
      parts.push(
        `<text x="${n.x}" y="${g.bottom + 17}" text-anchor="middle" fill="#1E3A8A" font-size="11.5" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">${escapeXml(n.recordNote)}</text>`,
      );
    }

    parts.push('</g>');
  }
  parts.push('</g>');

  // Curved transfer arrows (Borrow / Merge / Redistribute / Split push-up)
  if (scene.transfers && scene.transfers.length > 0) {
    parts.push('<g class="tr-transfers">');
    for (const tr of scene.transfers) {
      const tone = tr.tone ?? 'cobalt';
      const color =
        tone === 'warn' ? '#D97706' : tone === 'success' ? '#16A34A' : tone === 'error' ? '#DC2626' : '#5284FF';
      const mId = `${markerPrefix}-arrow-${tone === 'cobalt' ? 'active' : tone}`;
      parts.push(
        `<path class="tr-transfer" d="M ${tr.fromX} ${tr.fromY} Q ${tr.ctrlX} ${tr.ctrlY} ${tr.toX} ${tr.toY}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="7 4" marker-end="url(#${mId})" />`,
      );
      if (tr.label) {
        const lx = 0.25 * tr.fromX + 0.5 * tr.ctrlX + 0.25 * tr.toX;
        const ly = 0.25 * tr.fromY + 0.5 * tr.ctrlY + 0.25 * tr.toY;
        const lw = Math.max(46, tr.label.length * 7.8 + 16);
        parts.push(`
          <rect x="${lx - lw / 2}" y="${ly - 12}" width="${lw}" height="22" rx="11" fill="#FFFFFF" stroke="${color}" stroke-width="1.8" />
          <text x="${lx}" y="${ly + 3.5}" text-anchor="middle" fill="${color}" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">${escapeXml(tr.label)}</text>
        `);
      }
    }
    parts.push('</g>');
  }

  // Brackets
  if (scene.brackets && scene.brackets.length > 0) {
    parts.push('<g class="tr-brackets">');
    for (const br of scene.brackets) {
      const color = br.tone === 'error' ? '#DC2626' : br.tone === 'success' ? '#16A34A' : '#004AAD';
      const dy = br.dir === 'down' ? 10 : -10;
      const mid = (br.x1 + br.x2) / 2;
      parts.push(
        `<path d="M ${br.x1} ${br.y} L ${br.x1} ${br.y + dy} L ${br.x2} ${br.y + dy} L ${br.x2} ${br.y}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
      );
      parts.push(
        `<text x="${mid}" y="${br.y + (br.dir === 'down' ? 28 : -16)}" text-anchor="middle" fill="${color}" font-size="13" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">${escapeXml(br.label)}</text>`,
      );
    }
    parts.push('</g>');
  }

  // Floating chips
  if (scene.chips && scene.chips.length > 0) {
    parts.push('<g class="tr-chips">');
    for (const ch of scene.chips) {
      nextPos.chips.set(ch.id, { x: ch.x, y: ch.y });
      const bg =
        ch.tone === 'active'
          ? '#FEF08A'
          : ch.tone === 'success'
            ? '#DCFCE7'
            : ch.tone === 'error'
              ? '#FEE2E2'
              : ch.tone === 'cobalt'
                ? '#5284FF'
                : '#EEF7FF';
      const fg =
        ch.tone === 'cobalt'
          ? '#FFFFFF'
          : ch.tone === 'error'
            ? '#991B1B'
            : ch.tone === 'success'
              ? '#14532D'
              : '#0F1D3A';
      const stroke =
        ch.tone === 'active'
          ? '#B45309'
          : ch.tone === 'success'
            ? '#16A34A'
            : ch.tone === 'error'
              ? '#DC2626'
              : '#004AAD';
      const w = Math.max(48, ch.text.length * 8.2 + 22);
      parts.push(`
        <g class="tr-chip" data-chip-id="${escapeXml(ch.id)}">
          <rect x="${ch.x - w / 2}" y="${ch.y - 16}" width="${w}" height="32" rx="16" fill="${bg}" stroke="${stroke}" stroke-width="2.2" />
          <text x="${ch.x}" y="${ch.y + 5}" text-anchor="middle" fill="${fg}" font-size="14" font-weight="800" font-family="'IBM Plex Mono', monospace">${escapeXml(ch.text)}</text>
        </g>
      `);
    }
    parts.push('</g>');
  }

  if (scene.overlaySvg) {
    parts.push(`<g class="tr-overlay">${scene.overlaySvg}</g>`);
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
  svg.setAttribute('class', 'tree-svg');
  svg.setAttribute('role', 'img');
  svg.innerHTML = parts.join('');

  container.innerHTML = '';
  container.appendChild(svg);

  // Animate persistent IDs from prevPos -> nextPos via Web Animations API
  const shouldAnimate = (opts?.animate ?? true) && !opts?.reducedMotion;
  const anims: Animation[] = [];
  const dur = opts?.durationMs ?? 460;
  const easing = 'cubic-bezier(.22, 1, .36, 1)';

  if (shouldAnimate && prevPos) {
    // Animate moved nodes as cohesive 3D units (bevel + outer frame + keys move together!)
    svg.querySelectorAll<SVGGElement>('[data-node-id]').forEach((el) => {
      const id = el.dataset.nodeId!;
      const oldP = prevPos.nodes.get(id);
      const newP = nextPos.nodes.get(id);
      if (oldP && newP) {
        const dx = oldP.x - newP.x;
        const dy = oldP.y - newP.y;
        if (Math.hypot(dx, dy) > 2) {
          anims.push(
            el.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: 'translate(0px, 0px)' },
              ],
              { duration: Math.min(dur, 480), easing },
            ),
          );
        } else if (oldP.state !== newP.state && (newP.state === 'overflow' || newP.state === 'underflow' || newP.state === 'empty-root')) {
          anims.push(
            el.animate(
              [
                { transform: 'translateX(0px)' },
                { transform: 'translateX(-4px)', offset: 0.25 },
                { transform: 'translateX(4px)', offset: 0.55 },
                { transform: 'translateX(-2px)', offset: 0.8 },
                { transform: 'translateX(0px)' },
              ],
              { duration: 360, easing: 'ease-out' },
            ),
          );
        } else if (oldP.state !== newP.state && newP.state === 'success') {
          anims.push(
            el.animate(
              [
                { transform: 'translateY(0px)' },
                { transform: 'translateY(-4px)', offset: 0.42 },
                { transform: 'translateY(0px)' },
              ],
              { duration: 340, easing },
            ),
          );
        }
      } else if (!oldP && newP) {
        // Newly created node enters with crisp upward settle
        anims.push(
          el.animate(
            [
              { opacity: 0, transform: 'translateY(10px)' },
              { opacity: 1, transform: 'translateY(0px)' },
            ],
            { duration: 320, easing },
          ),
        );
      }
    });

    // Cross-node key flight along a clean lift arc + drop-in for newly inserted keys + tone pulse
    svg.querySelectorAll<SVGGElement>('[data-key-id]').forEach((el) => {
      const id = el.dataset.keyId!;
      const oldP = prevPos.keys.get(id);
      const newP = nextPos.keys.get(id);
      if (oldP && newP && oldP.nodeId !== newP.nodeId) {
        const dx = oldP.x - newP.x;
        const dy = oldP.y - newP.y;
        if (Math.hypot(dx, dy) > 2) {
          const midX = dx * 0.45;
          const midY = dy * 0.45 - 16;
          anims.push(
            el.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: `translate(${midX}px, ${midY}px)`, offset: 0.48 },
                { transform: 'translate(0px, 0px)' },
              ],
              { duration: Math.min(dur + 40, 500), easing },
            ),
          );
        }
      } else if (!oldP && newP) {
        anims.push(
          el.animate(
            [
              { opacity: 0, transform: 'translateY(-12px)' },
              { opacity: 1, transform: 'translateY(0px)' },
            ],
            { duration: 320, easing },
          ),
        );
      } else if (oldP && newP && oldP.tone !== newP.tone && (newP.tone === 'active' || newP.tone === 'success' || newP.tone === 'error')) {
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = 'center';
        anims.push(
          el.animate(
            [
              { transform: 'scale(1)' },
              { transform: 'scale(1.09)', offset: 0.4 },
              { transform: 'scale(1)' },
            ],
            { duration: 340, easing },
          ),
        );
      }
    });

    // Animate moved chips
    svg.querySelectorAll<SVGGElement>('[data-chip-id]').forEach((el) => {
      const id = el.dataset.chipId!;
      const oldP = prevPos.chips.get(id);
      const newP = nextPos.chips.get(id);
      if (oldP && newP) {
        const dx = oldP.x - newP.x;
        const dy = oldP.y - newP.y;
        if (Math.hypot(dx, dy) > 2) {
          anims.push(
            el.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)` },
                { transform: 'translate(0px, 0px)' },
              ],
              { duration: 360, easing },
            ),
          );
        }
      } else if (!oldP) {
        anims.push(
          el.animate(
            [
              { opacity: 0, transform: 'translateY(-6px)' },
              { opacity: 1, transform: 'translateY(0px)' },
            ],
            { duration: 280, easing },
          ),
        );
      }
    });

    // Draw active edges like ink cascading top-to-bottom
    svg.querySelectorAll<SVGPathElement>('.tr-edge.is-active').forEach((path, idx) => {
      try {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        anims.push(
          path.animate(
            [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
            { duration: 300, delay: Math.min(idx * 85, 255), fill: 'backwards', easing },
          ),
        );
      } catch {
        // ignore if hidden
      }
    });

    // Draw active horizontal leaf links sequentially left-to-right (B+ range scan)
    svg.querySelectorAll<SVGLineElement>('.tr-leaf-link.is-active').forEach((ln, idx) => {
      try {
        const len = ln.getTotalLength();
        ln.style.strokeDasharray = `${len}`;
        anims.push(
          ln.animate(
            [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
            { duration: 280, delay: idx * 120, fill: 'backwards', easing },
          ),
        );
      } catch {
        // ignore
      }
    });

    // Animate curved transfers smoothly along arc
    svg.querySelectorAll<SVGPathElement>('.tr-transfer').forEach((path) => {
      anims.push(
        path.animate(
          [
            { opacity: 0, strokeDashoffset: '28' },
            { opacity: 1, strokeDashoffset: '0' },
          ],
          { duration: 380, easing },
        ),
      );
    });

    // Crisp entrance for floating tags & baseline
    svg.querySelectorAll<SVGGElement>('.tr-node-tag, .tr-baseline, .tr-brackets').forEach((g) => {
      anims.push(
        g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing }),
      );
    });
  }

  containerPositions.set(container, nextPos);
  containerAnims.set(container, anims);
  return svg;
}
