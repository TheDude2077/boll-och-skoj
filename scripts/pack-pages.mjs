import {
  cpSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const BASE = "/boll-och-skoj";
const out = join(process.cwd(), "pages-dist");
const candidates = [
  join(process.cwd(), ".vercel/output/static"),
  join(process.cwd(), "dist"),
  join(process.cwd(), ".output/public"),
];

const src = candidates.find((dir) => existsSync(dir));
if (!src) {
  console.error("pack-pages: no static output found. Looked in:");
  for (const dir of candidates) console.error(" -", dir);
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(src, out, { recursive: true });
writeFileSync(join(out, ".nojekyll"), "");

const shell = join(out, "_shell.html");
const index = join(out, "index.html");
if (existsSync(shell)) {
  copyFileSync(shell, index);
} else if (!existsSync(index)) {
  console.error("pack-pages: no index.html or _shell.html in", src);
  console.error(readdirSync(src).join("\n"));
  process.exit(1);
}

function rewriteHtml(file) {
  if (!existsSync(file)) return;
  const html = readFileSync(file, "utf8");
  const next = html.replaceAll('"/__grok/', `"${BASE}/__grok/`).replaceAll("'/__grok/", `'${BASE}/__grok/`);
  if (next !== html) writeFileSync(file, next);
}

for (const name of ["index.html", "404.html", "_shell.html"]) {
  rewriteHtml(join(out, name));
}

copyFileSync(index, join(out, "404.html"));

const grokDir = join(out, "__grok");
mkdirSync(grokDir, { recursive: true });
writeFileSync(
  join(grokDir, "manifest.webmanifest"),
  JSON.stringify(
    {
      name: "Boll & Skoj",
      short_name: "Boll & Skoj",
      id: `${BASE}/`,
      start_url: `${BASE}/`,
      scope: `${BASE}/`,
      display: "standalone",
      background_color: "#0b0c10",
      theme_color: "#0b0c10",
      icons: [
        {
          src: `${BASE}/__grok/icon-180.png`,
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    null,
    2,
  ),
);

console.log("pack-pages: copied", src, "->", out);
