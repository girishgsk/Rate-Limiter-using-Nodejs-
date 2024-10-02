const cluster = require("cluster");
const numCPUs = require("os");
const app = require("./app");

const cores = numCPUs.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  for (let i = 0; i < cores; i++) {
    cluster.fork();
  }

  // For the Server faill the server will restart the server
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
