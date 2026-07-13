import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseFrontmatter } from "./assemble.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const paths = {
  root,
  patternsDir: join(root, "patterns"),
  metaDir: join(root, "patterns", "_meta"),
};

export function loadPatterns() {
  return readdirSync(paths.patternsDir)
    .filter((f) => /^pattern-\d+.*\.md$/.test(f))
    .map((file) => {
      const { meta, body } = parseFrontmatter(readFileSync(join(paths.patternsDir, file), "utf8"));
      return {
        pattern: Number(meta.pattern),
        layer: Number(meta.layer),
        title: meta.title,
        slug: meta.slug,
        file,
        body,
      };
    })
    .sort((a, b) => a.pattern - b.pattern);
}
