import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { CredentialsSchema } from "@repo/common";
import prisma from "@repo/db";

const credentialRouter = Router();

credentialRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const parsed = CredentialsSchema.safeParse(req.body);

    if (parsed.error) {
      const formatted = parsed.error.flatten();

      res.status(400).json({
        message: "Invalid Inputs",
        fieldErrors: formatted.fieldErrors,
        formErrors: formatted.formErrors,
      });
      return;
    }

    const { data: credentialsData, platform, title } = parsed.data;

    await prisma.credentials.create({
      data: {
        data: credentialsData,
        platform,
        title,
        userId,
      },
    });

    res.status(201).json({
      message: "Credentials Successfully Stored",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

credentialRouter.delete("/", authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default credentialRouter;
