/** agentsync — source-of-truth agent context across repos */

export interface AgentsyncConfig {
  version: 1;
  /** Variables available in all templates */
  vars: Record<string, string>;
  /** Named file bundles */
  profiles: Record<string, Profile>;
  /** Repos (or folders) to keep in sync */
  targets: Target[];
}

export interface Profile {
  description?: string;
  files: Record<string, string>; // relative path → template body (with {{vars}})
}

export interface Target {
  /** Absolute or relative path to repo root */
  path: string;
  profile: string;
  /** Optional per-target var overrides */
  vars?: Record<string, string>;
}

export interface FilePlan {
  targetPath: string;
  relativeFile: string;
  expected: string;
  actual: string | null;
  status: "missing" | "match" | "drift" | "create";
}

export interface CheckResult {
  target: string;
  profile: string;
  files: FilePlan[];
  ok: boolean;
}
