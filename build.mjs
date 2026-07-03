import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const skipNames = new Set(["dist", ".DS_Store", "node_modules", ".git", ".gemini", ".gitattributes", ".github", "package.json", "package-lock.json", "build.mjs"]);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const name of readdirSync(root)) {
  if (skipNames.has(name)) {
    continue;
  }

  const sourcePath = path.join(root, name);
  const targetPath = path.join(dist, name);
  const stats = statSync(sourcePath);

  if (stats.isDirectory()) {
    cpSync(sourcePath, targetPath, { recursive: true });
    continue;
  }

  cpSync(sourcePath, targetPath);
}

const fallbackConfigPath = path.join(root, "supabase-config.js");
const fallbackConfig = existsSync(fallbackConfigPath)
  ? readFileSync(fallbackConfigPath, "utf8")
  : 'export const SUPABASE_CONFIG = { url: "", anonKey: "" };\n';

const envUrl = process.env.SUPABASE_URL?.trim();
const envAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

if (envUrl && envAnonKey) {
  writeFileSync(
    path.join(dist, "supabase-config.js"),
    `export const SUPABASE_CONFIG = ${JSON.stringify({ url: envUrl, anonKey: envAnonKey }, null, 2)};\n`
  );
} else {
  writeFileSync(path.join(dist, "supabase-config.js"), fallbackConfig);
}
