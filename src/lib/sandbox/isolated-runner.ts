import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ExecutionResult,
  SandboxLimits,
  SupportedLanguage,
  TestCase,
  TestCaseResult,
} from './types';

// Detect if prlimit is available on this system
let hasPrlimitCached: boolean | null = null;
function isPrlimitAvailable(): boolean {
  if (hasPrlimitCached !== null) return hasPrlimitCached;
  try {
    hasPrlimitCached = fs.existsSync('/usr/bin/prlimit');
  } catch {
    hasPrlimitCached = false;
  }
  return hasPrlimitCached;
}

// Detect if bubblewrap (bwrap) is available for real namespace/filesystem isolation
let hasBwrapCached: boolean | null = null;
function isBwrapAvailable(): boolean {
  if (hasBwrapCached !== null) return hasBwrapCached;
  try {
    hasBwrapCached = fs.existsSync('/usr/bin/bwrap');
  } catch {
    hasBwrapCached = false;
  }
  return hasBwrapCached;
}

interface ProcessOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  timedOut: boolean;
  truncated: boolean;
}

/**
 * Runs a single process inside a strictly restricted resource sandbox.
 * Enforces:
 * 1. Bubblewrap (bwrap) unprivileged container isolation:
 *    - Unshares mount, PID, IPC, UTS, and user namespaces (--unshare-all)
 *    - Drops network access completely (--unshare-net)
 *    - Mounts only read-only system binaries (/usr, /lib, /lib64, /bin)
 *    - NO access to /home, application source, or .env host secrets
 * 2. Linux kernel resource limits via prlimit:
 *    - CPU time cap (5s)
 *    - Virtual memory address space cap (256 MB)
 *    - Process/thread count cap (64, prevents fork bombs)
 *    - File size cap (10 MB, prevents disk exhaustion)
 * 3. Process-group isolation with SIGKILL subtree termination on timeout.
 * 4. Output stream truncation at maxOutputBytes (64 KB).
 */
