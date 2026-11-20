export const FULL_PYTHON_SOURCE = `from __future__ import annotations
from bisect import bisect_left


class BTreeNode:
    def __init__(self, leaf=True):
        self.leaf = leaf
        self.keys: list[int] = []
        self.children: list[BTreeNode] = []


class BTree:
    # Slide 13 — khởi tạo và tìm kiếm
    def __init__(self, M: int):
        if M < 3:
            raise ValueError("M phải từ 3 trở lên")
        self.M = M
        self.max_keys = M - 1
        self.min_children = (M + 1) // 2
        self.min_keys = self.min_children - 1
        self.root = BTreeNode()

    def search(self, key: int, node=None):
        if node is None:
            node = self.root
        i = bisect_left(node.keys, key)
        if i < len(node.keys) and node.keys[i] == key:
            return node, i
        if node.leaf:
            return None
        return self.search(key, node.children[i])

    # Slide 14 — chèn từ lá rồi trả kết quả tách lên cha
    def insert(self, key: int) -> bool:
        if self.search(key) is not None:
            return False
        split = self._insert(self.root, key)
        if split is not None:
            middle, right = split
            root = BTreeNode(leaf=False)
            root.keys = [middle]
            root.children = [self.root, right]
            self.root = root
        return True

    def _insert(self, node, key):
        i = bisect_left(node.keys, key)
        if node.leaf:
            node.keys.insert(i, key)
        else:
            split = self._insert(node.children[i], key)
            if split is None:
                return None
            middle, right = split
            node.keys.insert(i, middle)
            node.children.insert(i + 1, right)
        if len(node.keys) <= self.max_keys:
            return None
        mid = len(node.keys) // 2
        middle = node.keys[mid]
        right = BTreeNode(leaf=node.leaf)
        right.keys = node.keys[mid + 1:]
        node.keys = node.keys[:mid]
        if not node.leaf:
            right.children = node.children[mid + 1:]
            node.children = node.children[:mid + 1]
        return middle, right

    # Slide 15 — xóa, tìm tiền nhiệm và kiểm tra gốc
    def delete(self, key: int) -> bool:
        deleted = self._delete(self.root, key)
        if not self.root.keys and not self.root.leaf:
            self.root = self.root.children[0]
        return deleted

    def _delete(self, node, key):
        i = bisect_left(node.keys, key)
        found = i < len(node.keys) and node.keys[i] == key
        if node.leaf:
            if found:
                node.keys.pop(i)
            return found
        if found:
            predecessor = node.children[i]
            while not predecessor.leaf:
                predecessor = predecessor.children[-1]
            key = predecessor.keys[-1]
            node.keys[i] = key
        deleted = self._delete(node.children[i], key)
        if deleted and len(node.children[i].keys) < self.min_keys:
            self._fix_underflow(node, i)
        return deleted

    # Slide 16 — mượn trái, mượn phải, rồi mới xét gộp
    def _fix_underflow(self, parent, i):
        child = parent.children[i]
        left = parent.children[i - 1] if i > 0 else None
        right = parent.children[i + 1] if i + 1 < len(parent.children) else None
        if left is not None and len(left.keys) > self.min_keys:
            child.keys.insert(0, parent.keys[i - 1])
            parent.keys[i - 1] = left.keys.pop()
            if not child.leaf:
                child.children.insert(0, left.children.pop())
            return
        if right is not None and len(right.keys) > self.min_keys:
            child.keys.append(parent.keys[i])
            parent.keys[i] = right.keys.pop(0)
            if not child.leaf:
                child.children.append(right.children.pop(0))
            return
        if right is None:
            i -= 1
        left, right = parent.children[i:i + 2]
        left.keys.append(parent.keys.pop(i))
        left.keys.extend(right.keys)
        if not left.leaf:
            left.children.extend(right.children)
        parent.children.pop(i + 1)`;

export const PYTHON_LINES = FULL_PYTHON_SOURCE.split('\n');

const PY_KEYWORDS = new Set([
  'from', 'import', 'class', 'def', 'if', 'else', 'elif', 'return',
  'while', 'and', 'or', 'not', 'is', 'None', 'True', 'False', 'raise',
]);

