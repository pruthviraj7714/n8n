import prisma from "@repo/db";
import { Resend } from "resend";

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

export const sendResendEmail = async (
  node: INode,
  userId: string
): Promise<IResponse> => {
  try {
    console.log("Sending email with resend ...")
    const creds = await prisma.credentials.findFirst({
      where: {
        userId,
        platform: "RESEND",
      },
    });

    if (!creds) {
      return {
        success: false,
        message: "Credentials Not Found!",
      };
    }

    const { resendAPIKey }: any = creds.data;

    const resend = new Resend(resendAPIKey);

    const { data, error } = await resend.emails.send({
      from: `${node.data.from}`,
      to: [`${node.data.to}`],
      subject: `${node.data.subject}`,
      html: `${node.data.html}`,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: `Email Successfully Sent to ${node.data.to} - ${data.id}`,
    };
  } catch (error: any) {
    console.error(error.message);

    return {
      success: false,
      message: error.message,
    };
  }
};
