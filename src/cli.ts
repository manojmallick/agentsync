#!/usr/bin/env node
import { Command } from "commander";
import {
  applyPlans,
  configExists,
  initConfig,
  loadConfig,
  planAll,
  printPlan,
} from "./logic/index.js";

const program = new Command();

program
  .name("agentsync")
  .description(
    "Generate and drift-check AGENTS.md / CLAUDE.md / skills / MCP config across repos (Terraform for agent context)",
  )
  .version("0.1.0");

program
  .command("init")
  .description("Create agentsync.config.json with starter profiles")
  .option("-C, --cwd <dir>", "working directory", process.cwd())
  .option("-f, --force", "overwrite existing config", false)
  .action(async (opts: { cwd: string; force: boolean }) => {
    try {
      const path = await initConfig(opts.cwd, opts.force);
      console.log(`Wrote ${path}`);
      console.log("Edit targets/vars, then run: agentsync generate");
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      process.exitCode = 1;
    }
  });

program
  .command("plan")
  .description("Show what would change (drift / create) without writing")
  .option("-C, --cwd <dir>", "working directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      await ensureConfig(opts.cwd);
      const config = await loadConfig(opts.cwd);
      const plans = await planAll(opts.cwd, config);
      printPlan(plans);
      if (!plans.every((p) => p.ok)) process.exitCode = 1;
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      process.exitCode = 1;
    }
  });

program
  .command("check")
  .description("Exit 1 if any managed file is missing or drifted")
  .option("-C, --cwd <dir>", "working directory", process.cwd())
  .option("--json", "print machine-readable JSON", false)
  .action(async (opts: { cwd: string; json: boolean }) => {
    try {
      await ensureConfig(opts.cwd);
      const config = await loadConfig(opts.cwd);
      const plans = await planAll(opts.cwd, config);
      if (opts.json) {
        console.log(
          JSON.stringify(
            {
              ok: plans.every((p) => p.ok),
              targets: plans.map((p) => ({
                target: p.target,
                profile: p.profile,
                ok: p.ok,
                files: p.files.map((f) => ({
                  file: f.relativeFile,
                  status: f.status,
                })),
              })),
            },
            null,
            2,
          ),
        );
      } else {
        printPlan(plans);
      }
      if (!plans.every((p) => p.ok)) process.exitCode = 1;
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      process.exitCode = 1;
    }
  });

program
  .command("generate")
  .alias("apply")
  .description("Write managed agent files to all targets")
  .option("-C, --cwd <dir>", "working directory", process.cwd())
  .option("-n, --dry-run", "print actions only", false)
  .action(async (opts: { cwd: string; dryRun: boolean }) => {
    try {
      await ensureConfig(opts.cwd);
      const config = await loadConfig(opts.cwd);
      const plans = await planAll(opts.cwd, config);
      printPlan(plans);
      const { written, skipped } = await applyPlans(plans, {
        dryRun: opts.dryRun,
      });
      console.log(
        opts.dryRun
          ? `\nDry run: would write ${written} file(s), skip ${skipped}`
          : `\nWrote ${written} file(s), skipped ${skipped} already in sync`,
      );
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      process.exitCode = 1;
    }
  });

program.parse();

async function ensureConfig(cwd: string): Promise<void> {
  if (!(await configExists(cwd))) {
    throw new Error(
      `No agentsync.config.json in ${cwd}. Run: agentsync init`,
    );
  }
}
