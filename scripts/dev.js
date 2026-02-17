const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 3000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function killPort() {
  console.log(`Checking for processes on port ${PORT}...`);

  // Get all processes using the port
  let output;
  try {
    output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
  } catch (e) {
    // No process found
    console.log('Port is free');
    return;
  }

  // Extract PIDs
  const pids = new Set();
  const lines = output.split('\n').filter(line => line.includes('LISTENING'));
  for (const line of lines) {
    const match = line.trim().match(/LISTENING\s+(\d+)/);
    if (match) {
      pids.add(parseInt(match[1]));
    }
  }

  // Kill each process
  for (const pid of pids) {
    try {
      const processInfo = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8' });
      if (processInfo.includes('node.exe')) {
        console.log(`Killing node process ${pid} on port ${PORT}...`);
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
      }
    } catch (e) {
      // Process may have already exited
    }
  }

  // Wait for port to be released
  await sleep(1000);

  // Remove lock file
  const lockFile = path.join(__dirname, '..', '.next', 'dev', 'lock');
  if (fs.existsSync(lockFile)) {
    console.log('Removing stale lock file...');
    fs.unlinkSync(lockFile);
  }
}

async function startDev() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  if (force) {
    await killPort();
  } else {
    // Check if port is in use
    try {
      execSync(`netstat -ano | findstr :${PORT}`, { stdio: 'pipe' });
      console.log(`Port ${PORT} is in use, attempting to free it...`);
      await killPort();
    } catch (e) {
      console.log(`Port ${PORT} is free`);
    }
  }

  console.log(`Starting Next.js dev server on port ${PORT}...`);

  const nextProcess = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '-p', PORT.toString()], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  nextProcess.on('close', (code) => {
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    nextProcess.kill('SIGINT');
    process.exit(0);
  });
}

startDev().catch(console.error);
