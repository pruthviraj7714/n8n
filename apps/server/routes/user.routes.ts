import { Router } from "express";
import { hash, compare } from "bcrypt";
import prisma from "@repo/db";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { LoginSchema, RegisterSchema } from "@repo/common";

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  try {
    const { data, success, error } = RegisterSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Validation Failed",
        error: error.message,
      });
      return;
    }

    const { email, password, username } = data;

    const isEmailOrUsernameAlreadyExists = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          { username },
        ],
      },
    });

    if (isEmailOrUsernameAlreadyExists) {
      res.status(409).json({
        message: "User with given email or username already exists",
      });
      return;
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });

    res.status(201).json({
      message: "User Account Successfully Created",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { data, success, error } = LoginSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Validation Failed",
        error: error.message,
      });
      return;
    }

    const { password, username } = data;

    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      res.status(400).json({
        message: "User with given username doesn't exist",
      });
      return;
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      res.status(400).json({
        message: "Incorrect Password",
      });
      return;
    }

    const jwt = sign(
      {
        sub: user.id,
      },
      JWT_SECRET
    );

    res.status(200).json({
      message: "User Successfully Logged In",
      jwt,
      id: user.id,
      user: {
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default userRouter;
