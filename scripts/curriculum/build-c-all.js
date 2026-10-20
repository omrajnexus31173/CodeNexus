/**
 * Complete C Programming Track: 17 Detailed Topics Aggregator
 * Strictly adheres to 14-Section Educational Content Standard.
 */

require('./patch-c');
const { cTopics } = require('./c-curriculum');
const { cAdditionalTopics } = require('./c-additional');
const { cBatch3Topics } = require('./c-batch3');

// Combine all 17 C topics
const fullCTopics = [
  ...cTopics,
  ...cAdditionalTopics,
  ...cBatch3Topics
];

module.exports = { fullCTopics };