function runSandboxedProcess(
  cmd: string,
  args: string[],
  stdinData: string,
  limits: SandboxLimits,
  cwd: string
): Promise<ProcessOutput> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let timedOut = false;
    let truncated = false;
    let stdout = '';
    let stderr = '';

    // Sanitized, minimal environment — untrusted code cannot read host secrets!
    const sanitizedEnv: NodeJS.ProcessEnv = {
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
      HOME: cwd,
      TMPDIR: cwd,
      PYTHONUNBUFFERED: '1',
      NODE_ENV: 'production',
    };

    let innerCmd = cmd;
    let innerArgs = args;

    // Layer 1: Bubblewrap namespace & network isolation
    if (isBwrapAvailable()) {
      innerCmd = '/usr/bin/bwrap';
      innerArgs = [
        '--ro-bind', '/usr', '/usr',
        '--ro-bind', '/lib', '/lib',
        '--ro-bind', '/lib64', '/lib64',
        '--ro-bind', '/bin', '/bin',
        '--ro-bind', '/etc/alternatives', '/etc/alternatives',
        '--proc', '/proc',
        '--dev', '/dev',
        // bwrap's minimal /dev has no stdio symlinks; without these, the
        // idiomatic `fs.readFileSync('/dev/stdin')` fails with ENXIO.
        '--symlink', '/proc/self/fd/0', '/dev/stdin',
        '--symlink', '/proc/self/fd/1', '/dev/stdout',
        '--symlink', '/proc/self/fd/2', '/dev/stderr',
        '--symlink', '/proc/self/fd', '/dev/fd',
        '--bind', cwd, cwd,
        '--unshare-all',
        '--unshare-net',
        '--die-with-parent',
        cmd,
        ...args,
      ];
    }

    // Layer 2: Linux kernel prlimit resource caps
    let spawnCmd = innerCmd;
    let spawnArgs = innerArgs;

    if (isPrlimitAvailable()) {
      const cpuLimitSec = Math.max(1, Math.ceil(limits.timeoutMs / 1000));
      spawnCmd = '/usr/bin/prlimit';
      spawnArgs = [
        `--cpu=${cpuLimitSec}:${cpuLimitSec + 1}`,
        `--as=${limits.maxMemoryBytes}`,
        `--nproc=${limits.maxProcesses}`,
        `--fsize=${limits.maxDiskBytes}`,
        '--core=0',
        innerCmd,
        ...innerArgs,
      ];
    }

    // Feed stdin from a regular file, not a pipe/socketpair. Node's spawn
    // stdio uses socketpairs, and a socket fd cannot be re-opened by path,
    // so `fs.readFileSync('/dev/stdin')` inside the sandbox died with ENXIO.
    // A file-backed fd 0 can be re-opened via /proc/self/fd/0 and behaves
    // identically for ordinary sequential stdin reads.
    const stdinPath = path.join(
      cwd,
      `.stdin-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );
    let stdinFd: number | null = null;
    try {
      fs.writeFileSync(stdinPath, stdinData ?? '');
      stdinFd = fs.openSync(stdinPath, 'r');
    } catch {
      stdinFd = null;
    }

    const child = spawn(spawnCmd, spawnArgs, {
      cwd,
      env: sanitizedEnv,
      detached: true, // Create a new process group for clean subtree termination
      stdio: [stdinFd ?? 'pipe', 'pipe', 'pipe'],
    });
    if (stdinFd !== null) {
      try { fs.closeSync(stdinFd); } catch {}
    }

    // Timeout guard with process-group kill
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (child.pid) {
          // Negative PID kills the entire process group (including child forks)
          process.kill(-child.pid, 'SIGKILL');
        }
      } catch {
        try {
          child.kill('SIGKILL');
        } catch {}
      }
    }, limits.timeoutMs);

    // stdin comes from stdinPath's fd (see above). Only if creating that
    // file failed do we fall back to writing to the pipe.
    if (stdinFd === null && child.stdin) {
      try {
        if (stdinData) child.stdin.write(stdinData);
        child.stdin.end();
      } catch {}
    }
    const cleanupStdin = () => {
      try { fs.unlinkSync(stdinPath); } catch {}
    };

    child.stdout!.on('data', (chunk) => {
      if (stdout.length + chunk.length <= limits.maxOutputBytes) {
        stdout += chunk.toString();
      } else if (!truncated) {
        truncated = true;
        const remaining = limits.maxOutputBytes - stdout.length;
        if (remaining > 0) {
          stdout += chunk.toString().substring(0, remaining);
        }
        stdout += '\n[Code Nexus Sandbox: Output truncated at 64KB limit]';
      }
    });

    child.stderr!.on('data', (chunk) => {
      if (stderr.length + chunk.length <= limits.maxOutputBytes) {
        stderr += chunk.toString();
      } else if (!truncated) {
        truncated = true;
        const remaining = limits.maxOutputBytes - stderr.length;
        if (remaining > 0) {
          stderr += chunk.toString().substring(0, remaining);
        }
        stderr += '\n[Code Nexus Sandbox: Error output truncated at 64KB limit]';
      }
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      cleanupStdin();
      const executionTimeMs = Date.now() - startTime;
      resolve({
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
        exitCode: code ?? (timedOut ? 124 : 1),
        executionTimeMs,
        timedOut,
        truncated,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: (stderr ? stderr + '\n' : '') + err.message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        timedOut: false,
        truncated,
      });
    });
  });
}

/**
 * Isolated local sandbox execution engine.
 */
export async function executeIsolated(
  language: string,
  code: string,
  testCases: TestCase[] = [],
  limits: SandboxLimits
): Promise<ExecutionResult> {
  // CRITICAL SECURITY GUARD: both namespace isolation and kernel resource
  // limits are mandatory. Never degrade to a merely timeout-wrapped process.
  if (!isBwrapAvailable() || !isPrlimitAvailable()) {
    return {
      stdout: '',
      stderr:
        'UNTRUSTED CODE EXECUTION DISABLED: bubblewrap namespace isolation and prlimit resource limits are both required on this server host. Please configure CODE_RUNNER_MODE=external with CODE_EXECUTION_SERVICE_URL or install both tools.',
      exitCode: 1,
      executionTimeMs: 0,
      status: 'Configuration Error',
      sandboxMode: 'sandboxed_local',
    };
  }

  // 1. Language validation
  const normalizedLang = language.toLowerCase().trim() as SupportedLanguage;
  const validLanguages: SupportedLanguage[] = ['python', 'c', 'cpp', 'java', 'javascript', 'sql'];

  // Aliases
  let targetLang = normalizedLang;
  if ((normalizedLang as string) === 'py') targetLang = 'python';
  if ((normalizedLang as string) === 'c++') targetLang = 'cpp';
  if ((normalizedLang as string) === 'js') targetLang = 'javascript';

  if (!validLanguages.includes(targetLang)) {
    return {
      stdout: '',
      stderr: `Unsupported execution language: "${language}". Supported runtimes are: ${validLanguages.join(', ')}.`,
      exitCode: 1,
      executionTimeMs: 0,
      status: 'Runtime Error',
      sandboxMode: 'sandboxed_local',
    };
  }

  // 2. Code length validation
  if (code.length > limits.maxCodeLength) {
    return {
      stdout: '',
      stderr: `Submitted code exceeds maximum permitted length (${limits.maxCodeLength} bytes).`,
      exitCode: 1,
      executionTimeMs: 0,
      status: 'Runtime Error',
      sandboxMode: 'sandboxed_local',
    };
  }

  // 3. Isolated temp directory with restricted permissions (mode 0700)
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codenexus_sandbox_'));
  try {
    fs.chmodSync(tempDir, 0o700);
  } catch {}

  try {
    let compileCmd = '';
    let compileArgs: string[] = [];
    let runCmd = '';
    let runArgs: string[] = [];
    let isCompiled = false;

    if (targetLang === 'python') {
      const srcFile = path.join(tempDir, 'solution.py');
      fs.writeFileSync(srcFile, code, { mode: 0o600 });
      runCmd = '/usr/local/bin/python3';
      if (!fs.existsSync(runCmd)) runCmd = '/usr/bin/python3';
      runArgs = [srcFile];
    } else if (targetLang === 'c') {
      const srcFile = path.join(tempDir, 'solution.c');
      const binFile = path.join(tempDir, 'solution.out');
      fs.writeFileSync(srcFile, code, { mode: 0o600 });
      compileCmd = '/usr/bin/gcc';
      compileArgs = ['-O2', srcFile, '-o', binFile, '-lm'];
      runCmd = binFile;
      runArgs = [];
      isCompiled = true;
    } else if (targetLang === 'cpp') {
      const srcFile = path.join(tempDir, 'solution.cpp');
      const binFile = path.join(tempDir, 'solution.out');
      fs.writeFileSync(srcFile, code, { mode: 0o600 });
      compileCmd = '/usr/bin/g++';
      compileArgs = ['-O2', '-std=c++17', srcFile, '-o', binFile];
      runCmd = binFile;
      runArgs = [];
      isCompiled = true;
    } else if (targetLang === 'java') {
      const javaCode = code;
      const classMatch = javaCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      let className = 'Main';
      if (classMatch && classMatch[1]) {
        className = classMatch[1];
      }
      const srcFile = path.join(tempDir, `${className}.java`);
      fs.writeFileSync(srcFile, javaCode, { mode: 0o600 });
      compileCmd = '/usr/bin/javac';
      compileArgs = [srcFile];
      runCmd = '/usr/bin/java';
      runArgs = ['-Xmx128m', '-cp', tempDir, className];
      isCompiled = true;
    } else if (targetLang === 'javascript') {
      const srcFile = path.join(tempDir, 'solution.js');
      fs.writeFileSync(srcFile, code, { mode: 0o600 });
      runCmd = '/usr/bin/node';
      runArgs = ['--max-old-space-size=128', srcFile];
    } else if (targetLang === 'sql') {
      // Sandboxed SQLite memory database
      const dbFile = path.join(tempDir, 'sandbox.db');
      runCmd = '/usr/bin/sqlite3';
      runArgs = [dbFile];
    }

    // Dynamic address space scaling based on runtime memory requirements
    // Note: Node.js (V8) and OpenJDK JVM require 64-bit sparse address space mappings
    // while actual heap sizes are strictly bounded above (-Xmx128m and --max-old-space-size=128).
    const runtimeLimits = { ...limits };
    if (targetLang === 'javascript') {
      runtimeLimits.maxMemoryBytes = Math.max(runtimeLimits.maxMemoryBytes, 1024 * 1024 * 1024);
    } else if (targetLang === 'java') {
      runtimeLimits.maxMemoryBytes = Math.max(runtimeLimits.maxMemoryBytes, 3072 * 1024 * 1024);
    }

    // --- STEP 1: COMPILATION (if applicable) ---
    if (isCompiled) {
      const compileLimits = { ...runtimeLimits, timeoutMs: 8000 };
      const compileRes = await runSandboxedProcess(compileCmd, compileArgs, '', compileLimits, tempDir);
      if (compileRes.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compileRes.stderr || compileRes.stdout || 'Compilation failed.',
          exitCode: compileRes.exitCode,
          executionTimeMs: compileRes.executionTimeMs,
          status: 'Compile Error',
          sandboxMode: 'sandboxed_local',
        };
      }
    }

    // --- STEP 2: EXECUTION ---
    // If no test cases provided, run single pass
    if (testCases.length === 0) {
      const runStdin = targetLang === 'sql' ? code : '';
      const runRes = await runSandboxedProcess(runCmd, runArgs, runStdin, runtimeLimits, tempDir);
      return {
        stdout: runRes.stdout,
        stderr: runRes.stderr,
        exitCode: runRes.exitCode,
        executionTimeMs: runRes.executionTimeMs,
        status: runRes.timedOut
          ? 'Time Limit Exceeded'
          : runRes.exitCode === 0
          ? 'Accepted'
          : 'Runtime Error',
        truncated: runRes.truncated,
        sandboxMode: 'sandboxed_local',
      };
    }

    // Test cases evaluation
    const testCaseResults: TestCaseResult[] = [];
    let allPassed = true;
    let maxTimeMs = 0;
    let finalStatus: ExecutionResult['status'] = 'Accepted';
    let combinedStderr = '';
    let firstStdout = '';
    let anyTruncated = false;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let runInput = tc.input;
      if (targetLang === 'sql') {
        runInput = tc.input ? `${tc.input}\n${code}` : code;
      }

      const runRes = await runSandboxedProcess(runCmd, runArgs, runInput, runtimeLimits, tempDir);
      if (i === 0) firstStdout = runRes.stdout;
      maxTimeMs = Math.max(maxTimeMs, runRes.executionTimeMs);
      if (runRes.truncated) anyTruncated = true;

      if (runRes.timedOut) {
        allPassed = false;
        finalStatus = 'Time Limit Exceeded';
        testCaseResults.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expectedOutput: tc.expected_output,
          actualOutput: 'Time Limit Exceeded (> 5s)',
          passed: false,
          is_hidden: !!tc.is_hidden,
        });
        break;
      }

      if (runRes.exitCode !== 0) {
        allPassed = false;
        finalStatus = 'Runtime Error';
        combinedStderr += runRes.stderr + '\n';
        testCaseResults.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expectedOutput: tc.expected_output,
          actualOutput: runRes.stderr || 'Runtime Error',
          passed: false,
          is_hidden: !!tc.is_hidden,
        });
        break;
      }

      const normalizedActual = runRes.stdout.replace(/\r\n/g, '\n').trim();
      const normalizedExpected = tc.expected_output.replace(/\r\n/g, '\n').trim();
      const passed = normalizedActual === normalizedExpected;

      if (!passed) {
        allPassed = false;
        if (finalStatus === 'Accepted') finalStatus = 'Wrong Answer';
      }

      testCaseResults.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: normalizedActual,
        passed,
        is_hidden: !!tc.is_hidden,
      });
    }

    return {
      stdout: firstStdout,
      stderr: combinedStderr.trim(),
      exitCode: allPassed ? 0 : 1,
      executionTimeMs: maxTimeMs,
      status: finalStatus,
      testCaseResults,
      truncated: anyTruncated,
      sandboxMode: 'sandboxed_local',
    };
  } finally {
    // Guaranteed cleanup of execution directory and temporary binary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}
