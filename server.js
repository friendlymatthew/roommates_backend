const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./db");
const client = require("./routes/api/client");
//const cluster = require("./routes/api/cluster");


const app = express();
const port = 5000;


app.use(express.urlencoded({extended: false}));
//makes app only parse JSON
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS, DELETE');
    next();
  });

app.use(morgan("dev"));
app.use(helmet());
connectDB();

app.use("/api/v1/client", client);
//app.use("/api/v1/cluster", cluster);

app.listen(port, () => console.log(`API Server listening on port ${port}`));