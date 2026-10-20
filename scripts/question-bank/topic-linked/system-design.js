'use strict';
const { question } = require('./helper');

module.exports = [
  question({
    topic: 'sd-caching-strategies', language: 'javascript', course: 'system-design',
    title: 'Simulate an LRU Cache Access Trace',
    statement: 'Simulate a read-through LRU cache. First input value is capacity; remaining tokens are key accesses. A hit moves the key to most-recently-used; a miss inserts it and evicts the least-recently-used key when full. Print hit count, miss count, and final cache keys from least- to most-recently-used.',
    input: 'Line 1: capacity. Line 2: space-separated keys (may be absent).',
    output: 'hits=<h> misses=<m>\ncache: <keys space-separated, or (empty)>',
    constraints: '1 <= capacity <= 1000; at most 10000 accesses; keys are single tokens.',
    difficulty: 'Medium', tags: ['caching', 'LRU', 'Map'],
    starter: `const fs = require('fs');

const tokens = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean);
const capacity = Number(tokens[0] || 0);
const keys = tokens.slice(1);
const cache = new Map();
let hits = 0;
let misses = 0;

for (const key of keys) {
  if (cache.has(key)) {
    hits++;
    // TODO: refresh recency by deleting and re-setting the key.
  } else {
    misses++;
    cache.set(key, true);
    // TODO: evict the oldest key when size exceeds capacity.
  }
}

console.log('hits=' + hits + ' misses=' + misses);
console.log('cache: ' + (cache.size ? Array.from(cache.keys()).join(' ') : '(empty)'));`,
    solution: `const fs = require('fs');

const tokens = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean);
const capacity = Number(tokens[0] || 0);
const keys = tokens.slice(1);
const cache = new Map();
let hits = 0;
let misses = 0;

for (const key of keys) {
  if (cache.has(key)) {
    hits++;
    cache.delete(key);
    cache.set(key, true);
  } else {
    misses++;
    cache.set(key, true);
    if (cache.size > capacity) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }
  }
}

console.log('hits=' + hits + ' misses=' + misses);
console.log('cache: ' + (cache.size ? Array.from(cache.keys()).join(' ') : '(empty)'));`,
    explanation: 'JavaScript Map preserves insertion order, so delete+set marks a key most recent and the first key is always the LRU eviction candidate.',
    hints: ['On a hit, delete then set the key so it moves to the end.', 'cache.keys().next().value is the least-recently-used key.'],
    tests: [['2\nA B A C A', 'hits=2 misses=3\ncache: C A'], ['3\nA B C B D A', 'hits=1 misses=5\ncache: B D A'], ['1\nX X Y X', 'hits=1 misses=3\ncache: X'], ['2', 'hits=0 misses=0\ncache: (empty)']],
  }),

  question({
    topic: 'sd-load-balancing-scaling', language: 'javascript', course: 'system-design',
    title: 'Round-Robin vs Least-Loaded Makespan',
    statement: 'Given a server count and job durations, simulate two static assignments: round-robin (job i goes to server i % servers) and greedy least-loaded (each job goes to the currently least-loaded server, lowest index on ties). Print each strategy\'s makespan, defined as the maximum total load on any server.',
    input: 'One line: serverCount followed by zero or more job durations.',
    output: 'Two lines: rr=<makespan> and least=<makespan>.',
    constraints: 'serverCount >= 1; durations are non-negative safe integers.',
    difficulty: 'Medium', tags: ['load balancing', 'round robin'],
    starter: `const fs = require('fs');

const nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
const servers = nums[0] || 1;
const jobs = nums.slice(1);

function makespan(choose) {
  const loads = Array(servers).fill(0);
  jobs.forEach((duration, index) => {
    const server = choose(loads, index);
    loads[server] += duration;
  });
  return Math.max(...loads);
}

// TODO: round-robin uses index % servers; greedy chooses the minimum load.
console.log('rr=' + makespan(() => 0));
console.log('least=' + makespan(() => 0));`,
    solution: `const fs = require('fs');

const nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
const servers = nums[0] || 1;
const jobs = nums.slice(1);

function makespan(choose) {
  const loads = Array(servers).fill(0);
  jobs.forEach((duration, index) => {
    const server = choose(loads, index);
    loads[server] += duration;
  });
  return Math.max(...loads);
}

const rr = makespan((loads, index) => index % servers);
const least = makespan((loads) => loads.indexOf(Math.min(...loads)));
console.log('rr=' + rr);
console.log('least=' + least);`,
    explanation: 'Round-robin is simple but ignores job size; greedy least-loaded reacts to accumulated work and usually finishes skewed batches sooner.',
    hints: ['Round-robin choice depends only on the job index.', 'loads.indexOf(Math.min(...loads)) gives the first least-loaded server.'],
    tests: [['2 5 2 2 2', 'rr=7\nleast=6'], ['3 8 1 1 1 1', 'rr=9\nleast=8'], ['1 3 4', 'rr=7\nleast=7'], ['4', 'rr=0\nleast=0']],
  }),

  question({
    topic: 'sd-queues-rate-limiting', language: 'javascript', course: 'system-design',
    title: 'Token Bucket Rate Limiter Trace',
    statement: 'Implement a token bucket that starts full. Input gives capacity, refill tokens per second, then request timestamps in milliseconds (non-decreasing). Before each request, refill elapsedSeconds * rate tokens capped at capacity. A request consumes one token and prints OK if at least one token is available; otherwise print 429 and consume nothing.',
    input: 'One line: capacity refillPerSecond followed by request timestamps in ms.',
    output: 'One line: OK/429 results separated by single spaces.',
    constraints: 'Capacity and rate are positive numbers; timestamps are non-decreasing integers.',
    difficulty: 'Medium', tags: ['rate limiting', 'token bucket', 'backpressure'],
    starter: `const fs = require('fs');

const nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
const capacity = nums[0];
const refillPerSecond = nums[1];
const times = nums.slice(2);
let tokens = capacity;
let lastTime = times.length ? times[0] : 0;
const results = [];

for (const now of times) {
  // TODO: refill by elapsed time (cap at capacity), then spend 1 token if possible.
  lastTime = now;
  results.push('OK');
}

console.log(results.join(' '));`,
    solution: `const fs = require('fs');

const nums = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/).filter(Boolean).map(Number);
const capacity = nums[0];
const refillPerSecond = nums[1];
const times = nums.slice(2);
let tokens = capacity;
let lastTime = times.length ? times[0] : 0;
const results = [];

for (const now of times) {
  const elapsedSeconds = (now - lastTime) / 1000;
  tokens = Math.min(capacity, tokens + elapsedSeconds * refillPerSecond);
  lastTime = now;
  if (tokens >= 1) {
    tokens -= 1;
    results.push('OK');
  } else {
    results.push('429');
  }
}

console.log(results.join(' '));`,
    explanation: 'The bucket permits bursts up to capacity while the refill rate bounds sustained throughput; rejected requests do not spend tokens.',
    hints: ['Refill before deciding, using elapsed milliseconds / 1000.', 'Cap tokens at capacity with Math.min; only subtract on OK.'],
    tests: [['3 1 0 0 0 0 1000 1000 2500', 'OK OK OK 429 OK 429 OK'], ['2 2 0 0 0 500 500 1500', 'OK OK 429 OK 429 OK'], ['1 1 100 100 1100 1100', 'OK 429 OK 429'], ['5 10 0', 'OK']],
  }),

  question({
    topic: 'sd-databases-sharding-replication', language: 'javascript', course: 'system-design',
    title: 'Replica Read Load Staleness and Shard Placement',
    statement: 'Input line 1 gives replicaCount, readQps, writeQps, lagMs, readDelayMs, and shardCount. Writes go to the primary; reads spread evenly over replicas (round per-replica load up with Math.ceil). A replica read may be stale when readDelayMs < lagMs. Place each key from line 2 on shard FNV-1a(key) % shardCount using unsigned 32-bit FNV-1a (offset 2166136261, prime 16777619).',
    input: 'Line 1: six integers as described. Line 2: one or more keys.',
    output: 'primary=<writeQps>\nper-replica=<ceil(readQps/replicaCount)>\nstale=<true/false>\nThen one line of key->shard-<n> assignments separated by spaces.',
    constraints: 'replicaCount and shardCount >= 1; keys are ASCII without spaces.',
    difficulty: 'Medium', tags: ['replication', 'sharding', 'consistency'],
    starter: `const fs = require('fs');

function fnv1a(key) {
  let hash = 2166136261 >>> 0;
  // TODO: XOR each code point, then Math.imul by 16777619 >>> 0.
  return hash;
}

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\r?\\n/);
const [replicas, readQps, writeQps, lagMs, readDelayMs, shards] = lines[0].trim().split(/\\s+/).map(Number);
const keys = lines[1].trim().split(/\\s+/);
// TODO: compute ceil per-replica reads and stale = readDelayMs < lagMs.
console.log('primary=' + writeQps);
console.log('per-replica=' + 0);
console.log('stale=' + false);
console.log(keys.map((key) => key + '->shard-' + (fnv1a(key) % shards)).join(' '));`,
    solution: `const fs = require('fs');

function fnv1a(key) {
  let hash = 2166136261 >>> 0;
  for (const ch of key) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\r?\\n/);
const [replicas, readQps, writeQps, lagMs, readDelayMs, shards] = lines[0].trim().split(/\\s+/).map(Number);
const keys = lines[1].trim().split(/\\s+/);
console.log('primary=' + writeQps);
console.log('per-replica=' + Math.ceil(readQps / replicas));
console.log('stale=' + (readDelayMs < lagMs));
console.log(keys.map((key) => key + '->shard-' + (fnv1a(key) % shards)).join(' '));`,
    explanation: 'Replication spreads read load but asynchronous lag creates a staleness window; deterministic key hashing gives each record a stable shard home.',
    hints: ['Per-replica planning uses Math.ceil(readQps / replicas).', 'stale is exactly the boolean readDelayMs < lagMs.'],
    tests: [['4 1600 200 250 100 4\nalpha beta gamma', 'primary=200\nper-replica=400\nstale=true\nalpha->shard-3 beta->shard-3 gamma->shard-2'], ['3 1000 50 100 100 3\nuser:1 user:2 user:3 user:4', 'primary=50\nper-replica=334\nstale=false\nuser:1->shard-1 user:2->shard-0 user:3->shard-2 user:4->shard-1'], ['1 0 7 0 0 1\nx y z', 'primary=7\nper-replica=0\nstale=false\nx->shard-0 y->shard-0 z->shard-0']],
  }),
];
