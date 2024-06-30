import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
const router = Router();

const JWT_SECRET = "secret";

interface User {
  name: string;
  email: string;
  password: string;
}

// req user -> { email, password }
router.post("/sign", async (req: Request, res: Response) => {
  const user: User = req.body.user;
  if (user && user.email != "" && user.password != "") {
    // Token is issued so it can be shared b/w HTTP and ws server
    // Todo: Make this temporary and add refresh logic here

    let userDb = await db.user.findFirst({
      where: {
        email: user.email,
        password: user.password,
      },
    });

    if (!userDb) {
      userDb = await db.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name,
        },
      });
    }

    const token = jwt.sign({ userId: userDb.id }, JWT_SECRET);

    res.json({ token, success: true });
  } else {
    res.json({ success: false });
  }
});

export default router;
