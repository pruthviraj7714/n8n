import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import prisma from "@repo/db";

const executionRouter = Router();

executionRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const workflowExecutions = await prisma.workflowExecution.findMany({
      where: {
        userId,
      },
      include: {
        nodes: true,
        workflow : {
            select : {
                title : true
            }
        }
      },
    });

    res.status(200).json(workflowExecutions || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default executionRouter;
