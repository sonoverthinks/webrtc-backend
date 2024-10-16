const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const port = 3000;

app.use(cors());
const PORT = process.env.PORT || port;

app.get("/", (req, res) => {
  res.send("Hello World there");
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
