import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { mergeVars, render } from "./render.js";
import type {
  AgentsyncConfig,
  CheckResult,
  FilePlan,
  Target,
} from "./types.js";

export async function planTarget(
  cwd: string,
  config: AgentsyncConfig,
  target: Target,
): Promise<CheckResult> {
  const profile = config.profiles[target.profile];
  if (!profile) {
    throw new Error(
      `Unknown profile "${target.profile}" for target ${target.path}`,
    );
  }

  const targetRoot = resolve(cwd, target.path);
  const vars = mergeVars(config.vars, target.vars, {
    project_name:
      target.vars?.project_name ||
      config.vars.project_name ||
      target.path.replace(/^\.\//, "") ||
      "app",
  });

  const files: FilePlan[] = [];
  for (const [rel, template] of Object.entries(profile.files)) {
    const expected = render(template, vars);
    const abs = resolve(targetRoot, rel);
    let actual: string | null = null;
    try {
      actual = await readFile(abs, "utf8");
    } catch {
      actual = null;
    }

    let status: FilePlan["status"];
    if (actual == null) status = "missing";
    else if (normalize(actual) === normalize(expected)) status = "match";
    else status = "drift";

    files.push({
      targetPath: abs,
      relativeFile: rel,
      expected,
      actual,
      status: actual == null ? "create" : status,
    });
  }

  return {
    target: target.path,
    profile: target.profile,
    files,
    ok: files.every((f) => f.status === "match"),
  };
}

export async function planAll(
  cwd: string,
  config: AgentsyncConfig,
): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  for (const t of config.targets) {
    out.push(await planTarget(cwd, config, t));
  }
  return out;
}

export async function applyPlans(
  plans: CheckResult[],
  opts?: { dryRun?: boolean },
): Promise<{ written: number; skipped: number }> {
  let written = 0;
  let skipped = 0;
  for (const plan of plans) {
    for (const f of plan.files) {
      if (f.status === "match") {
        skipped += 1;
        continue;
      }
      if (opts?.dryRun) {
        written += 1;
        continue;
      }
      await mkdir(dirname(f.targetPath), { recursive: true });
      await writeFile(f.targetPath, f.expected, "utf8");
      written += 1;
    }
  }
  return { written, skipped };
}

function normalize(s: string): string {
  return s.replace(/\r\n/g, "\n").trimEnd() + "\n";
}

export function printPlan(results: CheckResult[]): void {
  for (const r of results) {
    const icon = r.ok ? "✓" : "✗";
    console.log(`\n${icon} ${r.target}  [profile=${r.profile}]`);
    for (const f of r.files) {
      const mark =
        f.status === "match"
          ? "  match "
          : f.status === "create" || f.status === "missing"
            ? " CREATE "
            : " DRIFT  ";
      console.log(`  ${mark} ${f.relativeFile}`);
    }
  }
  const drifted = results.flatMap((r) =>
    r.files.filter((f) => f.status !== "match"),
  ).length;
  const matched = results.flatMap((r) =>
    r.files.filter((f) => f.status === "match"),
  ).length;
  console.log(
    `\n${results.length} target(s) · ${matched} in sync · ${drifted} to update`,
  );
}
