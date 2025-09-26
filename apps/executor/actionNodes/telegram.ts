import prisma from "@repo/db";
import axios from "axios";

interface IResponse {
  success: boolean;
  message: string;
}

interface INode {
  id: string;
  type: "TRIGGER" | "ACTION";
  triggerType: "MANUAL" | "WEBHOOK" | "CRON" | null;
  actionPlatform: "TELEGRAM" | "RESEND" | null;
  action: any;
  data: any;
  workflowId: string;
}

export const sendTelegramMessage = async (
  node: INode,
  userId: string
): Promise<IResponse> => {
  console.log("sending telegram message...");
  try {
    const creds = await prisma.credentials.findFirst({
      where: {
        userId,
        platform: "TELEGRAM",
      },
    });

    if (!creds) {
      return {
        success: false,
        message: "Telegram credentials not found. Please connect your account.",
      };
    }

    const { accessToken }: any = creds.data;

    const response = await axios.get(
      `https://api.telegram.org/bot${accessToken}/sendMessage`,
      {
        params: {
          chat_id: node.data.chatId,
          text: node.data.message,
        },
      }
    );

    if (!response.data.ok) {
      return {
        success: false,
        message: response.data.description || "Unknown error from Telegram API",
      };
    }

    return {
      success: true,
      message: "Message successfully sent on Telegram",
    };
  } catch (error: any) {
    if (error.response) {
      if (error.response.data?.description) {
        return {
          success: false,
          message: `Telegram API Error: ${error.response.data.description}`,
        };
      }
      return {
        success: false,
        message: `Telegram API Error: ${error.response.statusText}`,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "No response from Telegram. Please check your network or token.",
      };
    } else {
      return {
        success: false,
        message: `Unexpected error: ${error.message}`,
      };
    }
  }
};
