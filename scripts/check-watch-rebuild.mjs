import { spawn, execFile } from 'node:child_process';
import { mkdtemp, utimes, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

// Compile with the real production watcher, then evaluate both exposed entries
// in a fresh runtime after each build. No existing dist output is touched.
const temporary = await mkdtemp(join(tmpdir(), 'user-management-watch-'));
const output = join(temporary, 'bundle');
const compiler = spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'build', '--watch',
  '--configuration=production', `--output-path=${output}`], { env: { ...process.env, FORCE_COLOR: '0' } });
let log = '';
let builds = 0;
let waiter;
let failure;
const exited = new Promise(resolve => compiler.once('exit', resolve));
const receive = chunk => {
  log += chunk.toString();
  const count = (log.match(/Build at:/g) ?? []).length;
  if (count > builds) { builds = count; waiter?.(); }
};
compiler.stdout.on('data', receive);
compiler.stderr.on('data', receive);
compiler.on('error', error => { failure = error; waiter?.(); });
compiler.on('exit', code => { failure = new Error(`Compiler exited (${code})`); waiter?.(); });
async function waitForBuild(count) {
  if (builds >= count) return;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for build ${count}\n${log.slice(-6000)}`)), 120_000);
    waiter = () => { if (failure || builds >= count) { clearTimeout(timeout); waiter = undefined; failure ? reject(failure) : resolve(); } };
    waiter();
  });
}
try {
  for (let cycle = 1; cycle <= 3; cycle++) {
    await waitForBuild(cycle);
    const { stdout } = await promisify(execFile)(process.execPath, ['testing/build/check-federation.cjs', output]);
    console.log(`Production watch build ${cycle}: ${stdout.trim().replaceAll('\n', '; ')}`);
    if (cycle < 3) {
      // Trigger independent Angular compilation paths without changing content.
      const file = cycle === 1 ? 'src/app/features/user-management/pages/catalog/user-metadata.ts' : 'src/app/features/user-management/components/user-metadata-header.ts';
      const now = new Date(); await utimes(file, now, now);
    }
  }
} catch (error) {
  console.error(error); process.exitCode = 1;
} finally {
  compiler.kill('SIGTERM');
  await exited;
  await rm(temporary, { recursive: true, force: true });
}
