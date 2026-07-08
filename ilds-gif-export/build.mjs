import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, watch as fsWatch } from 'fs';

const watch = process.argv.includes('--watch');
mkdirSync('dist', { recursive: true });

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

const common = {
  bundle: true,
  target: 'es2017',
  format: 'iife',
  logLevel: 'info',
};

// Stamp version + build time into the bundle so the plugin can display exactly
// which build is loaded (guards against loading a stale dist/).
function buildDefines() {
  const stamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
  return {
    __PLUGIN_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(stamp),
  };
}

async function build() {
  const define = buildDefines();

  // 1. Sandbox code (no DOM). Written straight to dist/code.js.
  await esbuild.build({
    ...common,
    define,
    entryPoints: ['src/code.ts'],
    outfile: 'dist/code.js',
  });

  // 2. UI code bundled to an in-memory string, then inlined into ui.html.
  const res = await esbuild.build({
    ...common,
    define,
    entryPoints: ['src/ui.ts'],
    write: false,
  });
  const js = res.outputFiles[0].text;

  // Use a function replacer so `$` sequences in bundled code aren't treated
  // as special replacement patterns.
  const html = readFileSync('src/ui.html', 'utf8').replace('/*__UI_JS__*/', () => js);
  writeFileSync('dist/ui.html', html);

  console.log('Built dist/code.js and dist/ui.html');
}

await build();

if (watch) {
  console.log('Watching src/ for changes...');
  let timer = null;
  fsWatch('src', { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch((e) => console.error(e)), 120);
  });
}
