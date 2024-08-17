import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import { CustomFile } from "telegram/client/uploads";
import { Api } from "telegram";
import path from "path";
import fs from "fs";
import { Groups } from "../groups";
import bigInt from "big-integer";

export class Channels {
  static async checkChannelType(client: any, channelId: string) {
    let chat;
    try {
      chat = await client.invoke(
        new tgApi.messages.GetChats({
          id: [channelId],
        })
      );
    } catch (error) {
      chat = await client.getEntity("-" + channelId);
    }

    if (chat.chats?.length === 0 && chat.chats) {
      throw new ErrorHandler("Kanal topilmadi", 404);
    }

    const channel = chat.chats ? chat.chats[0] : chat;
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
        .filter((el: any) => el.isChannel && !el.isGroup)
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
      let channel = await Channels.checkChannelType(client, channelId);

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

  static async AddUserToChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, userIds } = req.body;

      const channel = await client.getEntity("-" + channelId);

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

  static async BlockUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, userId } = req.body;

      // Get the InputChannel object for the group (channel)
      const channel = await client.getEntity("-" + channelId);

      if (channel.className === "Channel") {
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

  static async GetBlockedUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, page, limit } = req.query;
      const channel = await client.getEntity("-" + channelId);

      if (channel.className === "Channel") {
        let customPage = Number(page) ? Number(page) : 1;
        let customLimit = Number(limit) ? Number(limit) : 100;

        const result = await client.invoke(
          new Api.channels.GetParticipants({
            channel,
            filter: new Api.ChannelParticipantsBanned({ q: "" }),
            offset: (customPage - 1) * customLimit,
            limit: customLimit,
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

  static async GetUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, page, limit } = req.query;
      const channel = await Channels.checkChannelType(client, String(channelId));

      let customPage = Number(page) ? Number(page) : 1;
        let customLimit = Number(limit) ? Number(limit) : 100;

        const result = await client.invoke(
          new tgApi.channels.GetParticipants({
            channel,
            filter: new tgApi.ChannelParticipantsRecent(),
            offset: (customPage - 1) * customLimit,
            limit: customLimit,
            hash: BigInt(-Math.floor(Math.random() * 1e18)),
          })
        );
        res.status(200).json({
          success: true,
          message: "Kanal a'zolari",
          data: result.users,
        });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetChannelUserInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, userId } = req.query;

      const channel = await Channels.checkChannelType(client, String(channelId));
      const result = await client.invoke(
        new Api.channels.GetParticipant({
          channel: channel,
          participant: String(userId),
        })
      );
        res.status(200).json({
          success: true,
          message: "Kanal a'zosi haqida ma'lumot",
          data: result.participant,
        });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetChannelInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId } = req.query;

      await Channels.checkChannelType(client, String(channelId));

      const result = await client.invoke(
        new Api.channels.GetFullChannel({
          channel: String(channelId),
        })
      );

      res.status(200).json({
        success: true,
        message: "Kanal ma'lumotlari olindi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CheckUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, username } = req.body;
      const channel = await client.getEntity("-" + channelId);

      if (channel.className === "Channel") {
        const result = await client.invoke(
          new Api.channels.CheckUsername({
            channel: channel,
            username: username,
          })
        );

        res.status(result ? 200 : 409).json({
          success: result,
          message: result ? "username bo'sh" : "allaqachon foydalanilgan",
          isAvailable: result,
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

  static async UpdateUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, username } = req.body;
      const channel = await client.getEntity("-" + channelId);

      if (channel.className === "Channel") {
        const result = await client.invoke(
          new Api.channels.CheckUsername({
            channel,
            username,
          })
        );

        if (result) {
          const result = await client.invoke(
            new tgApi.channels.UpdateUsername({
              channel,
              username,
            })
          );

          res.status(200).json({
            success: true,
            message: "username almashtirildi",
            data: result,
          });
        } else {
          res.status(409).json({
            success: false,
            message: "bu username band",
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
        return;
      }

      const customOffset = Number(offset) || 0;
      const customLimit = Number(limit) || 10;

      const result = await client.invoke(
        new tgApi.messages.GetHistory({
          peer: channel,
          offsetId: customOffset,
          limit: customLimit,
        })
      );

      const channelFull = await client.invoke(
        new Api.channels.GetFullChannel({
          channel: channel.id,
        })
      );

      let messagedWithDiscussion = [];
      channelFull.linkedChatId?.value;

      if (channelFull.fullChat?.linkedChatId) {
        const discussionChat = await Groups.checkGroupType(
          client,
          channelFull.fullChat.linkedChatId?.value
        );

        for (let message of result.messages) {
          const discussionMessages = await client.getMessages(discussionChat, {
            reply_to_msg_id: message.id,
          });

          messagedWithDiscussion.push({
            ...message,
            discussionMessages,
          });
        }
      }
      res.status(200).json({
        success: true,
        message: "Kanal xabarlari olindi",
        data: channelFull.fullChat?.linkedChatId
          ? messagedWithDiscussion
          : result.messages,
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
      const file = req.file as Express.Multer.File | undefined;

      const channel = await Channels.checkChannelType(client, channelId);

      if (channel.className !== "Channel") {
        res.status(400).json({
          success: false,
          message: "Bu kanal emas",
        });
        return;
      }

      if (!file) {
        res.status(400).json({
          success: false,
          message: "File mavjud emas",
        });
        return;
      }

      const filePath = path.join(process.cwd(), "uploads", file.fieldname);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, filePath),
        workers: 1,
      });

      const result = await client.invoke(
        new Api.channels.EditPhoto({
          channel,
          photo: inputFile,
        })
      );

      res.status(200).json({
        success: true,
        message: "Kanal rasmi almashtirildi",
        data: result.messages,
      });
      fs.unlink(filePath, (err) => {});
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, forEveryone } = req.body;

      let channel = await Channels.checkChannelType(client, channelId);

      let result = await client.invoke(
        new Api.channels.DeleteHistory({
          channel,
          forEveryone: forEveryone,
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

  static async DeleteMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, messageIds } = req.body;

      let channel = await Channels.checkChannelType(client, channelId);

      const result = await client.invoke(
        new Api.channels.DeleteMessages({
          channel: channel,
          id: messageIds,
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabarlar o'chirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetGroupsForDiscussion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const result = await client.invoke(
        new Api.channels.GetGroupsForDiscussion()
      );

      res.status(200).json({
        success: true,
        message: "Muhokama uchun mavjud guruhlar",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SetDiscussionGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { channelId, groupId } = req.body;

      let channel = await Channels.checkChannelType(client, channelId);
      let group = await Groups.checkGroupType(client, groupId);
      const result = await client.invoke(
        new Api.channels.SetDiscussionGroup({
          broadcast: channel,
          group: group,
        })
      );

      res.status(200).json({
        success: true,
        message: "Kanal muhokama guruhi biriktirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetMessageLink(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { channelId, messageId } = req.query;

      let channel = await Channels.checkChannelType(client, String(channelId));

      const result = await client.invoke(
        new Api.channels.ExportMessageLink({
          channel: channel,
          id: Number(messageId),
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabar linki",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async JoinChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { username } = req.body;

      const result = await client.invoke(
        new Api.channels.JoinChannel({
          channel: username,
        })
      );

      res.status(200).json({
        success: true,
        message: "Kanalga qo'shildingiz",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async LeaveChannel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { channelId } = req.body;

      let channel = await Channels.checkChannelType(client, channelId);

      const result = await client.invoke(
        new Api.channels.LeaveChannel({
          channel,
        })
      );

      res.status(200).json({
        success: true,
        message: "Kanaldan chiqarildingiz",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateChannelAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { channelId, userId, adminRights } = req.body;

      let channel = await Channels.checkChannelType(client, channelId);

      let result = await client.invoke(
        new Api.channels.EditAdmin({
          channel,
          userId,
          adminRights: new Api.ChatAdminRights({
            ...adminRights,
          }),
          rank: adminRights.adminName,
        })
      );

      res.status(200).json({
        success: true,
        message: "Admin ma'lumotlari saqlandi",
        data: result,
      });
    } catch (error: any) {
      if (error.message.includes("CHAT_ABOUT_NOT_MODIFIED")) {
        next(
          new ErrorHandler(
            "About eski ma'lumot bilan bir xil. O'zgartiring",
            403
          )
        );
        return;
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async MarkAsReadChannelMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { channelId, messageIds } = req.body;

      let channel = await Channels.checkChannelType(client, channelId);

      const result = await client.invoke(
        new Api.channels.ReadMessageContents({
          channel: channel,
          id: messageIds,
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabarlar o'qilgan deb belgilandi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetAdminLog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { channelId, limit } = req.query;

      let channel = await Channels.checkChannelType(client, String(channelId));

      const result = await client.invoke(
        new Api.channels.GetAdminLog({
          channel,
          q: "",
          limit: Number(limit),
          eventsFilter: new Api.ChannelAdminLogEventsFilter({
            join: true,
            leave: true,
            invite: true,
            ban: true,
            unban: true,
            kick: true,
            unkick: true,
            promote: true,
            demote: true,
            info: true,
            settings: true,
            pinned: true,
            groupCall: true,
            invites: true,
            send: true,
          }),
        })
      );

      res.status(200).json({
        success: true,
        message: "Admin loglari olindi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetInActiveChannels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const result = await client.invoke(
        new Api.channels.GetInactiveChannels()
      );

      let channels = result.chats?.filter(
        (el: any) => !el.megagroup && !el.gigagroup
      );

      res.status(200).json({
        success: true,
        message: "Faol bo'lmagan kanallar",
        data: channels,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetAdminedPublicChannels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const result = await client.invoke(
        new Api.channels.GetAdminedPublicChannels({})
      );

      res.status(200).json({
        success: true,
        message: "Siz admin bo'lgan kanallar",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetSponsoredMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { channelId } = req.query

      let channel = await Channels.checkChannelType(client, String(channelId))

      const result = await client.invoke(
        new Api.channels.GetSponsoredMessages({
          channel
        })
      );

      res.status(200).json({
        success: true,
        message: "Sponsor xabarlari",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async ReadMessageContents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { channelId, messageIds } = req.body

      let channel = await Channels.checkChannelType(client, String(channelId))

      const result = await client.invoke(
        new Api.channels.ReadMessageContents({
          channel: channel,
          id: messageIds,
        })
      );

      res.status(200).json({
        success: true,
        message: "O'qilgan deb belgilandi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
