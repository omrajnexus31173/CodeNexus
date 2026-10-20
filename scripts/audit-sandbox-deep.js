/**
 * Code Nexus Deep Sandbox Isolation & Defensive Boundary Audit Script
 * Executes controlled tests against the running server's /api/execute endpoint:
 * 1. Filesystem access (/home/user/code-nexus/.env, /etc/shadow)
 * 2. Network access (localhost:5432, 1.1.1.1:80)
 * 3. Fork bomb resistance (process limit RLIMIT_NPROC)
 * 4. Output flood resistance (maxOutputBytes truncation)
 * 5. Infinite loop / CPU timeout (watchdog & RLIMIT_CPU)
 * 6. Concurrent execution safety (5 parallel sandboxes)
 * 7. Multi-language compilation (C++, Python, Java, JS)
 */

const http = require('http');

function postApi(endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      `http://localhost:3000${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runDeepSandboxAudit() {
  console.log('====================================================');
  console.log('    CODE NEXUS DEEP SANDBOX ISOLATION AUDIT         ');
  console.log('====================================================\n');

  let passCount = 0;
  const totalTests = 7;

  // Test 1: Malicious Filesystem Access
  console.log('--- Test 1: Host Filesystem Breach Attempt ---');
  const fsExploitCode = `
import os
import sys

paths = [
    '/home/user/code-nexus/.env',
    '/home/user/.env',
    '/etc/shadow'
]
leaks = []
for p in paths:
    try:
        with open(p, 'r') as f:
            d = f.read(50)
            leaks.append(f"LEAKED {p}: {d}")
    except Exception:
        pass

if leaks:
    print("BREACH:" + "; ".join(leaks))
    sys.exit(1)
else:
    print("ISOLATED: All host secret paths blocked.")
`;
  const res1 = await postApi('/api/execute', { language: 'python', code: fsExploitCode });
  console.log('Output:', res1.data?.stdout);
  console.log('Status:', res1.data?.status);
  if (res1.data?.stdout?.includes('ISOLATED') && !res1.data?.stdout?.includes('BREACH')) {
    console.log('✅ PASS: Host filesystem read was strictly blocked by sandbox boundary.\n');
    passCount++;
  } else {
    console.log('❌ FAIL: Host filesystem was readable by untrusted code!\n', res1.data);
  }

  // Test 2: Network Access Isolation
  console.log('--- Test 2: Network Access Attempt (--unshare-net) ---');
  const netExploitCode = `
import socket
import sys

def check_conn(host, port):
    try:
        s = socket.create_connection((host, port), timeout=1.0)
        s.close()
        return True
    except Exception:
        return False

db_connected = check_conn('127.0.0.1', 5432)
ext_connected = check_conn('1.1.1.1', 80)

if db_connected or ext_connected:
    print(f"BREACH: Network accessible (db={db_connected}, ext={ext_connected})")
    sys.exit(1)
else:
    print("ISOLATED: Network namespace dropped. Sockets unreachable.")
`;
  const res2 = await postApi('/api/execute', { language: 'python', code: netExploitCode });
  console.log('Output:', res2.data?.stdout);
  console.log('Status:', res2.data?.status);
  if (res2.data?.stdout?.includes('ISOLATED') && !res2.data?.stdout?.includes('BREACH')) {
    console.log('✅ PASS: Network namespace unshared; all socket attempts failed.\n');
    passCount++;
  } else {
    console.log('❌ FAIL: Network connection succeeded inside sandbox!\n', res2.data);
  }

  // Test 3: Fork Bomb Resistance
  console.log('--- Test 3: Process Fork Bomb Containment (RLIMIT_NPROC) ---');
  const forkBombCode = `
import os
import sys

try:
    forks = 0
    for _ in range(200):
        pid = os.fork()
        if pid == 0:
            os._exit(0)
        else:
            forks += 1
    print(f"SPAWNED_{forks}")
except (BlockingIOError, OSError):
    print("CONTAINED: Fork blocked by kernel NPROC limit.")
`;
  const res3 = await postApi('/api/execute', { language: 'python', code: forkBombCode });
  console.log('Output:', res3.data?.stdout);
  console.log('Error:', res3.data?.stderr);
  if (
    res3.data?.stdout?.includes('CONTAINED') ||
    res3.data?.stderr?.includes('Resource temporarily unavailable') ||
    res3.data?.stderr?.includes('BlockingIOError') ||
    res3.data?.stderr?.includes('OSError')
  ) {
    console.log('✅ PASS: Fork bomb contained by RLIMIT_NPROC.\n');
    passCount++;
  } else {
    console.log('❌ FAIL: Fork bomb was not restricted!\n', res3.data);
  }

  // Test 4: Excessive Output Truncation
  console.log('--- Test 4: Excessive Output Flood (maxOutputBytes) ---');
  const floodCode = `print("A" * 150000)`;
  const res4 = await postApi('/api/execute', { language: 'python', code: floodCode });
  console.log('Output length:', res4.data?.stdout?.length);
  console.log('Truncated:', res4.data?.truncated);
  if (res4.data?.truncated || (res4.data?.stdout?.length <= 70000 && res4.data?.stdout?.includes('truncated'))) {
    console.log('✅ PASS: Output safely truncated at maximum allowed byte limit.\n');
    passCount++;
  } else {
    console.log('❌ FAIL: Output was not truncated properly!\n', res4.data);
  }

  // Test 5: Infinite Loop / CPU Timeout
  console.log('--- Test 5: Infinite Loop Timeout Watchdog ---');
  const loopCode = `while True: pass`;
  const startTime = Date.now();
  const res5 = await postApi('/api/execute', { language: 'python', code: loopCode });
  const elapsed = Date.now() - startTime;
  console.log('Execution Time:', elapsed, 'ms');
  console.log('Status:', res5.data?.status);
  if (res5.data?.status === 'Time Limit Exceeded') {
    console.log('✅ PASS: Infinite loop killed cleanly by timeout watchdog.\n');
    passCount++;
  } else {
    console.log('❌ FAIL: Timeout did not trigger properly!\n', res5.data);
  }

  // Test 6: Concurrent Executions (5 parallel runs)
  console.log('--- Test 6: Concurrent Multi-Threaded Executions ---');
  const tasks = [1, 2, 3, 4, 5].map((i) => {
    return postApi('/api/execute', {
      language: 'python',
      code: `print("PARALLEL_RESULT_${i}")`,
    });
  });
  const results = await Promise.all(tasks);
  const allMatch = results.every((r, idx) => r.data?.stdout?.trim() === `PARALLEL_RESULT_${idx + 1}`);
  console.log('Results:', results.map((r) => r.data?.stdout?.trim()));
  if (allMatch) {
    console.log('✅ PASS: All 5 parallel sandbox processes executed concurrently without interference.\n');
    passCount++;
  } else {
    console.log('❌ FAIL: Concurrent execution collision or failure detected!\n', results);
  }

  // Test 7: Multi-Language Compilation (C++ & JavaScript)
  console.log('--- Test 7: Multi-Language Isolated Compilation & Execution ---');
  const cppCode = '#include <iostream>\nint main(){ std::cout << "CPP_SANDBOX_SUCCESS"; return 0; }';
  const jsCode = 'console.log("JS_SANDBOX_SUCCESS");';
  const resCpp = await postApi('/api/execute', { language: 'cpp', code: cppCode });
  const resJs = await postApi('/api/execute', { language: 'javascript', code: jsCode });
  console.log('C++ Result:', resCpp.data?.stdout);
  console.log('JS Result:', resJs.data?.stdout);
  if (resCpp.data?.stdout?.includes('CPP_SANDBOX_SUCCESS') && resJs.data?.stdout?.includes('JS_SANDBOX_SUCCESS')) {
    console.log('✅ PASS: Both C++ and JavaScript executed safely within isolated boundaries.\n');
    passCount++;
  } else {
    console.log('❌ FAIL: Multi-language sandbox compilation/execution failed!\n', { resCpp, resJs });
  }

  console.log('====================================================');
  console.log(`SUMMARY: ${passCount}/${totalTests} Deep Sandbox Isolation Tests Passed!`);
  console.log('====================================================');

  if (passCount !== totalTests) {
    process.exit(1);
  }
}

runDeepSandboxAudit().catch((err) => {
  console.error('Audit exception:', err);
  process.exit(1);
});
