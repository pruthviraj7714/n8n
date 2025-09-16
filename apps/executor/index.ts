import { Worker } from "bullmq";
import redisclient from "@repo/redisclient";

const worker = new Worker(
  "workflow-executions",
  async (job) => {
    const { executionId } = job.data;

    console.log("Processing execution", executionId);
  },
  { connection: redisclient }
);

worker.on("completed", (job, result, prev) => {});

worker.on("error", (error) => {
  console.error(error.message);
});
