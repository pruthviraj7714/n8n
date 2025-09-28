import prisma from "@repo/db";
import { Router } from "express";
import workflowQueue from "../queue/workflowQueue";

const webhookRouter = Router();

webhookRouter.post("/:webhookId", async (req, res) => {
  try {
    const webhookId = req.params.webhookId;

    const isWebhookExists = await prisma.webhook.findUnique({
      where: {
        id: webhookId,
      },
    });

    if (!isWebhookExists) {
      res.status(400).json({
        message: "webhook not found!",
      });
      return;
    }

    const workflowId = isWebhookExists.workflowId;

    const isWorkFlowExists = await prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
    });

    if (!isWorkFlowExists) {
      res.status(400).json({
        message: "Workflow Not found!",
      });
      return;
    }

    if (!isWorkFlowExists.enabled) {
      res.status(403).json({
        message: "This workflow is currently disabled. Please enable it to proceed."
      });
      return;
    }

    const job = await workflowQueue.add("execute-workflow", {
      workflowId,
    });

    res.status(200).json({
      message: "Workflow queued for execution",
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default webhookRouter;
