import { runInSandbox, ExecutionResult, TestCase, SandboxLimits } from './sandbox';

export type { ExecutionResult, TestCase, SandboxLimits };

/**
 * Sandboxed code execution engine.
 * Directs execution through genuine kernel-level or external sandbox boundaries.
 */
export async function executeCode(
  language: string,
  code: string,
  testCases: TestCase[] = [],
  customLimits?: Partial<SandboxLimits>
): Promise<ExecutionResult> {
  return runInSandbox(language, code, testCases, customLimits);
}
