import fs from "node:fs";
import { execFileSync } from "node:child_process";

// Check exact local secret values against staged source without printing them.
const envPath = ".env.local";
const keys = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split(/\r?\n/).flatMap(line => {
  const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
  if (!match || !/(KEY|SECRET|TOKEN|PASSWORD)/.test(match[1])) return [];
  const value = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  return value.length >= 16 ? [value] : [];
}) : [];
const files = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM", "-z"]).toString().split("\0").filter(Boolean);
let leaked = false;
for (const file of files) {
  const content = execFileSync("git", ["show", `:${file}`]);
  if (keys.some(key => content.includes(Buffer.from(key)))) { console.error(`Sensitive value found in staged file: ${file}`); leaked = true; }
}
if (leaked) process.exitCode = 1;
else console.log(`Checked ${files.length} staged files; no exact local secret values detected.`);
