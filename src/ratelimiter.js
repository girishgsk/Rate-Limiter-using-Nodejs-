const redis = require("redis");
const Queue = require("bull");

const taskQueue = new Queue("task", "redis://127.0.0.1:6379");
const { logTaskCompletion } = require("./task");

// Connect to Redis for rate limiting
const rateLimiter = redis.createClient({
  host: "redis-server",
  port: 6379,
});

rateLimiter.connect();

const rateLimit = (user_id, res) => {
  const userKey = `rate_limit:${user_id}`;
  // rateLimiter.unlink(userKey, '')
  rateLimiter
    .get(userKey)
    .then((result) => {
      // console.log("result");
      const currentTime = Date.now();
      const minute = 60000; // 1 minute
      const reqPerMinute = 20; // 20 tasks per minute
      const second = 1000; // 1 seconds
      const reqPerSecond = 1; // task per 1 sec

      let taskData = result
        ? JSON.parse(result)
        : {
            count: 0,
            startTime: currentTime,
            globalCount: 0,
            globalTime: currentTime,
          };

      console.log(currentTime - taskData.globalTime, taskData.globalCount);
      if (currentTime - taskData.globalTime >= minute) {
        taskData.globalTime = currentTime;
        taskData.globalCount = 0;
      }

      if (
        reqPerMinute < taskData.globalCount ||
        currentTime - taskData.startTime <= second ||
        reqPerSecond < taskData.count
      ) {
        if (currentTime - taskData.startTime >= second) {
          taskData.startTime = currentTime;
          taskData.count = 0;
        } else {
          taskData.count++;
        }
        taskData.globalCount++;

        rateLimiter.set(userKey, JSON.stringify(taskData));
        taskQueue.add({ user_id });
        console.log(`Rate limit exceeded for ${user_id}`);
        res.status(200).send("Task added to queue girish");
      } else {
        taskData.startTime = currentTime;
        taskData.count = 0;
        taskData.globalCount++;
        rateLimiter.set(userKey, JSON.stringify(taskData));
        // Log task details to file
        logTaskCompletion(user_id);
        console.log(`${user_id} - else task completed at ${Date.now()}`);
        res.status(200).send(`Task completed at ${Date.now()}`);
      }
    })
    .catch((e) => {
      res.status(500).send(e);
    });
};

module.exports = { rateLimit };
