import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";

export class Groups {

  static async GetGroups(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as String;
      let client = tgClient(sessionString);
      await client.connect();

      const dialogs = await client.getDialogs();

      const groups = dialogs.filter((el: any) => el.isChannel).map((dialog:any) => ({
        id: dialog.id,
        name: dialog.title || dialog.name,
        type: 'channel',
        unreadCount: dialog.unreadCount,
        photo: dialog.entity?.photo,
        date: dialog.date
      }));

      res.status(200).send({
        success: true,
        data: groups,
      });

    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async AddContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
        let sessionString = req.headers.string_session as string; // Asserting the type as string
        let client = tgClient(sessionString);
        await client.connect();

        let { username, phone, firstName, lastName, addPhonePrivacyException } = req.body;

        const result = await client.invoke(
          new tgApi.contacts.AddContact({
            id: username || null,
            phone: phone || "",
            firstName: firstName || "",
            lastName: lastName || "",
            addPhonePrivacyException: addPhonePrivacyException || false,
          })
        );

        res.status(200).json({
          success: true,
          message: "Contact added successfully",
          data: result
        });

        res.status(200).json({
            success: true,
            message: "Contact added successfully",
            data: result,
        });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async CreateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { title, userIds } = req.body;

      const result = await client.invoke(
        new tgApi.messages.CreateChat({
          title: title,
          users: userIds
        })
      );

      res.status(200).json({
        success: true,
        message: "Group created successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { id, title } = req.body;

      const result = await client.invoke(
        new tgApi.messages.EditChatTitle({
          chatId: id,
          title
        })
      );

      res.status(200).json({
        success: true,
        message: "Group title updated successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async DeleteGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { id } = req.body;

      const me = await client.getMe();

      const result = await client.invoke(
        new tgApi.messages.DeleteChatUser({
          chatId: id,
          userId: me.id
        })
      );

      res.status(200).json({
        success: true,
        message: "Group deleted successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
