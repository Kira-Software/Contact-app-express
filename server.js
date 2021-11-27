const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const signuphandler = require("./Controller/signuphandler");
// const newsignup = require("./Controller/newsignup");

const signuphandler = require("./Handler/signup");
const loginhandler = require("./Handler/login");

//app.use(cors());
require("dotenv").config();
const app = express();

app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => res.send("Welcome to my server"));

app.post("/signup", signuphandler);
app.post("/login", loginhandler);


app.listen(process.env.PORT, () =>
  console.log(`server Listening! ON port`, process.env.PORT)
);
