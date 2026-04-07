#!/usr/bin/env node
/**
 * TennisMeetup — Test & Record
 *
 * Records the iOS Simulator screen while running Maestro tests.
 * Properly manages subprocess lifecycle to avoid corrupted video files.
 *
 * Usage: node maestro/record.js
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RECORDINGS_DIR = path.join(__dirname, 'recordings');
const FLOW = path.join(__dirname, 'full_walkthrough.yaml');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const VIDEO = path.join(RECORDINGS_DIR, `walkthrough_${TIMESTAMP}.mov`);

// Ensure recordings dir exists
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

// Find booted simulator
function getBootedDevice() {
  try {
    const json = execSync('xcrun simctl list devices booted -j', { encoding: 'utf8' });
    const data = JSON.parse(json);
    for (const [, devices] of Object.entries(data.devices)) {
      for (const d of devices) {
        if (d.state === 'Booted') return d.udid;
      }
    }
  } catch {}
  return null;
}

// Find maestro binary
function findMaestro() {
  const paths = [
    path.join(process.env.HOME, '.maestro', 'bin', 'maestro'),
    '/usr/local/bin/maestro',
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  console.log('============================================');
  console.log('TennisMeetup — Test & Record');
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('============================================\n');

  const device = getBootedDevice();
  if (!device) {
    console.error('❌ No booted iOS Simulator. Run: open -a Simulator');
    process.exit(1);
  }

  const maestro = findMaestro();
  if (!maestro) {
    console.error('❌ Maestro not found. Install: curl -Ls https://get.maestro.mobile.dev | bash');
    process.exit(1);
  }

  console.log(`📱 Simulator: ${device}`);
  console.log(`🎬 Output: ${VIDEO}\n`);

  // Start screen recording
  console.log('🔴 Starting screen recording...');
  const recorder = spawn('xcrun', [
    'simctl', 'io', device, 'recordVideo', '--codec', 'h264', VIDEO
  ], { stdio: ['pipe', 'pipe', 'pipe'] });

  let recorderExited = false;
  recorder.on('exit', () => { recorderExited = true; });

  // Wait for recorder to initialize
  await sleep(2000);
  console.log('   Recording started\n');

  // Run Maestro test
  console.log('▶ Running walkthrough...\n');
  const testExitCode = await runMaestro(maestro, FLOW);
  console.log('');

  // Brief pause to capture final frame
  await sleep(1500);

  // Stop recording with SIGINT (proper termination)
  console.log('🛑 Stopping recording...');
  recorder.kill('SIGINT');

  // Wait for recorder to finalize the file (up to 10 seconds)
  const startWait = Date.now();
  while (!recorderExited && Date.now() - startWait < 10000) {
    await sleep(200);
  }
  await sleep(500);

  // Report results
  console.log('');
  console.log('============================================');

  if (testExitCode === 0) {
    console.log('✅ Walkthrough completed');
  } else {
    console.log('⚠️  Some steps skipped (recording still saved)');
  }

  if (fs.existsSync(VIDEO)) {
    const stats = fs.statSync(VIDEO);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`🎬 Video: ${VIDEO} (${sizeMB} MB)`);
  } else {
    console.log('❌ Recording file not found');
  }

  console.log('============================================');
}

function runMaestro(maestroBin, flowFile) {
  return new Promise((resolve) => {
    const proc = spawn(maestroBin, ['test', flowFile], {
      stdio: 'inherit',
      cwd: PROJECT_ROOT,
    });
    proc.on('exit', (code) => resolve(code ?? 1));
    proc.on('error', () => resolve(1));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
