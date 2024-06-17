const { WorkerPool } = require("./WorkerPool.js");
const { performance, PerformanceObserver } = require("node:perf_hooks");
const { fibonacchi } = require("./fibonacci.js");

const obs = new PerformanceObserver((items) => {
  const entry = items.getEntries()[0];
  console.log(`${entry.name}: ${entry.duration.toFixed(3)}ms`);
});
obs.observe({ entryTypes: ["measure"] });

const runWithoutWorkers = (numbers) => {
  performance.mark("withoutWorkers-start");

  for (const n of numbers) {
    const result = fibonacchi(n);
    console.log(`withoutWorkers: Fibonacci(${n}) = ${result}`);
  }
  performance.mark("withoutWorkers-end");
  performance.measure(
    "withoutWorkers",
    "withoutWorkers-start",
    "withoutWorkers-end",
  );
};

const runWithWorkers = async (numbers) => {
  performance.mark("withWorkers-start");

  const pool = new WorkerPool(4);

  const tasks = numbers.map((n) => pool.runTask(n));
  const results = await Promise.all(tasks);
  pool.close();

  performance.mark("withWorkers-end");
  performance.measure("withWorkers", "withWorkers-start", "withWorkers-end");

  for (const [index, result] of Object.entries(results)) {
    console.log(`withWorkers: Fibonacci(${index}) = ${result}`);
  }
};

const main = async () => {
  const numbers = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39];

  console.log("Running benchmark without Worker Threads...");
  runWithoutWorkers(numbers);

  console.log("\nRunning benchmark with Worker Threads...");
  await runWithWorkers(numbers);
};

main();
