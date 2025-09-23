import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  NodeSchema,
} from "@repo/common";
import prisma from "@repo/db";
import crypto from "crypto";
import { WEBHOOK_BASE_PATH } from "../config";
import workflowQueue from "../queue/workflowQueue";
import { Prisma } from "@repo/db/generated/prisma/client";

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

    const { connections, enabled, title, nodes } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let validNodes = 0;
    nodes.forEach((node) => {
      const { success, error } = NodeSchema.safeParse(node);
      if (success) validNodes += 1;
    });

    if (validNodes !== nodes.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid nodes provided",
      });
    }

    const triggerNode = nodes.find((n) => n.type === "TRIGGER");
    if (!triggerNode) {
      return res.status(400).json({
        success: false,
        message: "Trigger Node Not found!",
      });
    }

    const isTriggerNodeWithWebhook = triggerNode.triggerType === "WEBHOOK";
    const actionNodes = nodes.filter((n) => n.type === "ACTION");

    if (connections && connections.length > 0) {
      const nodeTempIds = nodes.map((n) => n.tempId);
      const invalidConnections = connections.filter(
        (conn) =>
          !nodeTempIds.includes(conn.sourceTempId) ||
          !nodeTempIds.includes(conn.targetTempId)
      );

      if (invalidConnections.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid connections: referenced nodes do not exist",
        });
      }
    }

    const workflow = await prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          userId,
          title,
          enabled,
        },
      });

      const nodeIdMapping : Record<string, string> = {};
      const createdNodes = [];

      const createdTriggerNode = await tx.node.create({
        data: {
          position: triggerNode.position,
          type: triggerNode.type,
          triggerType: triggerNode.triggerType,
          data: triggerNode.data || {},
          workflowId: workflow.id,
        },
      });

      nodeIdMapping[triggerNode.tempId] = createdTriggerNode.id;
      createdNodes.push(createdTriggerNode);

      if (isTriggerNodeWithWebhook) {
        const path = createRandomPathForWebhook();

        const webhook = await tx.webhook.create({
          data: {
            path,
            nodeId: createdTriggerNode.id,
            workflowId: workflow.id,
          },
        });
      }

      for (const actionNode of actionNodes) {
        const createdActionNode = await tx.node.create({
          data: {
            position: actionNode.position,
            type: actionNode.type,
            data: actionNode.data || {},
            workflowId: workflow.id,
            actionPlatform: actionNode.actionPlatform,
            action: actionNode.action || {},
          },
        });

        nodeIdMapping[actionNode.tempId] = createdActionNode.id;
        createdNodes.push(createdActionNode);
      }

      if (connections && connections.length > 0) {
        const connectionPromises = connections.map((conn) => {
          const sourceId = nodeIdMapping[conn.sourceTempId];
          const targetId = nodeIdMapping[conn.targetTempId];

          if (!sourceId || !targetId) {
            throw new Error(
              `Invalid connection mapping: ${conn.sourceTempId} -> ${conn.targetTempId}`
            );
          }

          return tx.connection.create({
            data: {
              sourceId,
              targetId,
              workflowId: workflow.id,
            },
          });
        });

        await Promise.all(connectionPromises);
      }

      const workflowWithData = await tx.workflow.findUnique({
        where: { id: workflow.id },
        include: {
          nodes: {
            include: {
              webhook: true,
              outgoingConnections: true,
              incomingConnections: true,
            },
          },
          connections: true,
        },
      });

      return workflowWithData;
    });

    res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      data: workflow,
    });
  } catch (error: any) {
    console.error("Error creating workflow:", error);

    if (error.message.includes("Invalid connection mapping")) {
      return res.status(400).json({
        success: false,
        message: "Invalid node connections",
        error: error.message,
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Duplicate constraint violation",
        error: "A unique constraint was violated",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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

    const workflows = await prisma.workflow.findMany({
      where: {
        userId,
      },
      include: {
        webhook: true,
        workflowExecutions: true,
        nodes: true,
        connections: true,
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
        workflowExecutions: true,
        connections : true,
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

workflowRouter.patch(
  "/toggle/:workflowId",
  authMiddleware,
  async (req, res) => {
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
  }
);

workflowRouter.put("/:workflowId", authMiddleware, async (req, res) => {
  try {
    const workflowId  = req.params.workflwoId as string;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
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

    const { title, enabled, nodes, connections, deletedNodeIds = [] } = validationResult.data;

    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: userId,
      },
      include: {
        nodes: true,
        connections: true,
      },
    });

    if (!existingWorkflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found or access denied",
      });
    }

    const nodeValidationErrors : any = [];
    nodes.forEach((node, index) => {
      const validation = NodeUnionSchema.safeParse(node);
      if (!validation.success) {
        nodeValidationErrors.push(`Node ${index}: ${validation.error.message}`);
      }
    });

    if (nodeValidationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid nodes provided",
        errors: nodeValidationErrors,
      });
    }

    // Validate connections reference valid nodes
    if (connections && connections.length > 0) {
      const nodeIds = nodes.map(n => n.id || n.tempId);
      const invalidConnections = connections.filter(conn => 
        !nodeIds.includes(conn.sourceTempId) || !nodeIds.includes(conn.targetTempId)
      );
      
      if (invalidConnections.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid connections: referenced nodes do not exist",
          invalidConnections,
        });
      }
    }

    const updatedWorkflow = await prisma.$transaction(async (tx) => {
      // 1. Update workflow basic info
      const workflow = await tx.workflow.update({
        where: { id: workflowId },
        data: {
          title,
          enabled,
        },
      });

      // 2. Handle deleted nodes if any
      if (deletedNodeIds && deletedNodeIds.length > 0) {
        // Delete connections first (foreign key constraints)
        await tx.connection.deleteMany({
          where: {
            OR: [
              { sourceId: { in: deletedNodeIds } },
              { targetId: { in: deletedNodeIds } }
            ]
          }
        });

        // Delete webhooks associated with deleted nodes
        await tx.webhook.deleteMany({
          where: {
            nodeId: { in: deletedNodeIds }
          }
        });

        // Delete the nodes
        await tx.node.deleteMany({
          where: { 
            id: { in: deletedNodeIds },
            workflowId: workflowId // Safety check
          }
        });
      }

      // 3. Process nodes - separate existing and new
      const nodeIdMapping = {};
      
      for (const nodeData of nodes) {
        if (nodeData.id) {
          // Update existing node
          const updatedNode = await tx.node.update({
            where: { id: nodeData.id },
            data: {
              position: nodeData.position,
              triggerType: nodeData.triggerType || null,
              actionPlatform: nodeData.actionPlatform || null,
              action: nodeData.action || {},
              data: nodeData.data || {},
            }
          });
          
          nodeIdMapping[nodeData.id] = updatedNode.id;
        } else if (nodeData.tempId) {
          // Create new node
          const newNode = await tx.node.create({
            data: {
              type: nodeData.type,
              position: nodeData.position,
              triggerType: nodeData.triggerType || null,
              actionPlatform: nodeData.actionPlatform || null,
              action: nodeData.action || {},
              data: nodeData.data || {},
              workflowId: workflowId,
            }
          });

          // Handle webhook for new trigger nodes
          if (nodeData.type === "TRIGGER" && nodeData.triggerType === "WEBHOOK") {
            const path = createRandomPathForWebhook();
            
            await tx.webhook.create({
              data: {
                path,
                nodeId: newNode.id,
                workflowId: workflowId,
              },
            });
          }
          
          nodeIdMapping[nodeData.tempId] = newNode.id;
        }
      }

      // 4. Recreate all connections (simpler than trying to update)
      // Delete existing connections for this workflow
      await tx.connection.deleteMany({
        where: { workflowId: workflowId }
      });

      // Create new connections
      if (connections && connections.length > 0) {
        const connectionPromises = connections.map(conn => {
          const sourceId = nodeIdMapping[conn.sourceTempId];
          const targetId = nodeIdMapping[conn.targetTempId];

          if (!sourceId || !targetId) {
            throw new Error(`Invalid connection mapping: ${conn.sourceTempId} -> ${conn.targetTempId}`);
          }

          return tx.connection.create({
            data: {
              sourceId,
              targetId,
              workflowId: workflowId,
            },
          });
        });

        await Promise.all(connectionPromises);
      }

      return await tx.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: {
            include: {
              webhook: true,
              outgoingConnections: true,
              incomingConnections: true,
            }
          },
          connections: true,
          webhook: true,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Workflow updated successfully",
      data: updatedWorkflow,
    });

  } catch (error : any) {
    console.error("Error updating workflow:", error);
    
    // Provide more specific error messages
    if (error.message.includes("Invalid connection mapping")) {
      return res.status(400).json({
        success: false,
        message: "Invalid node connections",
        error: error.message,
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Duplicate constraint violation",
        error: "A unique constraint was violated",
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        error: "One or more records could not be found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

    const existingWorkflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!existingWorkflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found or access denied",
      });
    }

    await prisma.workflow.delete({ where: { id: workflowId } });

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
