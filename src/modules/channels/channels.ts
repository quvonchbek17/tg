import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";

export class Channels {
  static async GetChannels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as String;
      let client = tgClient(sessionString);
      await client.connect();

      const dialogs = await client.getDialogs();
      const channels = dialogs
        .filter((el: any) => el.isChannel)
        .map((dialog: any) => ({
          id: dialog.id,
          name: dialog.title || dialog.name,
          type: "channel",
          unreadCount: dialog.unreadCount,
          photo: dialog.entity?.photo,
          date: dialog.date,
        }));

      res.status(200).send({
        success: true,
        data: channels,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { title, about } = req.body;

      const result = await client.invoke(
        new tgApi.channels.CreateChannel({
          title,
          about,
          broadcast: true,
        })
      );

      res.status(200).json({
        success: true,
        message: "Channel created successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, title, username } = req.body;

      // Kanalni olish
      let channel;
      try {
        channel = await client.getEntity(channelId);
      } catch (error) {
        throw new Error(
          "Could not find the channel. Please check the channelId."
        );
      }

      // Hozirgi ma'lumotlarni tekshirish
      const currentTitle = channel.title || "";

      // Sarlavhani o'zgartirish
      if (title && title !== currentTitle) {
        await client.invoke(
          new tgApi.channels.EditTitle({
            channel: channel,
            title,
          })
        );
      }

      // Public yoki Private qilish
      if (username) {
        // Public qilish uchun username o'rnatish
        await client.invoke(
          new tgApi.channels.UpdateUsername({
            channel: channel,
            username,
          })
        );
      } else {
        // Private qilish uchun username-ni o'chirish
        await client.invoke(
          new tgApi.channels.UpdateUsername({
            channel: channel,
            username: "", // Username-ni bo'sh qoldirish kanalni private qiladi
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Channel updated successfully",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId } = req.body;

      // Kanalni olish
      let channel;
      try {
        channel = await client.getEntity(channelId);
      } catch (error) {
        throw new Error(
          "Could not find the channel. Please check the channelId."
        );
      }

      const result = await client.invoke(
        new tgApi.channels.DeleteChannel({
          channel: channel,
        })
      );

      res.status(200).json({
        success: true,
        message: "Channel deleted successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
