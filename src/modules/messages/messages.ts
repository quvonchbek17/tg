import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";


export class Messages {

  static async GetMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { chatId } = req.query;
      const messages = await client.getMessages(chatId as string);
      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SendMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { chatId, text } = req.body;

      const result = await client.sendMessage(chatId, { message: text });

      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async EditMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { chatId, messageId, text } = req.body;

      //Bu joyida faqat o'zini xabarlarini update qilolishi kerakligini tekshirish (oxiriga yetmadi)

    //   const me = await client.getMe();
    //   const message = (await client.getMessages(chatId)).find((el: any) => el.id == messageId);

    //   if(me.id?.value !== message.fromId?.userId?.value){
    //      throw new Error("Bu xabar sizniki emas!")
    //   }

      const result = await client.invoke(
        new tgApi.messages.EditMessage({
          peer: chatId,
          id: messageId,
          message: text,
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

  static async DeleteMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { chatId, messageId } = req.body;

      const result = await client.invoke(
        new tgApi.messages.DeleteMessages({
          peer: chatId,
          id: [messageId],
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
