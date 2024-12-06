const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const cluster = require("cluster");
const os = require("os");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const app = express();
const taskRoutes = require('./Routes/taskRoutes')

const numCPUs = os.cpus().length;
dotenv.config();

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker dies, log and start a new worker
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
    cluster.fork();
  });
} else {
  app.use(express.json());

  app.use(helmet());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
  app.use(limiter);


  // Throttling with express-slow-down
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Start slowing down after 50 requests
    delayMs: () => 500 // Add 500ms delay per request after the limit is reached
  });
  app.use(speedLimiter);


  // Prevent MIME-sniffing
  app.use(helmet.noSniff());


  // Clickjacking protection
  app.use(helmet.frameguard({ action: 'deny' }));


  // Cross-Origin Resource Sharing (CORS)
  const corsOptions = {
    origin: process.env.scoutreachDomain,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
  };
  app.use(cors(corsOptions));




  // Enforce HTTPS
  app.use(
    helmet.hsts({
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    })
  );


  // MongoDB connection
  mongoose.connect(process.env.mongoDB)
    .then(() => console.log("MongoDB is connected."))
    .catch((err) => console.log(err));


  // Routes
  app.use("/taskflow", taskRoutes);


  // Error Handler to Prevent Full Path Disclosure
  app.use((err, req, res, next) => {
    console.error(err); 
    return res.status(500).send("An error occurred. Please try again later.");
  });


  // Start server
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Express app running on port 3000`);
  });
};


