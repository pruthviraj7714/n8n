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
        message: "Credentials Not Found!",
      };
    }

    const { accessToken }: any = creds.data;

    await axios.get(
      `https://api.telegram.org/bot${accessToken}/sendMessage?chat_id=${node.data.chatId}&text=${node.data.message}`
    );

    return {
      success: true,
      message: "Message Successfully Sent on Telegram",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
