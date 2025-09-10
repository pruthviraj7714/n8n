import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authToken = req.headers.authorization?.split(" ")[1];

    if (!authToken) {
      res.status(400).json({
        message: "Missing token",
      });
      return;
    }

    const user = jwt.verify(authToken, JWT_SECRET) as JwtPayload;

    req.userId = user.sub;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized User",
    });
  }
};

export default authMiddleware;
