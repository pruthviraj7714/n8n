import redisclient from "@repo/redisclient";
import { Router } from "express";

const streamRouter = Router();

streamRouter.get("/workflow/:workflowId", async (req, res) => {
  try {
    const workflowId = req.params.workflowId as string;
  
    const subscriber = await redisclient.duplicate();
    subscriber.subscribe(`workflow:${workflowId}`);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    subscriber.on("message", (channel, message) => {
      const msg = JSON.parse(message.toString());
      res.write(`data: ${JSON.stringify(msg)}\n\n`);
    });

    req.on("close", () => {
      subscriber.unsubscribe(`workflow:${workflowId}`);
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default streamRouter;
