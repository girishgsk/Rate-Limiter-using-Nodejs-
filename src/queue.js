const Queue = require("bull");
const redis = require("redis");
const { logTaskCompletion } = require("./task");
const taskQueue = new Queue("task", "redis://127.0.0.1:6379");

// Connect to Redis for rate limiting
const rateLimiter = redis.createClient({
  host: "redis-server",
  port: 6379,
});

rateLimiter.connect();

taskQueue
  .process(async (job) => {
    const { user_id } = job.data;
    logTaskCompletion(user_id); // Log task details to file
    console.log(`${user_id} - queued Task processed at ${Date.now()}`);
    done();
  })
  .catch((err) => {
    console.log(err, "rateLimiter error");
  });

module.exports = { taskQueue };
