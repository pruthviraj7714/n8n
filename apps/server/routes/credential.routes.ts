import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { CreateCredentialsSchema, UpdateCredentialsSchema } from "@repo/common";
import prisma from "@repo/db";

const credentialRouter = Router();

credentialRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const creds = await prisma.credentials.findMany({
      where: {
        userId,
      },
    });

    res.status(200).json({
      creds: creds || [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

credentialRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const parsed = CreateCredentialsSchema.safeParse(req.body);

    if (parsed.error) {
      const formatted = parsed.error.flatten();

      res.status(400).json({
        message: "Invalid Inputs",
        fieldErrors: formatted.fieldErrors,
        formErrors: formatted.formErrors,
      });
      return;
    }

    const { data: credentialsData, platform } = parsed.data;

    const creds = await prisma.credentials.create({
      data: {
        data: credentialsData,
        platform,
        userId,
      },
    });

    res.status(201).json({
      message: "Credentials Successfully Stored",
      credential: creds,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

credentialRouter.put("/:credentialId", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const credentialId = req.params.credentialId;

    const cred = await prisma.credentials.findFirst({
      where : {
        userId,
        id : credentialId
      }
    });

    if(!cred) {
      res.status(400).json({
        message : "Credential With Given Id not found or denied access"
      });
      return;
    }

    const {data, success, error} = UpdateCredentialsSchema.safeParse(req.body);

    if (!success) {
      const formatted = error.flatten();

      res.status(400).json({
        message: "Invalid Inputs",
        fieldErrors: formatted.fieldErrors,
        formErrors: formatted.formErrors,
      });
      return;
    };

    const {  data : credsData } = data;

    const updatedCred = await prisma.credentials.update({
      where : {
        id : credentialId
      },
      data : {
        data : credsData
      }
    })

    res.status(200).json({
      message : "Credential Successfully Updated",
      cred : updatedCred
    })
  } catch (error) {
    res.status(500).json({
      message : "Internal Server Error"
    })
  }
})

credentialRouter.delete("/:credentialId", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const credentialId = req.params.credentialId as string;


    const cred = await prisma.credentials.findFirst({
      where : {
        userId,
        id : credentialId
      }
    });

    if(!cred) {
      res.status(400).json({
        message : "Credential With Given Id not found or denied access"
      });
      return;
    }

    await prisma.credentials.delete({
      where : {
        id : credentialId
      }
    });

    res.status(200).json({
      message : "Credential Successfully Deleted"
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default credentialRouter;
