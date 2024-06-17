// CPUに負荷をかけるような処理を想定
const fibonacchi = (n) => {
  if (n <= 1) return n;
  return fibonacchi(n - 1) + fibonacchi(n - 2);
};

module.exports = { fibonacchi };
