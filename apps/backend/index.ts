import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

// Define a route handler for the root path
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
