const { parentPort } = require("node:worker_threads");
const { fibonacchi } = require("./fibonacci.js");

parentPort.on("message", (n) => {
  const result = fibonacchi(n);
  parentPort.postMessage(result);
});
