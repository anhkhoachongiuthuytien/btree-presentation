import katex from 'katex';

export function texInline(tex: string): string {
  return katex.renderToString(tex, {
    throwOnError: false,
    displayMode: false,
    strict: false,
  });
}

export function texBlock(tex: string): string {
  return katex.renderToString(tex, {
    throwOnError: false,
    displayMode: true,
    strict: false,
  });
}
