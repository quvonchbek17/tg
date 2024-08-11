import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";

export class SavedMessages {

  static async GetSavedMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { limit } = req.query;
      const result = await client.invoke(
        new tgApi.messages.GetHistory({
          peer: new tgApi.InputPeerSelf(),
          limit: Number(limit) || 20,
        })
      );

      res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { message } = req.body;

      const result = await client.invoke(
        new tgApi.messages.SendMessage({
          peer: new tgApi.InputPeerSelf(),
          message: message,
          randomId: BigInt(-Math.floor(Math.random() * 1e18)),
        })
      );

      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { messageId, message } = req.body;

      const result = await client.invoke(
        new tgApi.messages.EditMessage({
          peer: new tgApi.InputPeerSelf(),
          id: messageId,
          message: message,
        })
      );

      res.status(200).json({
        success: true,
        message: "Message updated successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { messageId } = req.body;

      const result = await client.invoke(
        new tgApi.messages.DeleteMessages({
          id: [messageId],
          revoke: true, // Bu parametr o'chirilishi mumkinligini bildiradi
        })
      );
      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
