export type SupportedLanguage = 'python' | 'c' | 'cpp' | 'java' | 'javascript' | 'sql';

export interface SandboxLimits {
  timeoutMs: number;       // Max wall clock time in ms (default 5000)
  maxMemoryBytes: number;  // Max virtual memory (default 256 MB)
  maxProcesses: number;    // Max subprocess count (default 64, prevents fork bombs)
  maxOutputBytes: number;   // Max stdout/stderr size (default 64 KB)
  maxDiskBytes: number;    // Max temporary file size (default 10 MB)
  maxCodeLength: number;   // Max submitted code length in characters (default 65536)
}

export const DEFAULT_SANDBOX_LIMITS: SandboxLimits = {
  timeoutMs: 5000,
  maxMemoryBytes: 256 * 1024 * 1024, // 256 MB
  maxProcesses: 64,                  // Process/thread count cap
  maxOutputBytes: 64 * 1024,         // 64 KB
  maxDiskBytes: 10 * 1024 * 1024,    // 10 MB
  maxCodeLength: 64 * 1024,          // 64 KB
};

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

export interface TestCaseResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  is_hidden: boolean;
}

export type ExecutionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compile Error'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Output Limit Exceeded'
  | 'Configuration Error';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  status: ExecutionStatus;
  testCaseResults?: TestCaseResult[];
  truncated?: boolean;
  sandboxMode?: 'sandboxed_local' | 'external';
}
