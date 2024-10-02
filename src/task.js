const fs = require("fs");
const path = require("path");

function logTaskCompletion(user_id) {
  const logMessage = `${user_id} - Task completed at ${new Date().toISOString()}\n`;
  const logFilePath = path.join(__dirname, "task_log.txt");

  // Append the log message to task_log.txt
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error logging task:", err);
    } else {
      console.log("Task logged successfully.");
    }
  });
}

module.exports = { logTaskCompletion };
