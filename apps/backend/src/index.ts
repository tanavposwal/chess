import express from "express";
import v1Router from "./router/v1";
import cors from "cors";
import authRoute from "./router/auth";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/v1", v1Router);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Express Server is running on port - ${PORT}`);
});
