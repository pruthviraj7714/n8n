import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

const credentialRouter = Router();

credentialRouter.post("/", authMiddleware, (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

credentialRouter.delete("/", authMiddleware, (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default credentialRouter;
