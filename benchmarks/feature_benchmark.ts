import { getAllFeatures } from '../src/core/engine/FeatureDetector.ts';
import type { UnionFindState, Feature } from '../src/core/types/feature.ts';
import type { FeatureType } from '../src/core/types/tile.ts';

// Mock feature creation
function createFeature(id: string, type: FeatureType): Feature {
  return {
    id, type, nodes: [], meeples: [],
    isComplete: false, tileCount: 1, pennantCount: 0,
    openEdgeCount: 0, adjacentCompletedCities: 0, metadata: {},
  };
}

// Create a state with N features, each having M nodes.
// Total nodes = N * M.
const NUM_FEATURES = 5000;
const NODES_PER_FEATURE = 20;

const state: UnionFindState = {
  parent: {},
  rank: {},
  featureData: {},
};

console.log(`Setting up state with ${NUM_FEATURES} features and ${NODES_PER_FEATURE} nodes each...`);

for (let i = 0; i < NUM_FEATURES; i++) {
  const rootKey = `root_${i}`;
  state.featureData[rootKey] = createFeature(rootKey, 'CITY');

  // Make root point to itself
  state.parent[rootKey] = rootKey;
  state.rank[rootKey] = 1;

  // Add child nodes pointing to root
  for (let j = 0; j < NODES_PER_FEATURE - 1; j++) {
    const childKey = `child_${i}_${j}`;
    state.parent[childKey] = rootKey; // Direct link to root for simplicity
    state.rank[childKey] = 0;
  }
}

console.log(`Total nodes in parent map: ${Object.keys(state.parent).length}`);
console.log(`Total features in featureData: ${Object.keys(state.featureData).length}`);

const ITERATIONS = 100; // Reduced iterations to be quicker but still measurable

console.log(`Running getAllFeatures ${ITERATIONS} times...`);

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const features = getAllFeatures(state);
  if (features.length !== NUM_FEATURES) {
      throw new Error(`Expected ${NUM_FEATURES} features, got ${features.length}`);
  }
}
const end = performance.now();

const duration = end - start;
console.log(`Total time: ${duration.toFixed(2)}ms`);
console.log(`Average time per call: ${(duration / ITERATIONS).toFixed(4)}ms`);
