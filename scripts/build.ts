import { $ } from "bun";

const isDev = process.argv.includes("--dev");
const outdir = "./dist";

async function build() {
  console.log(`Building in ${isDev ? "development" : "production"} mode...`);

  // Clean and create dist
  await $`rm -rf ${outdir}`;
  await $`mkdir -p ${outdir}/content ${outdir}/popup ${outdir}/options ${outdir}/icons`;

  // Build background service worker
  await Bun.build({
    entrypoints: ["./src/background/index.ts"],
    outdir,
    target: "browser",
    format: "esm",
    minify: !isDev,
    sourcemap: isDev ? "linked" : "none",
    naming: "background.js",
  });

  // Build content script (IIFE for content scripts)
  const contentResult = await Bun.build({
    entrypoints: ["./src/content/index.ts"],
    outdir: `${outdir}/content`,
    target: "browser",
    format: "iife",
    minify: !isDev,
    sourcemap: isDev ? "linked" : "none",
    naming: "youtube.js",
  });

  if (!contentResult.success) {
    console.error("Content script build failed:", contentResult.logs);
    process.exit(1);
  }

  // Build popup
  await Bun.build({
    entrypoints: ["./src/popup/popup.ts"],
    outdir: `${outdir}/popup`,
    target: "browser",
    format: "esm",
    minify: !isDev,
    sourcemap: isDev ? "linked" : "none",
    naming: "popup.js",
  });

  // Build options
  await Bun.build({
    entrypoints: ["./src/options/options.ts"],
    outdir: `${outdir}/options`,
    target: "browser",
    format: "esm",
    minify: !isDev,
    sourcemap: isDev ? "linked" : "none",
    naming: "options.js",
  });

  // Copy static files
  await $`cp ./src/content/styles/youtube.css ${outdir}/content/`;
  await $`cp ./src/popup/popup.html ${outdir}/popup/`;
  await $`cp ./src/popup/popup.css ${outdir}/popup/`;
  await $`cp ./src/options/options.html ${outdir}/options/`;
  await $`cp ./src/options/options.css ${outdir}/options/`;

  // Generate icon sizes from source
  const sourceIcon = "./public/icons/i1024px.png";
  const iconSizes = [16, 32, 48, 128];

  if (await Bun.file(sourceIcon).exists()) {
    const sharp = (await import("sharp")).default;
    for (const size of iconSizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(`${outdir}/icons/icon-${size}.png`);
    }
    console.log("Icons generated!");
  }

  // Write manifest
  const manifest = {
    manifest_version: 3,
    name: "DeHook",
    version: "1.0.0",
    description: "Limit YouTube usage with password-protected settings",

    permissions: ["storage", "alarms", "scripting", "activeTab"],

    host_permissions: ["https://www.youtube.com/*", "https://youtube.com/*"],

    background: {
      service_worker: "background.js",
      type: "module",
    },

    content_scripts: [
      {
        matches: ["https://www.youtube.com/*", "https://youtube.com/*"],
        css: ["content/youtube.css"],
        js: ["content/youtube.js"],
        run_at: "document_start",
      },
    ],

    action: {
      default_popup: "popup/popup.html",
      default_icon: {
        "16": "icons/icon-16.png",
        "32": "icons/icon-32.png",
        "48": "icons/icon-48.png",
        "128": "icons/icon-128.png",
      },
    },

    options_page: "options/options.html",

    icons: {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png",
    },
  };

  await Bun.write(`${outdir}/manifest.json`, JSON.stringify(manifest, null, 2));

  console.log("Build complete!");
}

build();
