const { Worker } = require("node:worker_threads");

class WorkerPool {
	#freeWorkers;
	#tasks;

	constructor(size) {
		this.#freeWorkers = [];
		this.#tasks = [];

		for (let i = 0; i < size; i++) {
			const worker = new Worker("./worker.js");
			this.#freeWorkers.push(worker);
		}
	}

	runTask(data) {
		return new Promise((resolve, reject) => {
			const task = { data, resolve, reject };
			if (this.#freeWorkers.length > 0) {
				this.#runTaskOnWorker(this.#freeWorkers.shift(), task);
			} else {
				this.#tasks.push(task);
			}
		});
	}

	close() {
		for (const worker of this.#freeWorkers) {
			worker.terminate();
		}
		this.#freeWorkers = [];
		this.#tasks = [];
	}

	#runTaskOnWorker(worker, task) {
		// 一度だけmessageをlistenする
		// workerで処理した内容を受け取る
		worker.once("message", (result) => {
			task.resolve(result);
			this.#freeWorkers.push(worker);
			if (this.#tasks.length > 0) {
				this.#runTaskOnWorker(worker, this.#tasks.shift());
			}
		});

		worker.once("error", (error) => {
			task.reject(error);
			this.#freeWorkers.push(worker);
		});

		worker.postMessage(task.data);
	}
}

module.exports = { WorkerPool };
