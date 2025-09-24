import { Worker } from "bullmq";
import redisclient from "@repo/redisclient";
import prisma from "@repo/db";
import { sendTelegramMessage } from "./actionNodes/telegram";
import { sendResendEmail } from "./actionNodes/resend";

type NodeResult = Record<string, any>;

const runWorkerFlow = async (workflowId: string, userId: string) => {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId },
      include: {
        nodes: true,
        webhook: true,
        connections: true,
      },
    });

    if (!workflow) {
      console.error("Workflow not found");
      return;
    }

    const { nodes, connections } = workflow;
    const triggerNode = nodes.find((n) => n.type === "TRIGGER");

    if (!triggerNode) {
      console.error("No trigger node found");
      return;
    }

    const results: Record<string, NodeResult> = {};
    const executed = new Set<string>();
    const queue: string[] = [triggerNode.id];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      console.log(`Executing node: ${JSON.stringify(node)} (${node.type})`);

      const output = await executeNode(node, results, userId);
      results[node.id] = output;
      executed.add(node.id);

      const outgoing = connections.filter((c) => c.sourceId === node.id);
      for (const conn of outgoing) {
        const targetParents = connections
          .filter((c) => c.targetId === conn.sourceId)
          .map((node) => node.sourceId);

        if (targetParents.every((pid) => executed.has(pid))) {
          queue.push(conn.targetId);
        }
      }
    }

    console.log("Workflow execution finished", results);
    return results;
  } catch (error) {
    console.error("Error in runWorkerFlow:", error);
  }
};

async function executeNode(
  node: any,
  results: Record<string, NodeResult>,
  userId: string
): Promise<any> {
  switch (node.type) {
    case "TRIGGER":
      return { triggered: true };

    case "ACTION": {
      switch (node.actionPlatform) {
        case "TELEGRAM":
          const res1 = await sendTelegramMessage(node, userId);
          return { success: res1.success, result: res1.message };

        case "RESEND":
          const res2 = await sendResendEmail(node, userId);
          return { success: res2.success, result: res2.message };
      }
      break;
    }

    default:
      console.warn(`Unknown node type: ${node.type}`);
      return {};
  }
}

const worker = new Worker(
  "workflow-executions",
  async (job) => {
    const { workflowId, userId } = job.data;
    console.log("Processing execution", workflowId, "for user", userId);
    await runWorkerFlow(workflowId, userId);
  },
  { connection: redisclient, concurrency: 50 }
);

worker.on("completed", (job) => {
  console.log("Workflow completed:", job.id);
});

worker.on("error", (error) => {
  console.error("Worker error:", error.message);
});
