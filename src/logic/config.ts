import { readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultConfig } from "./templates.js";
import type { AgentsyncConfig } from "./types.js";

export const CONFIG_NAME = "agentsync.config.json";

export async function configExists(cwd: string): Promise<boolean> {
  try {
    await access(resolve(cwd, CONFIG_NAME));
    return true;
  } catch {
    return false;
  }
}

export async function loadConfig(cwd: string): Promise<AgentsyncConfig> {
  const path = resolve(cwd, CONFIG_NAME);
  const raw = await readFile(path, "utf8");
  const data = JSON.parse(raw) as AgentsyncConfig;
  if (data.version !== 1) {
    throw new Error(`Unsupported config version: ${String(data.version)}`);
  }
  if (!data.profiles || !data.targets) {
    throw new Error("Config must include profiles and targets");
  }
  return data;
}

export async function writeConfig(
  cwd: string,
  config: AgentsyncConfig,
): Promise<string> {
  const path = resolve(cwd, CONFIG_NAME);
  await writeFile(path, JSON.stringify(config, null, 2) + "\n", "utf8");
  return path;
}

export async function initConfig(cwd: string, force = false): Promise<string> {
  if ((await configExists(cwd)) && !force) {
    throw new Error(
      `${CONFIG_NAME} already exists (use --force to overwrite)`,
    );
  }
  return writeConfig(cwd, defaultConfig());
}