const PY_BUILTINS = new Set([
  'self', 'len', 'int', 'bool', 'list', 'ValueError', 'bisect_left',
  'BTreeNode', 'BTree',
]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function highlightPythonLine(rawLine: string): string {
  // Split comment outside strings
  let commentIdx = -1;
  let inQuote: string | null = null;
  for (let i = 0; i < rawLine.length; i++) {
    const ch = rawLine[i];
    if (inQuote) {
      if (ch === inQuote && rawLine[i - 1] !== '\\') inQuote = null;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === '#') {
      commentIdx = i;
      break;
    }
  }

  const codePart = commentIdx >= 0 ? rawLine.slice(0, commentIdx) : rawLine;
  const commentPart = commentIdx >= 0 ? rawLine.slice(commentIdx) : '';

  const tokenRegex = /("[^"]*"|'[^']*'|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+\b)/g;
  let out = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(codePart)) !== null) {
    out += escapeHtml(codePart.slice(lastIndex, match.index));
    const tok = match[0];
    if (tok.startsWith('"') || tok.startsWith("'")) {
      out += `<span class="py-str">${escapeHtml(tok)}</span>`;
    } else if (/^\d+$/.test(tok)) {
      out += `<span class="py-num">${tok}</span>`;
    } else if (PY_KEYWORDS.has(tok)) {
      out += `<span class="py-kw">${tok}</span>`;
    } else if (PY_BUILTINS.has(tok)) {
      out += `<span class="py-bi">${tok}</span>`;
    } else {
      out += escapeHtml(tok);
    }
    lastIndex = match.index + tok.length;
  }
  out += escapeHtml(codePart.slice(lastIndex));

  if (commentPart) {
    out += `<span class="py-cmt">${escapeHtml(commentPart)}</span>`;
  }
  return out || '&nbsp;';
}

export interface CodeBlockOptions {
  title: string;
  startLine: number; // 1-based inclusive
  endLine: number;   // 1-based inclusive
  highlightLines?: number[];
  compact?: boolean;
  zoomable?: boolean;
  blockId?: string;
}

export function renderPythonWindow(opts: CodeBlockOptions): string {
  const hl = new Set(opts.highlightLines ?? []);
  const linesHtml: string[] = [];
  for (let ln = opts.startLine; ln <= opts.endLine; ln++) {
    const raw = PYTHON_LINES[ln - 1] ?? '';
    const isHl = hl.has(ln);
    linesHtml.push(
      `<div class="code-line${isHl ? ' is-hl' : ''}" data-line="${ln}">` +
        `<span class="code-ln">${ln}</span>` +
        `<span class="code-txt">${highlightPythonLine(raw)}</span>` +
      `</div>`,
    );
  }
  const zoomAttr = opts.zoomable !== false
    ? ` data-zoom-code="true" data-zoom-title="${escapeHtml(opts.title)}" data-zoom-start="${opts.startLine}" data-zoom-end="${opts.endLine}"`
    : '';
  const idAttr = opts.blockId ? ` id="${opts.blockId}"` : '';
  return `
    <div class="code-win${opts.compact ? ' code-win--compact' : ''}"${idAttr}${zoomAttr} tabindex="${opts.zoomable !== false ? '0' : '-1'}" role="${opts.zoomable !== false ? 'button' : 'region'}" aria-label="Cửa sổ mã ${escapeHtml(opts.title)} (nhấn để phóng to)">
      <div class="code-win__bar">
        <span class="code-dots"><i></i><i></i><i></i></span>
        <span class="code-win__title">${escapeHtml(opts.title)}</span>
        ${opts.zoomable !== false ? '<span class="code-win__hint"><svg class="ui-ico-xs" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5 8.8 7.2M6.5 13.5h-4v-4M2.5 13.5l4.7-4.7"/></svg> Phóng to</span>' : ''}
      </div>
      <div class="code-win__body">${linesHtml.join('')}</div>
    </div>
  `;
}

export function updateCodeHighlight(container: Element | null, highlightLines: number[]): void {
  if (!container) return;
  const hl = new Set(highlightLines);
  container.querySelectorAll<HTMLElement>('.code-line').forEach((row) => {
    const ln = Number(row.dataset.line);
    row.classList.toggle('is-hl', hl.has(ln));
  });
}
