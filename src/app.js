const express = require("express");
const { rateLimit } = require("./ratelimiter");

const port = process.env.PORT || 3000;

//------------app use ---------------
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello form the api side");
});

// Our task api routing
app.post("/task", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).send("user_id is required");

  //---The Rate Limit funtion is called from here----
  rateLimit(user_id, res);
});

// ///----------Listening app --------------
// app.listen(3000, () => {
//   console.log(`The app is listening on 3000 port `);
// });

module.exports = app;
