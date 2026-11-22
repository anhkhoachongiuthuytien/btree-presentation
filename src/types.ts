export type SlideTheme =
  | 'cover'
  | 'toc'
  | 'blue'
  | 'white'
  | 'xfs-blue'
  | 'chapter';

export type TransitionKind =
  | 'open-chapter'
  | 'iris-bloom'
  | 'cube-turn'
  | 'split-curtain'
  | 'vertical-lift'
  | 'diagonal-wipe'
  | 'page-peel'
  | 'connect-shape'
  | 'swap-example';

export interface TransitionSpec {
  from: number; // 1-based slide number
  to: number;
  kind: TransitionKind;
  label: string;
  description: string;
}

export interface FullViewSection {
  heading: string;
  bodyHtml: string;
}

export interface FullViewContent {
  summary: string;
  sections: FullViewSection[];
  formulas?: { label: string; tex: string }[];
  codeSlice?: { title: string; startLine: number; endLine: number };
  references?: { label: string; url: string }[];
}

export interface SlideContext {
  slideEl: HTMLElement;
  goToSlide: (slideNumber: number) => void;
  openCodeZoom: (title: string, startLine: number, endLine: number, highlightLines?: number[]) => void;
  getReducedMotion: () => boolean;
}

export interface SlideDef {
  number: number; // 1..29
  title: string;
  chapter: string;
  chapterStart?: number; // 3, 6, 13, 17, 22
  theme: SlideTheme;
  /** Number of click steps AFTER step 0 (so total states = stepCount + 1) */
  stepCount: number;
  /** Speaker notes: Lời dẫn + Lời thuyết trình đầy đủ */
  leadIn: string;
  fullScript: string;
  /** Structured reading panel for "Xem đầy đủ" */
  fullView: FullViewContent;
  /** Build static skeleton DOM for the slide inside slideEl */
  mount: (ctx: SlideContext) => void;
  /** Render/animate slide to exact step index (0..stepCount) from prevStep */
  renderStep: (step: number, prevStep: number | null, ctx: SlideContext) => void;
  /** Optional cleanup / cancel running animations */
  cancelAnimations?: (slideEl: HTMLElement) => void;
}

export type KeyTone =
  | 'default'
  | 'active'     // yellow double border — key currently considered
  | 'success'    // emerald green — found / completed result
  | 'error'      // red dashed — overflow / underflow / deleted
  | 'muted'      // dimmed
  | 'guide'      // B+ internal routing key
  | 'record'     // B+ leaf key with attached record
  | 'empty';     // visible empty slot (dashed)

export interface TreeKeySpec {
  /** Persistent ID across steps (e.g. 'k-25-leaf', 'k-25-guide', 'k-65') */
  id: string;
  label: string;
  tone?: KeyTone;
  sublabel?: string;
  badge?: string;
  clickable?: boolean;
  dataAttr?: string;
}

export interface TreeNodeSpec {
  id: string;
  /** Explicit x, y center coordinates in the SVG viewBox */
  x: number;
  y: number;
  keys: TreeKeySpec[];
  /** Number of total slots if fixed capacity should be shown (e.g. B* tree 6 slots) */
  capacity?: number;
  /** Node-level state */
  state?: 'normal' | 'active' | 'overflow' | 'underflow' | 'success' | 'muted' | 'empty-root' | 'highlight-box';
  /** Floating label above/below node */
  tag?: string;
  tagPos?: 'top' | 'bottom' | 'left' | 'right';
  tagTone?: 'default' | 'cobalt' | 'error' | 'success' | 'warn';
  /** Custom cell width override */
  cellW?: number;
  cellH?: number;
  /** Whether to show child port dots */
  showPorts?: boolean;
  /** B+ leaf record note below */
  recordNote?: string;
  /** Opacity override */
  opacity?: number;
}

export interface TreeEdgeSpec {
  /** Persistent ID tied to child node (e.g. 'e-root-c2') */
  id: string;
  fromNode: string;
  /** Child port index: 0..keys.length */
  portIndex: number;
  toNode: string;
  state?: 'normal' | 'active' | 'muted' | 'error' | 'dashed';
  label?: string;
  arrow?: boolean;
}

export interface LeafLinkSpec {
  id: string;
  fromNode: string;
  toNode: string;
  active?: boolean;
  label?: string;
}

export interface CurvedTransferSpec {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  ctrlX: number;
  ctrlY: number;
  label?: string;
  tone?: 'cobalt' | 'warn' | 'success' | 'error';
}

export interface FloatingChipSpec {
  id: string;
  x: number;
  y: number;
  text: string;
  tone?: 'active' | 'cobalt' | 'success' | 'error' | 'neutral';
}

export interface TreeSceneSpec {
  viewBox: [number, number, number, number];
  nodes: TreeNodeSpec[];
  edges: TreeEdgeSpec[];
  leafLinks?: LeafLinkSpec[];
  transfers?: CurvedTransferSpec[];
  chips?: FloatingChipSpec[];
  /** Optional horizontal guide line (e.g. equal leaf depth line) */
  baselineY?: { y: number; x1: number; x2: number; label?: string };
  /** Optional bracket under/over a range */
  brackets?: { x1: number; x2: number; y: number; dir: 'down' | 'up'; label: string; tone?: 'cobalt' | 'error' | 'success' }[];
  /** Optional custom raw SVG overlay string placed under or over */
  underlaySvg?: string;
  overlaySvg?: string;
}
