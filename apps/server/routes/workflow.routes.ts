import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  ObjectIdSchema,
  NodeSchema,
} from "@repo/common";
import prisma from "@repo/db";
import crypto from "crypto";
import { WEBHOOK_BASE_PATH } from "../config";
import workflowQueue from "../queue/workflowQueue";

const workflowRouter = Router();

const createRandomPathForWebhook = (): string => {
  const randomId = crypto.randomUUID();
  return `${WEBHOOK_BASE_PATH}/${randomId}`;
};

workflowRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const validationResult = CreateWorkflowSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: validationResult.error.message,
      });
    }

    const { connections, enabled, title, nodes } = validationResult.data;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userIdValidation = ObjectIdSchema.safeParse(userId);
    if (!userIdValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    let validNodes = 0;

    nodes.forEach((node) => {
      const { success } = NodeSchema.safeParse(node);
      if (success) validNodes += 1;
    });

    if (validNodes !== nodes.length) {
      return res.status(400).json({
        message: "Invalid nodes provided",
      });
    }

    const triggerNode = nodes.find((n) => n.type === "TRIGGER");

    if (!triggerNode) {
      res.status(400).json({
        message: "Trigger Node Not found!",
      });
      return;
    }

    const isTriggerNodeWithWebhook = triggerNode.triggerType === "WEBHOOK";

    const actionNodes = nodes.filter((n) => n.type === "ACTION");

    const workflow = await prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          userId,
          title,
          enabled,
          connections,
        },
      });

      const tn = await tx.node.create({
        data: {
          position: triggerNode.position,
          type: triggerNode.type,
          triggerType: triggerNode.triggerType,
          data: triggerNode.data,
          workflowId: workflow.id,
        },
      });

      let webhookId;

      if (isTriggerNodeWithWebhook) {
        const path = createRandomPathForWebhook();

        const webhook = await tx.webhook.create({
          data: {
            path,
            nodeId: tn.id,
            workflowId: workflow.id,
          },
        });

        webhookId = webhook.id;
      }

      if (webhookId !== undefined) {
        await tx.node.update({
          where: {
            id: tn.id,
          },
          data: {
            webhook: { connect: { id: webhookId } },
          },
        });
      }

      const actions = await Promise.all(
        actionNodes.map((n) =>
          tx.node.create({
            data: {
              position: n.position,
              type: n.type,
              data: n.data,
              workflowId: workflow.id,
              actionPlatform: n.actionPlatform,
              action: n.action,
            },
          })
        )
      );

      const nodeIds = [tn.id, ...actions.map((ac) => ac.id)];

      await tx.workflow.update({
        where: {
          id: workflow.id,
        },
        data: {
          nodes: {
            connect: nodeIds.map((id) => ({ id })),
          },
        },
      });

      return workflow;
    });

    res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      data: workflow,
    });
  } catch (error) {
    console.error("Error creating workflow:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

workflowRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userIdValidation = ObjectIdSchema.safeParse(userId);
    if (!userIdValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const workflows = await prisma.workflow.findMany({
      where: {
        userId,
      },
      include: {
        webhook: true,
        worflowExecutions: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Workflows retrieved successfully",
      data: workflows,
    });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

workflowRouter.get("/:workflowId", authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
      },
      include: {
        nodes: true,
        worflowExecutions: true,
        webhook: true,
      },
    });

    if (!workflow) {
      res.status(400).json({
        message: "Workflow with given Id not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Workflow retrieved successfully",
      data: workflow || {},
    });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

workflowRouter.patch("/toggle/:workflowId", authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { enabled } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const workflow = await prisma.workflow.update({
      where: {
        id: workflowId,
        userId,
      },
      data: {
        enabled,
      },
    });

    res.status(200).json({
      success: true,
      message: "Workflow toggled successfully",
    });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    console.error("Error fetching workflow:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

workflowRouter.put("/:workflowId", authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const workflowIdValidation = ObjectIdSchema.safeParse(workflowId);
    if (!workflowIdValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid workflow ID format",
      });
    }

    const userIdValidation = ObjectIdSchema.safeParse(userId);
    if (!userIdValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const validationResult = UpdateWorkflowSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: validationResult.error.message,
      });
    }

    const updateData = validationResult.data;

    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: userId,
      },
    });

    if (!existingWorkflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found or access denied",
      });
    }

    const updatedWorkflow = await prisma.$transaction(async (tx) => {
      const wf = await tx.workflow.update({
        where: { id: workflowId },
        data: {
          title: updateData.title,
          enabled: updateData.enabled,
          connections: updateData.connections,
        },
      });

      if (updateData.nodes && updateData.nodes.length > 0) {
        for (const node of updateData.nodes) {
          const { success } = NodeSchema.safeParse(node);
          if (!success) {
            throw new Error("Invalid node data");
          }

          await tx.node.update({
            where: { id: node.id },
            data: {
              position: node.position,
              type: node.type,
              triggerType: node.triggerType,
              data: node.data,
              actionPlatform: node.actionPlatform,
              action: node.action,
            },
          });
        }
      }

      return tx.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: {
            include: { webhook: true },
          },
          webhook: true,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Workflow updated successfully",
      data: updatedWorkflow,
    });
  } catch (error) {
    console.error("Error updating workflow:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

workflowRouter.delete("/:workflowId", authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const workflowIdValidation = ObjectIdSchema.safeParse(workflowId);
    if (!workflowIdValidation.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid workflow ID format" });
    }

    const existingWorkflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!existingWorkflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found or access denied",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.node.deleteMany({ where: { workflowId } });
      await tx.workflowExecutions.deleteMany({ where: { workflowId } });
      await tx.workflow.delete({ where: { id: workflowId } });
    });

    res.status(200).json({
      success: true,
      message: "Workflow deleted successfully",
      data: { deletedWorkflowId: workflowId },
    });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

workflowRouter.post(
  "/execute-workflow/:workflowId",
  authMiddleware,
  async (req, res) => {
    const workflowId = req.params.workflowId;
    const userId = req.userId!;
    try {
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

      const job = await workflowQueue.add("execute-workflow", {
        workflowId,
        userId,
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
  }
);

export default workflowRouter;
