/**
 * Visual Learning SVG Diagram Generators for Code Nexus
 * Generates responsive, high-contrast visual illustrations for programming concepts.
 */

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Small SVG text helpers. The original generators placed every label on one
 * line inside fixed-width boxes, so longer topic phrases overflowed the
 * diagram. These helpers wrap labels deterministically before rendering.
 */
function wrapSvgText(value, maxChars, maxLines = 4) {
  const words = String(value || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(' ').length > lines.join(' ').length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/…$/, '')}…`;
  }
  return lines.length ? lines : [''];
}

function svgTextBlock(x, centerY, lines, attrs = {}) {
  const fontSize = attrs.fontSize || 11;
  const lineHeight = attrs.lineHeight || fontSize + 3;
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2 + fontSize * 0.35;
  const fill = attrs.fill || '#f8fafc';
  const family = attrs.fontFamily || 'system-ui, sans-serif';
  const weight = attrs.fontWeight ? ` font-weight="${attrs.fontWeight}"` : '';
  const anchor = attrs.textAnchor || 'middle';
  return lines
    .map((line, i) => `<text x="${x}" y="${(startY + i * lineHeight).toFixed(1)}" fill="${fill}" font-size="${fontSize}" font-family="${family}"${weight} text-anchor="${anchor}">${escapeXml(line)}</text>`)
    .join('\n    ');
}

/**
 * C / C++ Pointer Memory Diagram
 * Shows variable address, value, and pointer address holding the target's address with an arrow.
 */
function createPointerMemorySvg(varName, varVal, varAddr, ptrName, ptrAddr) {
  return `<svg viewBox="0 0 680 240" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-2xl mx-auto rounded-lg">
  <defs>
    <marker id="ptr-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <linearGradient id="grad-var" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="grad-ptr" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Stack Title -->
  <text x="340" y="32" fill="#94a3b8" font-size="13" font-family="system-ui, sans-serif" font-weight="600" text-anchor="middle" letter-spacing="1">
    SYSTEM RAM (STACK MEMORY VISUALIZATION)
  </text>

  <!-- Pointer Cell -->
  <g transform="translate(60, 60)">
    <rect width="220" height="120" rx="10" fill="url(#grad-ptr)" stroke="#10b981" stroke-width="2"/>
    <text x="110" y="32" fill="#6ee7b7" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle">
      Pointer: ${escapeXml(ptrName)}
    </text>
    <line x1="20" y1="46" x2="200" y2="46" stroke="#065f46" stroke-width="1"/>
    <text x="110" y="74" fill="#a7f3d0" font-size="12" font-family="sans-serif" text-anchor="middle">Stores Address:</text>
    <text x="110" y="98" fill="#38bdf8" font-size="15" font-family="monospace" font-weight="bold" text-anchor="middle">
      ${escapeXml(varAddr)}
    </text>
    <!-- Pointer Own Address -->
    <text x="110" y="142" fill="#64748b" font-size="11" font-family="monospace" text-anchor="middle">
      Self Addr: ${escapeXml(ptrAddr)}
    </text>
  </g>

  <!-- Arrow connecting Pointer to Variable -->
  <path d="M 285 120 C 340 120, 360 120, 395 120" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,2" marker-end="url(#ptr-arrow)"/>
  <text x="340" y="108" fill="#38bdf8" font-size="11" font-family="system-ui" font-weight="bold" text-anchor="middle">Points to (*${escapeXml(ptrName)})</text>

  <!-- Target Variable Cell -->
  <g transform="translate(400, 60)">
    <rect width="220" height="120" rx="10" fill="url(#grad-var)" stroke="#38bdf8" stroke-width="2"/>
    <text x="110" y="32" fill="#7dd3fc" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle">
      Variable: ${escapeXml(varName)}
    </text>
    <line x1="20" y1="46" x2="200" y2="46" stroke="#334155" stroke-width="1"/>
    <text x="110" y="74" fill="#cbd5e1" font-size="12" font-family="sans-serif" text-anchor="middle">Holds Value:</text>
    <text x="110" y="98" fill="#facc15" font-size="18" font-family="monospace" font-weight="extrabold" text-anchor="middle">
      ${escapeXml(varVal)}
    </text>
    <!-- Variable Memory Address -->
    <text x="110" y="142" fill="#38bdf8" font-size="11" font-family="monospace" text-anchor="middle">
      Address: &amp;${escapeXml(varName)} = ${escapeXml(varAddr)}
    </text>
  </g>
</svg>`;
}

/**
 * Memory diagram.
 * - With vars: renders the actual named cells supplied by a topic (arrays,
 *   C strings, hash buckets, ...). This is the expansion-builder path.
 * - Without vars: retains the legacy process-segment overview for topics
 *   where that overview is itself the subject.
 */
function createMemoryLayoutSvg(vars, note) {
  if (Array.isArray(vars) && vars.length > 0) {
    const rows = vars.slice(0, 6);
    const rowHeight = 42;
    const bodyHeight = rows.length * rowHeight;
    const height = 112 + bodyHeight + (note ? 42 : 18);
    const rowSvg = rows.map((v, i) => {
      const y = 76 + i * rowHeight;
      const label = `${v.name || 'value'}${v.type ? ` : ${v.type}` : ''}${v.size ? ` (${v.size})` : ''}`;
      return `
  <g>
    <rect x="48" y="${y}" width="190" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.3"/>
    ${svgTextBlock(143, y + 17, wrapSvgText(label, 24, 2), { fill: '#bae6fd', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' })}
    <rect x="252" y="${y}" width="150" height="34" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="1.2"/>
    ${svgTextBlock(327, y + 17, wrapSvgText(v.addr || '', 18, 2), { fill: '#cbd5e1', fontSize: 11, fontFamily: 'monospace' })}
    <path d="M 402 ${y + 17} L 438 ${y + 17}" stroke="#38bdf8" stroke-width="2"/>
    <rect x="442" y="${y}" width="150" height="34" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.3"/>
    ${svgTextBlock(517, y + 17, wrapSvgText(v.val ?? '', 18, 2), { fill: '#a7f3d0', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' })}
  </g>`;
    }).join('');
    const noteLines = note ? wrapSvgText(note, 78, 2) : [];
    return `<svg viewBox="0 0 640 ${height}" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-xl mx-auto rounded-lg" role="img" aria-label="Memory cells diagram">
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>
  <text x="320" y="28" fill="#7dd3fc" font-size="13" font-family="system-ui" font-weight="bold" text-anchor="middle">MEMORY CELLS: NAME → ADDRESS → VALUE</text>
  <text x="143" y="56" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">CELL</text>
  <text x="327" y="56" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">ADDRESS / SLOT</text>
  <text x="517" y="56" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">STORED VALUE</text>
  ${rowSvg}
  ${note ? svgTextBlock(320, height - 24, noteLines, { fill: '#cbd5e1', fontSize: 10.5 }) : ''}
</svg>`;
  }

  return `<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-xl mx-auto rounded-lg">
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>
  <text x="320" y="28" fill="#94a3b8" font-size="13" font-family="system-ui" font-weight="bold" text-anchor="middle">PROCESS VIRTUAL ADDRESS SPACE (C/C++ MEMORY SEGMENTS)</text>

  <!-- Top (High Memory: 0xFFFFFFFF) -->
  <text x="40" y="55" fill="#64748b" font-size="10" font-family="monospace">High Address (0x7FFFFFFF)</text>

  <!-- Stack Segment -->
  <g transform="translate(180, 45)">
    <rect width="280" height="42" rx="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="140" y="26" fill="#c7d2fe" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">Stack Segment (Local vars, Stack frames)</text>
  </g>
  <path d="M 320 92 L 320 108" stroke="#818cf8" stroke-width="2" marker-end="url(#down-arrow)"/>
  <text x="490" y="103" fill="#818cf8" font-size="10" font-family="sans-serif">Grows Downward ↓</text>

  <!-- Free Memory Space -->
  <g transform="translate(180, 112)">
    <rect width="280" height="34" rx="4" fill="#0f172a" stroke="#334155" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="140" y="22" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="middle">Unallocated Address Space</text>
  </g>

  <!-- Heap Segment -->
  <path d="M 320 162 L 320 148" stroke="#10b981" stroke-width="2"/>
  <text x="490" y="160" fill="#10b981" font-size="10" font-family="sans-serif">Grows Upward ↑</text>
  <g transform="translate(180, 168)">
    <rect width="280" height="40" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="140" y="25" fill="#a7f3d0" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">Heap Segment (malloc / calloc / new)</text>
  </g>

  <!-- BSS & Data -->
  <g transform="translate(180, 214)">
    <rect width="280" height="38" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="140" y="24" fill="#7dd3fc" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">Data &amp; BSS (Global &amp; Static variables)</text>
  </g>

  <!-- Text / Code Segment -->
  <g transform="translate(180, 258)">
    <rect width="280" height="38" rx="6" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
    <text x="140" y="24" fill="#f3e8ff" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">Text / Code Segment (Machine Instructions)</text>
  </g>

  <!-- Low Address (0x00000000) -->
  <text x="40" y="280" fill="#64748b" font-size="10" font-family="monospace">Low Address (0x00000000)</text>
</svg>`;
}

/**
 * SQL Multi-Table JOIN Diagram
 */
function createSqlJoinSvg(joinType, leftTable, rightTable, resultTable) {
  return `<svg viewBox="0 0 680 260" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-2xl mx-auto rounded-lg">
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>
  <text x="340" y="26" fill="#38bdf8" font-size="13" font-family="system-ui" font-weight="bold" text-anchor="middle">
    RELATIONAL QUERY EXECUTION: ${escapeXml(joinType.toUpperCase())}
  </text>

  <!-- Left Table Card -->
  <g transform="translate(40, 50)">
    <rect width="160" height="170" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <rect width="160" height="30" rx="8" fill="#1e293b"/>
    <text x="80" y="20" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">${escapeXml(leftTable.name)}</text>
    <text x="15" y="55" fill="#94a3b8" font-size="11" font-family="monospace">id | name | dept</text>
    <line x1="10" y1="62" x2="150" y2="62" stroke="#334155"/>
    ${leftTable.rows.map((r, i) => `<text x="15" y="${82 + i * 22}" fill="#f1f5f9" font-size="11" font-family="monospace">${escapeXml(r)}</text>`).join('')}
  </g>

  <!-- Join Operator Circle -->
  <g transform="translate(230, 110)">
    <circle cx="35" cy="35" r="32" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/>
    <text x="35" y="32" fill="#c7d2fe" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">${escapeXml(joinType)}</text>
    <text x="35" y="47" fill="#a5b4fc" font-size="10" font-family="monospace" text-anchor="middle">ON A.id=B.id</text>
  </g>

  <!-- Right Table Card -->
  <g transform="translate(330, 50)">
    <rect width="160" height="170" rx="8" fill="#0f172a" stroke="#818cf8" stroke-width="1.5"/>
    <rect width="160" height="30" rx="8" fill="#1e1b4b"/>
    <text x="80" y="20" fill="#a5b4fc" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">${escapeXml(rightTable.name)}</text>
    <text x="15" y="55" fill="#94a3b8" font-size="11" font-family="monospace">dept_id | dname</text>
    <line x1="10" y1="62" x2="150" y2="62" stroke="#334155"/>
    ${rightTable.rows.map((r, i) => `<text x="15" y="${82 + i * 22}" fill="#f1f5f9" font-size="11" font-family="monospace">${escapeXml(r)}</text>`).join('')}
  </g>

  <!-- Resulting Table Card -->
  <g transform="translate(515, 50)">
    <rect width="135" height="170" rx="8" fill="#022c22" stroke="#10b981" stroke-width="1.5"/>
    <rect width="135" height="30" rx="8" fill="#064e3b"/>
    <text x="67" y="20" fill="#6ee7b7" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">Result Set</text>
    <text x="10" y="55" fill="#a7f3d0" font-size="10" font-family="monospace">name | dname</text>
    <line x1="8" y1="62" x2="127" y2="62" stroke="#065f46"/>
    ${resultTable.rows.map((r, i) => `<text x="10" y="${82 + i * 22}" fill="#f0fdf4" font-size="10" font-family="monospace">${escapeXml(r)}</text>`).join('')}
  </g>
</svg>`;
}

/**
 * JavaScript Event Loop Diagram
 */
function createEventLoopSvg() {
  return `<svg viewBox="0 0 680 280" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-2xl mx-auto rounded-lg">
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>
  <text x="340" y="28" fill="#facc15" font-size="14" font-family="system-ui" font-weight="bold" text-anchor="middle">
    JAVASCRIPT CONCURRENCY ARCHITECTURE &amp; EVENT LOOP
  </text>

  <!-- Call Stack -->
  <g transform="translate(40, 50)">
    <rect width="150" height="190" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/>
    <text x="75" y="25" fill="#c7d2fe" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">CALL STACK</text>
    <line x1="10" y1="36" x2="140" y2="36" stroke="#4338ca"/>
    <rect x="15" y="50" width="120" height="32" rx="4" fill="#312e81" stroke="#6366f1"/>
    <text x="75" y="70" fill="#e0e7ff" font-size="11" font-family="monospace" text-anchor="middle">innerFunc()</text>
    <rect x="15" y="90" width="120" height="32" rx="4" fill="#312e81" stroke="#6366f1"/>
    <text x="75" y="110" fill="#e0e7ff" font-size="11" font-family="monospace" text-anchor="middle">main()</text>
    <text x="75" y="160" fill="#94a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">Synchronous LIFO</text>
  </g>

  <!-- Event Loop Center Circle -->
  <g transform="translate(250, 95)">
    <circle cx="50" cy="50" r="42" fill="#0f172a" stroke="#facc15" stroke-width="3" stroke-dasharray="8,4"/>
    <text x="50" y="47" fill="#fde047" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">EVENT</text>
    <text x="50" y="63" fill="#fde047" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">LOOP</text>
  </g>

  <!-- Web APIs / Node APIs -->
  <g transform="translate(420, 50)">
    <rect width="210" height="85" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="24" fill="#7dd3fc" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">WEB / C++ APIs</text>
    <text x="15" y="48" fill="#cbd5e1" font-size="11" font-family="monospace">• setTimeout / fetch()</text>
    <text x="15" y="68" fill="#cbd5e1" font-size="11" font-family="monospace">• DOM Events / fs.read</text>
  </g>

  <!-- Microtask Queue -->
  <g transform="translate(420, 150)">
    <rect width="210" height="42" rx="6" fill="#022c22" stroke="#10b981" stroke-width="1.5"/>
    <text x="105" y="26" fill="#6ee7b7" font-size="11" font-family="monospace" font-weight="bold" text-anchor="middle">
      Microtask Queue (Promises / then)
    </text>
  </g>

  <!-- Macrotask Queue -->
  <g transform="translate(420, 202)">
    <rect width="210" height="42" rx="6" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
    <text x="105" y="26" fill="#f3e8ff" font-size="11" font-family="monospace" font-weight="bold" text-anchor="middle">
      Macrotask Queue (Timer callbacks)
    </text>
  </g>
</svg>`;
}

/**
 * Control Flow Decision Svg
 */
function createControlFlowSvg(startLabel, condLabel, truePath, falsePath, endLabel) {
  const startLines = wrapSvgText(startLabel, 17, 3);
  const condLines = wrapSvgText(condLabel, 15, 3);
  const trueLines = wrapSvgText(truePath, 22, 3);
  const falseLines = wrapSvgText(falsePath, 22, 3);
  const endLines = wrapSvgText(endLabel, 16, 3);
  return `<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-2xl mx-auto rounded-lg" role="img" aria-label="Decision flow diagram">
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Start -->
  <rect x="24" y="104" width="126" height="72" rx="9" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
  ${svgTextBlock(87, 140, startLines, { fill: '#f8fafc', fontSize: 11, fontFamily: 'system-ui, sans-serif', fontWeight: '600' })}
  <line x1="150" y1="140" x2="206" y2="140" stroke="#94a3b8" stroke-width="2"/>

  <!-- Decision Diamond -->
  <polygon points="292,82 378,140 292,198 206,140" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>
  ${svgTextBlock(292, 140, condLines, { fill: '#fbbf24', fontSize: 10.5, fontFamily: 'system-ui, sans-serif', fontWeight: 'bold' })}

  <!-- True Branch (Up & Right) -->
  <path d="M 292 82 L 292 48 L 398 48" stroke="#10b981" stroke-width="2" fill="none"/>
  <text x="304" y="68" fill="#10b981" font-size="10" font-family="sans-serif" font-weight="bold">TRUE</text>
  <rect x="398" y="20" width="162" height="58" rx="7" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  ${svgTextBlock(479, 49, trueLines, { fill: '#a7f3d0', fontSize: 10.5, fontFamily: 'system-ui, sans-serif', fontWeight: '600' })}

  <!-- False Branch (Down & Right) -->
  <path d="M 292 198 L 292 232 L 398 232" stroke="#ef4444" stroke-width="2" fill="none"/>
  <text x="304" y="220" fill="#ef4444" font-size="10" font-family="sans-serif" font-weight="bold">FALSE</text>
  <rect x="398" y="202" width="162" height="58" rx="7" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
  ${svgTextBlock(479, 231, falseLines, { fill: '#fecaca', fontSize: 10.5, fontFamily: 'system-ui, sans-serif', fontWeight: '600' })}

  <!-- Merge to End -->
  <path d="M 560 49 L 626 49 L 626 104" stroke="#94a3b8" stroke-width="2" fill="none"/>
  <path d="M 560 231 L 626 231 L 626 176" stroke="#94a3b8" stroke-width="2" fill="none"/>
  <rect x="570" y="104" width="112" height="72" rx="9" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  ${svgTextBlock(626, 140, endLines, { fill: '#7dd3fc', fontSize: 11, fontFamily: 'system-ui, sans-serif', fontWeight: '600' })}
</svg>`;
}

/**
 * Topic-specific process diagram used by audit overrides for topics whose
 * original artwork was a generic memory/event-loop image. It deliberately
 * renders the supplied topic steps, rather than pretending a generic stock
 * diagram explains the lesson.
 */
function createConceptProcessSvg(title, steps, note = '') {
  const safeSteps = (Array.isArray(steps) ? steps : []).slice(0, 4);
  const cols = Math.max(1, safeSteps.length);
  const gap = 18;
  const boxWidth = Math.floor((640 - 48 - gap * (cols - 1)) / cols);
  const boxes = safeSteps.map((step, i) => {
    const x = 24 + i * (boxWidth + gap);
    const centerX = x + boxWidth / 2;
    const lines = wrapSvgText(step, Math.max(13, Math.floor(boxWidth / 7.2)), 5);
    const arrow = i < cols - 1
      ? `<path d="M ${x + boxWidth + 2} 139 L ${x + boxWidth + gap - 2} 139" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#concept-arrow)"/>`
      : '';
    return `
  <g>
    <rect x="${x}" y="86" width="${boxWidth}" height="106" rx="10" fill="${i % 2 ? '#10233b' : '#14263d'}" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="${centerX}" cy="108" r="13" fill="#0369a1" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="${centerX}" y="112.5" fill="#f0f9ff" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">${i + 1}</text>
    ${svgTextBlock(centerX, 151, lines, { fill: '#e2e8f0', fontSize: 10.5, fontFamily: 'system-ui, sans-serif', fontWeight: '600' })}
  </g>${arrow}`;
  }).join('');
  const titleLines = wrapSvgText(title, 62, 2);
  const noteLines = note ? wrapSvgText(note, 84, 2) : [];
  return `<svg viewBox="0 0 640 ${note ? 258 : 224}" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-2xl mx-auto rounded-lg" role="img" aria-label="${escapeXml(title)} process diagram">
  <defs><marker id="concept-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/></marker></defs>
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>
  ${svgTextBlock(320, 36, titleLines, { fill: '#7dd3fc', fontSize: 13, fontFamily: 'system-ui, sans-serif', fontWeight: 'bold' })}
  <line x1="24" y1="66" x2="616" y2="66" stroke="#164e63" stroke-width="1.5"/>
  ${boxes}
  ${note ? svgTextBlock(320, 226, noteLines, { fill: '#cbd5e1', fontSize: 10.5 }) : ''}
</svg>`;
}

/**
 * CSS Box Model Diagram
 */
function createBoxModelSvg() {
  return `<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" class="w-full max-w-xl mx-auto rounded-lg">
  <rect width="100%" height="100%" fill="#0a0f1d" rx="12" stroke="#1e293b" stroke-width="1.5"/>
  <text x="300" y="26" fill="#f472b6" font-size="13" font-family="system-ui" font-weight="bold" text-anchor="middle">THE CSS BOX MODEL ARCHITECTURE</text>

  <!-- Margin Box -->
  <g transform="translate(60, 45)">
    <rect width="480" height="200" rx="10" fill="#78350f" fill-opacity="0.3" stroke="#f59e0b" stroke-width="2"/>
    <text x="25" y="25" fill="#fbbf24" font-size="11" font-family="monospace" font-weight="bold">MARGIN (External spacing)</text>

    <!-- Border Box -->
    <g transform="translate(45, 30)">
      <rect width="390" height="140" rx="8" fill="#701a75" fill-opacity="0.3" stroke="#e879f9" stroke-width="2"/>
      <text x="25" y="22" fill="#f0abfc" font-size="11" font-family="monospace" font-weight="bold">BORDER (Stroke boundary)</text>

      <!-- Padding Box -->
      <g transform="translate(45, 26)">
        <rect width="300" height="88" rx="6" fill="#064e3b" fill-opacity="0.4" stroke="#10b981" stroke-width="2"/>
        <text x="20" y="20" fill="#6ee7b7" font-size="10" font-family="monospace" font-weight="bold">PADDING (Internal buffer)</text>

        <!-- Content Box -->
        <g transform="translate(35, 24)">
          <rect width="230" height="42" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
          <text x="115" y="26" fill="#f0f9ff" font-size="12" font-family="monospace" font-weight="extrabold" text-anchor="middle">CONTENT (Text, Image)</text>
        </g>
      </g>
    </g>
  </g>
</svg>`;
}

module.exports = {
  createPointerMemorySvg,
  createMemoryLayoutSvg,
  createSqlJoinSvg,
  createEventLoopSvg,
  createControlFlowSvg,
  createConceptProcessSvg,
  createBoxModelSvg,
};
