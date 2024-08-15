import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";

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
        data: chats,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

}
