import assert from "node:assert";
import test, { describe } from "node:test";
import { render, mergeVars } from "./render.js";
import { defaultConfig } from "./templates.js";
import { planAll } from "./plan.js";

describe("agentsync Template & Plan Logic", () => {
  test("renders template variables correctly", () => {
    const tmpl = "Hello {{name}}, welcome to {{org}}!";
    const res = render(tmpl, { name: "Alice", org: "Acme Corp" });
    assert.strictEqual(res, "Hello Alice, welcome to Acme Corp!");
  });

  test("leaves unrendered placeholders intact", () => {
    const tmpl = "Hello {{name}}, missing {{unknown_var}}";
    const res = render(tmpl, { name: "Bob" });
    assert.strictEqual(res, "Hello Bob, missing {{unknown_var}}");
  });

  test("merges variable layers with right-side precedence", () => {
    const layer1 = { org: "Acme", stack: "Node" };
    const layer2 = { stack: "TypeScript", project: "Dashboard" };
    const merged = mergeVars(layer1, layer2);

    assert.strictEqual(merged.org, "Acme");
    assert.strictEqual(merged.stack, "TypeScript");
    assert.strictEqual(merged.project, "Dashboard");
  });

  test("generates valid default config with starter profiles", () => {
    const config = defaultConfig();
    assert.strictEqual(config.version, 1);
    assert.ok(config.profiles.default);
    assert.ok(config.profiles.default.files["AGENTS.md"]);
    assert.strictEqual(config.targets.length, 1);
  });

  test("computes plan actions for config targets", async () => {
    const config = defaultConfig();
    const plans = await planAll("/tmp", config);
    assert.strictEqual(plans.length, 1);
    assert.ok(plans[0].files.length > 0);
  });
});
