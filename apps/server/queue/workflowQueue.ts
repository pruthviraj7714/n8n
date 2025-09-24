import redisclient from "@repo/redisclient";
import { Queue } from "bullmq";


const workflowQueue = new Queue("workflow-executions", {
    connection: redisclient,
  });
  
  export default workflowQueue;