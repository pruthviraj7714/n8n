import redisclient from "@repo/redisclient";
import { Queue } from "bullmq";


const workflowQueue = new Queue("workflow-execution", {
    connection: redisclient,
  });
  
  export default workflowQueue;