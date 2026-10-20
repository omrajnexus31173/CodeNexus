/**
 * Code Nexus — Master Educational Content Aggregator
 * Gathers complete 14-section topics across all 10 tracks.
 * The 2026 expansion (scripts/curriculum/expansion) adds 93 topics to the
 * original 36, for 129 total. Unit definitions and per-unit topic ordering
 * are normalised centrally via expansion/units.js (topicPlacements), so
 * navigation order does not depend on per-file order hints.
 */

const { fullCTopics } = require('./build-c-all');
const { cppTopics } = require('./all-topics');
const { pythonTopics } = require('./python-curriculum');
const { javaTopics } = require('./java-curriculum');
const { javascriptTopics } = require('./javascript-curriculum');
const { sqlTopics } = require('./sql-curriculum');
const { dsaTopics, webTopics } = require('./dsa-web-curriculum');
const { specialTopics } = require('./app-sd-java2');
const { finalFourTopics } = require('./missing-four');

const { UNITS, UNIT_TOPICS, topicPlacements } = require('./expansion/units');
const { diagramOverrideFor } = require('./diagram-overrides');
const expansionTopics = [
  ...require('./expansion/exp-c').topics,
  ...require('./expansion/exp-python-a').topics,
  ...require('./expansion/exp-python-b').topics,
  ...require('./expansion/exp-cpp').topics,
  ...require('./expansion/exp-java').topics,
  ...require('./expansion/exp-js').topics,
  ...require('./expansion/exp-sql').topics,
  ...require('./expansion/exp-dsa-a').topics,
  ...require('./expansion/exp-dsa-b').topics,
  ...require('./expansion/exp-web').topics,
  ...require('./expansion/exp-app-sd').topics,
];

const rawTopics = [
  ...fullCTopics,
  ...cppTopics,
  ...pythonTopics,
  ...javaTopics,
  ...javascriptTopics,
  ...sqlTopics,
  ...dsaTopics,
  ...webTopics,
  ...specialTopics,
  ...finalFourTopics,
  ...expansionTopics,
];

// Apply central placements + integrity checks (fail fast at load time).
const seen = new Set();
const masterTopics = rawTopics.map((t) => {
  if (seen.has(t.id)) throw new Error(`Duplicate topic id in master curriculum: ${t.id}`);
  seen.add(t.id);
  const placement = topicPlacements[t.id];
  if (!placement) throw new Error(`Topic without placement in expansion/units.js: ${t.id}`);
  const diagramOverride = diagramOverrideFor(t.id);
  return {
    ...t,
    unit_id: placement.unit_id,
    order_index: placement.order_index,
    ...(diagramOverride ? { diagram_svg: diagramOverride } : {}),
  };
});

for (const placedId of Object.keys(topicPlacements)) {
  if (!seen.has(placedId)) {
    throw new Error(`Placement refers to unknown topic: ${placedId}`);
  }
}

module.exports = { masterTopics, masterUnits: UNITS, UNIT_TOPICS };
