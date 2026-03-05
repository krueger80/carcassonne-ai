import { performance } from 'perf_hooks';

// Simulate a large number of meeples and players
const players = Array.from({ length: 100 }, (_, i) => ({ id: `p${i}`, color: `#${i}00` }));
const meeplePlayerIds = Array.from({ length: 100000 }, (_, i) => `p${i % 100}`);

function testBaseline() {
  const start = performance.now();
  let dummy = '';
  for (const playerId of meeplePlayerIds) {
    dummy = players.find(p => p.id === playerId)?.color || '#fff';
  }
  const end = performance.now();
  return end - start;
}

function testOptimized() {
  const start = performance.now();
  const playerColors = players.reduce((acc, p) => {
    acc[p.id] = p.color;
    return acc;
  }, {} as Record<string, string>);

  let dummy = '';
  for (const playerId of meeplePlayerIds) {
    dummy = playerColors[playerId] || '#fff';
  }
  const end = performance.now();
  return end - start;
}

console.log('Baseline:', testBaseline(), 'ms');
console.log('Optimized:', testOptimized(), 'ms');
