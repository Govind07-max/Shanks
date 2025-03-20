import express from "express";
import cors from "cors";
import chatbotRouter from "./routes/api.js";

const app = express();

app.use(express.json());
app.use(cors());


app.use("/api", chatbotRouter);

export default app;