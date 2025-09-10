import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

const workflowRouter = Router();

workflowRouter.post("/", authMiddleware, async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

workflowRouter.get("/", authMiddleware, async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

workflowRouter.get("/:workflowId", authMiddleware, async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

workflowRouter.put("/:workflowId", authMiddleware, async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default workflowRouter;
