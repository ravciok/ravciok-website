import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createMermaidRenderer } from "mermaid-isomorphic";

const POSTS_DIR = join(process.cwd(), "src/content/posts");
const DIAGRAMS_DIR = join(process.cwd(), "src/content/diagrams");

type Theme = "light" | "dark";
const THEMES: Theme[] = ["light", "dark"];

const NODE_CSS = [
  ".node rect, .node polygon { rx: 0.5rem; ry: 0.5rem; stroke: none; }",
  ".cluster rect { rx: 0.5rem; ry: 0.5rem; }",
].join(" ");

const MERMAID_CONFIG: Record<Theme, Record<string, unknown>> = {
  light: {
    theme: "base",
    themeVariables: {
      primaryColor: "#eff1f5",
      primaryBorderColor: "#bcc0cc",
      primaryTextColor: "#4c4f69",
      lineColor: "#6c6f85",
      edgeLabelBackground: "#ffffff",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    themeCSS: NODE_CSS,
    securityLevel: "loose",
  },
  dark: {
    theme: "base",
    themeVariables: {
      primaryColor: "#303446",
      primaryBorderColor: "#51576d",
      primaryTextColor: "#c6d0f5",
      lineColor: "#a5adce",
      edgeLabelBackground: "#282a36",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    themeCSS: NODE_CSS,
    securityLevel: "loose",
  },
};

const FENCE_RE = /^```mermaid\n([\s\S]*?)\n```/gm;

interface Block {
  slug: string;
  index: number;
  source: string;
  hash: string;
}

function sha1(s: string): string {
  return createHash("sha1").update(s).digest("hex").slice(0, 12);
}

function diagramPath(slug: string, index: number, theme: Theme): string {
  return join(DIAGRAMS_DIR, `${slug}-${index}-${theme}.svg`);
}

function extractHash(svg: string): string | null {
  const m = svg.match(/<!-- src-hash: ([a-f0-9]+) -->/);
  return m ? m[1] : null;
}

async function collectBlocks(): Promise<Block[]> {
  const files = (await readdir(POSTS_DIR)).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_"),
  );
  const blocks: Block[] = [];
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const raw = await readFile(join(POSTS_DIR, f), "utf8");
    let index = 0;
    FENCE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = FENCE_RE.exec(raw)) !== null) {
      const source = m[1];
      blocks.push({ slug, index, source, hash: sha1(source) });
      index += 1;
    }
  }
  return blocks;
}

async function shouldRender(block: Block, theme: Theme, force: boolean): Promise<boolean> {
  if (force) return true;
  try {
    const existing = await readFile(diagramPath(block.slug, block.index, theme), "utf8");
    return extractHash(existing) !== block.hash;
  } catch {
    return true;
  }
}

async function planWork(blocks: Block[], force: boolean): Promise<Map<Theme, Block[]>> {
  const work = new Map<Theme, Block[]>();
  for (const theme of THEMES) work.set(theme, []);
  for (const block of blocks) {
    for (const theme of THEMES) {
      if (await shouldRender(block, theme, force)) {
        work.get(theme)!.push(block);
      }
    }
  }
  return work;
}

async function renderBatch(blocks: Block[], theme: Theme): Promise<void> {
  if (blocks.length === 0) return;
  const render = createMermaidRenderer();
  const results = await render(
    blocks.map((b) => b.source),
    { mermaidConfig: MERMAID_CONFIG[theme] },
  );
  for (let i = 0; i < results.length; i += 1) {
    const r = results[i];
    const block = blocks[i];
    if (r.status === "rejected") {
      throw new Error(
        `mermaid render failed for ${block.slug}#${block.index} (${theme}): ${String(r.reason)}`,
      );
    }
    const svgWithHash = r.value.svg.replace(
      /<svg /,
      `<svg data-theme="${theme}" `,
    ).replace(/(<\/svg>\s*)$/, `<!-- src-hash: ${block.hash} -->$1`);
    await writeFile(diagramPath(block.slug, block.index, theme), svgWithHash);
    console.log(`rendered ${block.slug}#${block.index} (${theme})`);
  }
}

async function sweepOrphans(blocks: Block[]): Promise<void> {
  const expected = new Set<string>();
  for (const block of blocks) {
    for (const theme of THEMES) {
      expected.add(`${block.slug}-${block.index}-${theme}.svg`);
    }
  }
  let existing: string[];
  try {
    existing = await readdir(DIAGRAMS_DIR);
  } catch {
    return;
  }
  for (const f of existing) {
    if (!f.endsWith(".svg")) continue;
    if (expected.has(f)) continue;
    await rm(join(DIAGRAMS_DIR, f));
    console.log(`removed orphan ${f}`);
  }
}

const force = process.argv.includes("--force");

await mkdir(DIAGRAMS_DIR, { recursive: true });
const blocks = await collectBlocks();
console.log(`found ${blocks.length} mermaid block(s) across posts`);

const work = await planWork(blocks, force);
const lightCount = work.get("light")!.length;
const darkCount = work.get("dark")!.length;
console.log(`work: ${lightCount} light + ${darkCount} dark to render`);

for (const theme of THEMES) {
  await renderBatch(work.get(theme)!, theme);
}

await sweepOrphans(blocks);
console.log("done");
