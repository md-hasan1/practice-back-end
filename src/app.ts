import express, { Application, NextFunction, Request, Response } from "express";
import axios from "axios";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import catchAsync from "./shared/catchAsync";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";




const app: Application = express();
export const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.set("views", "./src/views");
// Route handler for root endpoint
app.get("/", (req: Request, res: Response) => {
res.render("index.ejs");
});

// Router setup
app.use("/api/v1", router);
app.use("/api/v2",(req,res)=>{
  res.render("test/page.ejs");
})


// Error handling middleware
app.use(GlobalErrorHandler);

// cron.schedule('* * * * *', () => {
//   console.log(`[${new Date().toISOString()}] 🛠️ CRON JOB RUNNING EVERY MINUTE!`);
//   // Your logic here
// });


// Not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;

// mistralai()









