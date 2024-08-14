import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import {CustomFile}  from "telegram/client/uploads"
import { Api } from "telegram"
import path from "path"
import fs from "fs"

export class Channels {

  static async checkChannelType(client: any, groupId: string) {
    let chat
      try {
        chat = await client.invoke(
          new tgApi.messages.GetChats({
            id: [groupId]
          })
        );
      } catch (error) {
        chat = await client.getEntity("-"+groupId)
      }

    if (chat.chats?.length === 0 && chat.chats) {
      throw new ErrorHandler("Kanal topilmadi", 404);
    }

    const channel = chat.chats ? chat.chats[0]: chat;
    if (channel.className !== "Channel" || channel.megagroup === true) {
      throw new ErrorHandler("Bu id kanalga tegishli emas", 400);
    }

    return channel;
  }

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

  static async AddUserToChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, userIds } = req.body;

      const channel = await client.getEntity("-"+channelId);


      //Kanal turini tekshirish
      if (channel.className === "Channel") {
        const result = await client.invoke(
          new tgApi.channels.InviteToChannel({
            channel,
            users: userIds,
          })
        );

        res.status(200).json({
          success: true,
          message: "Foydalanuvchi kanalga muvaffaqiyatli qo'shildi",
          data: result,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async BlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, userId } = req.body;

      // Get the InputChannel object for the group (channel)
      const channel = await client.getEntity("-"+channelId);

      if(channel.className === "Channel"){
        const result = await client.invoke(
          new tgApi.channels.EditBanned({
            channel: channel, // Passing the correct InputChannel object
            participant: userId,
            bannedRights: new tgApi.ChatBannedRights({
              viewMessages: true,
              sendMessages: true,
              sendMedia: true,
              sendStickers: true,
              sendGifs: true,
              sendGames: true,
              sendInline: true,
              sendPolls: true,
              changeInfo: true,
              inviteUsers: true,
              pinMessages: true,
              untilDate: 0,
            }),
          })
        );

        res.status(200).json({
          success: true,
          message: "Foydalanuvchi kanalda blocklandi",
          data: result,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetBlockedUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, page, limit } = req.query;
      const channel = await client.getEntity("-"+channelId);

      if(channel.className === "Channel"){
        let customPage = Number(page) ? Number(page) : 1
        let customLimit = Number(limit) ? Number(limit) : 100

        const result = await client.invoke(
          new Api.channels.GetParticipants({
            channel,
            filter: new Api.ChannelParticipantsBanned({q:""}),
            offset: (customPage-1) * customLimit,
            limit: customLimit
          })
        );
        res.status(200).json({
          success: true,
          message: "Blocklangan foydalanuvchilar ro'yhati olindi",
          data: result.participants,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, page, limit } = req.query;
      const channel = await client.getEntity("-"+channelId);

      if(channel.className === "Channel"){
        let customPage = Number(page) ? Number(page) : 1
        let customLimit = Number(limit) ? Number(limit) : 100

        const result = await client.invoke(
          new tgApi.channels.GetParticipants({
            channel,
            filter: new tgApi.ChannelParticipantsRecent(),
            offset: (customPage-1)*customLimit,
            limit: customLimit,
            hash: BigInt(-Math.floor(Math.random() * 1e18)),
          })
        );
        res.status(200).json({
          success: true,
          message: "Kanal a'zolari",
          data: result.users,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CheckUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, username } = req.body;
      const channel = await client.getEntity("-"+channelId);

      if(channel.className === "Channel"){
        const result = await client.invoke(
          new Api.channels.CheckUsername({
            channel: channel,
            username: username,
          })
        );

        res.status(result ? 200: 409).json({
          success: result,
          message: result ? "username bo'sh": "allaqachon foydalanilgan",
          isAvailable: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, username } = req.body;
      const channel = await client.getEntity("-"+channelId);

      if(channel.className === "Channel"){
        const result = await client.invoke(
          new Api.channels.CheckUsername({
            channel,
            username,
          })
        );

        if(result){
          const result = await client.invoke(
            new tgApi.channels.UpdateUsername({
              channel,
              username,
            })
          )

          res.status(200).json({
            success: true,
            message: "username almashtirildi",
            data: result,
          });

        } else {
          res.status(409).json({
            success: false,
            message: "bu username band"
          });
        }

      } else {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetChannelMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string; // Sessiya stringini olish
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, offset, limit } = req.query;

      const channel = await client.getEntity("-" + channelId);

      if (channel.className !== "Channel") {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
        return
      }

      const customOffset = Number(offset) || 0;
      const customLimit = Number(limit) || 10;

      const result = await client.invoke(
        new tgApi.messages.GetHistory({
          peer: channel,
          offsetId: customOffset,
          limit: customLimit
        })
      );

      res.status(200).json({
        success: true,
        message: "Kanal xabarlari olindi",
        data: result.messages,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async UpdateChannelPhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string; // Sessiya stringini olish
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId } = req.body;
      const file = req.file as  Express.Multer.File | undefined;

      const channel = await Channels.checkChannelType(client, channelId);


      if (channel.className !== "Channel") {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
        return
      }

      if (!file) {
        res.status(400).json({
          success: false,
          message: "File mavjud emas",
        });
        return
      }

      const filePath = path.join(process.cwd(), "uploads", file.fieldname);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, filePath),
        workers: 1,
      });

      const result = await client.invoke(
        new Api.channels.EditPhoto({
          channel,
          photo: inputFile
        })
      );

      res.status(200).json({
        success: true,
        message: "Kanal rasmi almashtirildi",
        data: result.messages,
      });
      fs.unlink(filePath, (err) => {})
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
