import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import { Messages } from "../messages";
import { Api } from "telegram";

export class Chats {

  static async GetChats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as String;
      let client = tgClient(sessionString);
      await client.connect();

      const dialogs = await client.getDialogs();
      const chats = dialogs.filter((el:any) => el.isUser && !el.entity?.bot ).map((dialog:any) => ({
        id: dialog.id,
        name: dialog.title || dialog.name,
        unreadCount: dialog.unreadCount,
        photo: dialog.entity?.photo,
        date: dialog.date
      }));

      res.status(200).send({
        success: true,
        message: "Chatlar",
        data: chats,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetChatMessages(
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

  static async SendMessageToChat(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { chatId } = req.body

      let chat = await Messages.getPeer(client, chatId)

      await Messages.SendDinamicMessage(req, res, next, null, chat, false)
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

      let {chatId} = req.body

      let chat  = await Messages.getPeer(client, chatId)
      await Messages.DinamicEditMessage(req, res, next, null, chat, false)
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

      const { chatId, messageIds } = req.body;

      let chat = await Messages.getPeer(client, chatId)

      const result = await client.invoke(
        new tgApi.messages.DeleteMessages({
          peer: chat,
          id: messageIds,
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabarlar muvaffaqiyatli o'chirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteChatHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { chatId, forEveryone } = req.body;

      let user = await Messages.getPeer(client, chatId)
      const result = await client.invoke(
        new Api.messages.DeleteHistory({
          peer: user,
          revoke: forEveryone,
        })
      );

      res.status(200).json({
        success: true,
        message: "Tarix tozalandi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { chatId } = req.query;
      let chat = await Messages.getPeer(client, chatId)

      const result = await client.invoke(
        new Api.messages.GetCommonChats({
          userId: await client.getInputEntity(chatId),
          limit: 100
        })
      );

      let user = {
        ...chat,
        commonGroups: result?.chats || []
      }


      res.status(200).json({
        success: true,
        message: "User haqida batafsil ma'lumot",
        data: user,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateNotificationSettingsChatUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let {chatId} = req.body
      let chat  = await Messages.getPeer(client, chatId)
      await Messages.UpdateNotificationSettings(req, res, next, chat)
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
