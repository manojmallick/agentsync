/** Tiny {{var}} template renderer — no dependency */

export function render(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    if (key in vars) return vars[key];
    return `{{${key}}}`;
  });
}

export function mergeVars(
  ...layers: Array<Record<string, string> | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const layer of layers) {
    if (!layer) continue;
    Object.assign(out, layer);
  }
  return out;
}
