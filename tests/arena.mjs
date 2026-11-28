import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const script = readFileSync(new URL('arena.browser.js', import.meta.url), 'utf8');
const directory = mkdtempSync(join(tmpdir(), 'tlbs-arena-'));
try {
  const fixture = join(directory, 'arena.html');
  writeFileSync(fixture, html.replace('<head>', '<head><base href="' + root.href + '">')
    .replace(/<script type="module"[^>]+><\/script>/, () => '<script>' + script + '</script>'));
  const result = execFileSync(process.env.TLBS_CHROMIUM || 'chromium', [
    '--headless', '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files',
    '--dump-dom', 'file://' + fixture
  ], {encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'ignore']});
  const report = /<pre id="arena-report">([^<]+)<\/pre>/.exec(result)?.[1];
  assert.ok(report?.startsWith('PASS'), report || 'Browser did not produce an arena report');
  console.log(report);
} finally {
  rmSync(directory, {recursive: true, force: true});
}
