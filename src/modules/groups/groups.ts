import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import { Api } from "telegram";
import { CustomFile } from "telegram/client/uploads";
import path from "path"
import * as fs from "fs"
import bigInt from "big-integer";
import { Messages } from "../messages";

export class Groups {
  // Guruh turi (oddiy yoki superguruh) ekanligini tekshirish uchun yordamchi funksiya
  static async checkGroupType(client: any, groupId: string) {
    let chat;
    try {
      chat = await client.invoke(
        new tgApi.messages.GetChats({
          id: [groupId],
        })
      );
    } catch (error) {
      chat = await client.getEntity("-" + groupId);
    }

    if (chat.chats?.length === 0 && chat.chats) {
      throw new ErrorHandler("Guruh topilmadi", 404);
    }

    const group = chat.chats ? chat.chats[0] : chat;
    if (group.className === "Channel" && group.megagroup !== true) {
      throw new ErrorHandler("Kanal uchun amal qilmaydi", 400);
    }

    return group;
  }

  static async checkAdmin(client: any, groupId: string): Promise<any> {
    const me = await client.getMe();

    let group = await Groups.checkGroupType(client, groupId)

    let result;
      if (group.className === "Channel" && group.megagroup) {
        result = await client.invoke(
          new Api.channels.GetParticipants({
            channel: groupId,
            filter: new Api.ChannelParticipantsAdmins(),
            limit: 200  // Adminlar uchun cheklov
          })
        )
        let users = result.users

        return users.some((el: any) => el.id?.value === me.id?.value);
      } else if (group.className === "Chat") {
        result = await client.getParticipants(groupId);
        return result.some(
          (el: any) => el.id?.value === me.id?.value && (el.participant?.className === "ChatParticipantAdmin" || el.participant?.className === "ChatParticipantCreator")
        );
      }


  }

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

      const groups = dialogs
        .filter((el: any) => el.isGroup)
        .map((dialog: any) => ({
          id: dialog.id,
          name: dialog.title || dialog.name,
          type: "group",
          unreadCount: dialog.unreadCount,
          photo: dialog.entity?.photo,
          date: dialog.date,
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

      let { username, phone, firstName, lastName, addPhonePrivacyException } =
        req.body;

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
        data: result,
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

  static async CreateGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { title, userIds } = req.body;

      const result = await client.invoke(
        new tgApi.messages.CreateChat({
          title: title,
          users: userIds,
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

  static async UpdateGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { id, title } = req.body;

      const result = await client.invoke(
        new tgApi.messages.EditChatTitle({
          chatId: id,
          title,
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

  static async DeleteGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { id } = req.body;

      const me = await client.getMe();

      const result = await client.invoke(
        new tgApi.messages.DeleteChatUser({
          chatId: id,
          userId: me.id,
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

  static async SendMessageToGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId } = req.body;

      let group = await Groups.checkGroupType(client, groupId)

      await Messages.SendDinamicMessage(req, res, next, group, null, false)
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetGroupMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, limit = 100, page = 1 } = req.query;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result = await client.invoke(
        new tgApi.messages.GetHistory({
          peer: groupId,
          offset_id: (Number(page) - 1) * Number(limit),
          limit: Number(limit),
        })
      );

      res.status(200).json({
        success: true,
        data: result.messages,
      });
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

      const { groupId, userId } = req.body;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result;

      if (group.className === "Channel" && group.megagroup) {
        result = await client.invoke(
          new tgApi.channels.EditBanned({
            channel: group,
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
      } else if (group.className === "Chat") {
        result = await client.invoke(
          new tgApi.messages.DeleteChatUser({
            chatId: groupId,
            userId,
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Foydalanuvchi muvaffaqiyatli blocklandi",
        data: result,
      });
    } catch (error: any) {
      if (error.message.includes("USER_NOT_PARTICIPANT")) {
        next(new ErrorHandler("Bu user guruh a'zosi emas", 400));
        return;
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }
  // UnBlock User
  static async UnBlockUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, userId } = req.body;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result;

      if (group.className === "Channel" && group.megagroup) {
        result = await await client.invoke(
          new tgApi.channels.EditBanned({
            channel: groupId,
            userId: userId,
            bannedRights: new tgApi.ChatBannedRights({
              viewMessages: false,
              sendMessages: false,
              sendMedia: false,
              sendStickers: false,
              sendGifs: false,
              sendGames: false,
              sendInline: false,
              embedLinks: false,
            }),
          })
        );
      } else if (group.className === "Chat") {
        result = await client.invoke(
          new tgApi.messages.AddChatUser({
            chatId: groupId,
            userId,
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Foydalanuvchi muvaffaqiyatli blockdan chiqarildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  //  Get Group Info
  static async GetGroupInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId } = req.query;

      await Groups.checkGroupType(client, String(groupId));

      const result = await client.getEntity(groupId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  //  Get Group Members
  static async GetGroupMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId } = req.query;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result;
      if (group.className === "Channel" && group.megagroup) {
        result = await client.invoke(
          new tgApi.channels.GetParticipants({
            channel: groupId,
            filter: new tgApi.ChannelParticipantsRecent(),
            limit: 100,
          })
        );
      } else if (group.className === "Chat") {
        result = await client.invoke(
          new tgApi.messages.GetFullChat({
            chatId: BigInt(Number(groupId)),
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Guruh a'zolari olindi",
        data: await result.users,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async PinMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, messageId } = req.body;

      let group = await Groups.checkGroupType(client, groupId);

      let result;

      if (group.className === "Channel" && group.megagroup) {
        result = await client.invoke(
          new tgApi.channels.UpdatePinnedMessage({
            channel: groupId,
            id: messageId,
            pinned: true,
          })
        );
      } else if (group.className === "Chat") {
        result = await client.invoke(
          new tgApi.messages.UpdatePinnedMessage({
            peer: groupId,
            id: messageId,
            pinned: true,
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Xabar muvaffaqiyatli pin qilindi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // UnPin Message
  static async UnPinMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, messageId } = req.body;

      let group = await Groups.checkGroupType(client, groupId);

      let result;

      if (group.className === "Channel" && group.megagroup) {
        result = await client.invoke(
          new tgApi.channels.UpdatePinnedMessage({
            channel: groupId,
            id: messageId,
            unpin: true,
          })
        );
      } else if (group.className === "Chat") {
        result = await client.invoke(
          new tgApi.messages.UpdatePinnedMessage({
            peer: groupId,
            id: messageId,
            unpin: true,
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Xabar muvaffaqiyatli pindan chiqarildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Get Invite Link
  static async GetInviteLink(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, requestNeeded, expireDate, title } = req.body;

     let group = await Groups.checkGroupType(client, String(groupId));

      const result = await client.invoke(
        new Api.messages.ExportChatInvite({
          peer: group,
          legacyRevokePermanent: true,
          requestNeeded,
          expireDate,
          title
        })
      );
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Check Invite Link
  static async CheckInviteLink(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { link } = req.body;

      let hash = link.includes("joinchat")
        ? link.split("/").at(-1)
        : link.split("+").at(-1);

      const result = await client.invoke(
        new Api.messages.CheckChatInvite({
          hash,
        })
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Delete History
  static async DeleteHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, forEveryone } = req.body;

      let group = await Groups.checkGroupType(client, groupId);
      let result;

      await Groups.checkAdmin(client, groupId);

      let isAdmin = await Groups.checkAdmin(client, groupId);

      if (group.megagroup && group.className === "Channel") {
        result = await client.invoke(
          new Api.channels.DeleteHistory({
            channel: group,
            forEveryone: isAdmin && forEveryone,
          })
        );
      } else {
        result = await client.invoke(
          new Api.messages.DeleteHistory({
            peer: group,
            revoke: isAdmin && forEveryone,
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Tarix tozalandi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Delete Messages
  static async DeleteMesssages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, messageIds } = req.body;

      let group = await Groups.checkGroupType(client, groupId);

      await Groups.checkAdmin(client, groupId);

      let result;
      if (group.megagroup && group.className === "Channel") {
        result = await client.invoke(
          new Api.channels.DeleteMessages({
            channel: group,
            id: messageIds,
          })
        );
      } else {
        result = await client.invoke(
          new Api.messages.DeleteMessages({
            id: messageIds,
            revoke: true,
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Xabarlar o'chirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Delete Member Messages
  static async DeleteMemberMesssages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, userId } = req.body;

      let group = await Groups.checkGroupType(client, groupId);
      let isAdmin = await Groups.checkAdmin(client, groupId);

      if (!isAdmin) {
        res.status(403).send({
          success: false,
          message: "Siz admin emassiz",
        });
        return;
      }

      let result;
      if (group.megagroup && group.className === "Channel") {
        result = await client.invoke(
          new Api.channels.DeleteParticipantHistory({
            channel: group,
            participant: userId,
          })
        );
      } else {
        result = await client.invoke(
          new Api.messages.DeleteHistory({
            peer: userId,
            revoke: true,
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Xabarlar o'chirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Update Chat About
  static async UpdateChatAbout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, about } = req.body;

      let group = await Groups.checkGroupType(client, groupId);
      let isAdmin = await Groups.checkAdmin(client, groupId);

      if (!isAdmin) {
        res.status(403).send({
          success: false,
          message: "Siz admin emassiz",
        });
        return;
      }

      const result = await client.invoke(
        new Api.messages.EditChatAbout({
          peer: group,
          about
        })
      );

      res.status(200).json({
        success: true,
        message: "About yangilandi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  //  Update Chat Photo
  static async UpdateChatPhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId } = req.body;
      const file = req.file as  Express.Multer.File | undefined;

      let group = await Groups.checkGroupType(client, groupId);
      let isAdmin = await Groups.checkAdmin(client, groupId);

      if (!isAdmin) {
        res.status(403).send({
          success: false,
          message: "Siz admin emassiz",
        });
        return;
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

      let result;

      if (group.megagroup && group.className === "Channel") {
        result = await client.invoke(
          new Api.channels.EditPhoto({
            channel: group,
            photo: inputFile
          })
        );
      } else {
        result = await client.invoke(
          new Api.messages.EditChatPhoto({
            chatId: groupId,
            photo: inputFile
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Rasm yangilandi",
        data: result,
      });

      fs.unlink(filePath, (err) => {})
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

    //  Update Chat Photo
    static async UpdateChatAdmin(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        const { groupId, userId, isAdmin, adminRights } = req.body;

        let group = await Groups.checkGroupType(client, groupId);

        let result;
        if (group.megagroup && group.className === "Channel") {
          result = await client.invoke(
            new Api.channels.EditAdmin({
              channel: group,
              userId,
              adminRights: new Api.ChatAdminRights({
                ...adminRights
              }),
              rank: adminRights.adminName,
            })
          );
        } else {
          result = await client.invoke(
            new Api.messages.EditChatAdmin({
              chatId: groupId,
              userId,
              isAdmin: isAdmin,
            })
          );
        }

        res.status(200).json({
          success: true,
          message: "Admin ma'lumotlari saqlandi",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async ClearAllDrafts(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        const result = await client.invoke(new Api.messages.ClearAllDrafts());

        res.status(200).json({
          success: true,
          message: "Qoralamalar tozalandi",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async ClearRecentStickers(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        const result = await client.invoke(
          new Api.messages.ClearRecentStickers({
            attached: true,
          })
        );

        res.status(200).json({
          success: true,
          message: "Stickerlar tozalandi",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async DeleteExportedChatInvite(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId, link } = req.body
        let group = await Groups.checkGroupType(client, groupId)

        const result = await client.invoke(
          new Api.messages.DeleteExportedChatInvite({
            peer: group,
            link: link,
          })
        );

        res.status(200).json({
          success: true,
          message: "Taklif havolasi o'chirildi",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }


    static async DeletePhoneCallHistory(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { revoke } = req.body

        const result = await client.invoke(
          new Api.messages.DeletePhoneCallHistory({
            revoke
          })
        );

        res.status(200).json({
          success: true,
          message: "Qo'ng",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetScheduledMessages(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId } = req.query

        let group = await Groups.checkGroupType(client, String(groupId))

        const result = await client.invoke(
          new Api.messages.GetScheduledMessages({
            peer: group,
            id: []
          })
        );

        res.status(200).json({
          success: true,
          message: "Rejalashtirilib, vaqti tugab yuborilgan xabarlar",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetScheduledHistory(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId } = req.query

        let group = await Groups.checkGroupType(client, String(groupId))

        const result = await client.invoke(
          new Api.messages.GetScheduledHistory({
            peer: group
          })
        );

        res.status(200).json({
          success: true,
          message: "Hozir rejada turgan xabarlar",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async DeleteScheduledMessages(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId, messageIds } = req.body

        let group = await Groups.checkGroupType(client, groupId)

        const result = await client.invoke(
          new Api.messages.DeleteScheduledMessages({
            peer: group,
            id: messageIds,
          })
        );

        res.status(200).json({
          success: true,
          message: "Rejalashtirilgan xabarlar o'chirildi",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async EditChatDefaultBannedRights(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId, bannedRights } = req.body

        let group = await Groups.checkGroupType(client, groupId)

        const result = await client.invoke(
          new Api.messages.EditChatDefaultBannedRights({
            peer: group,
            bannedRights: new Api.ChatBannedRights({
              ...bannedRights
            }),
          })
        );

        res.status(200).json({
          success: true,
          message: "Foydalanuvchilar uchun ruxsatlar belgilandi",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async EditExportedChatInvite(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId, link, expireDate, requestNeeded, title } = req.body

        let group = await Groups.checkGroupType(client, groupId)

        const result = await client.invoke(
          new Api.messages.EditExportedChatInvite({
            peer: group,
            link,
            expireDate,
            requestNeeded,
            title
          })
        );

        res.status(200).json({
          success: true,
          message: "Taklif havolasi yangilandi",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetAdminsWithInvites(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId } = req.query
        let group = await Groups.checkGroupType(client, String(groupId))

        const result = await client.invoke(
          new Api.messages.GetAdminsWithInvites({
            peer: group,
          })
        );
        res.status(200).json({
          success: true,
          message: "Admin yaratgan taklif havolalari haqida ma'lumot",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetAllDrafts(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        const result = await client.invoke(new Api.messages.GetAllDrafts());
        res.status(200).json({
          success: true,
          message: "Barcha qoralamalar",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetAllStickers(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        const result = await client.invoke(
          new Api.messages.GetAllStickers({
            hash: bigInt(-Math.floor(Math.random() * 1e18))
          })
        );

        res.status(200).json({
          success: true,
          message: "Barcha o'rnatilgan stickerlar",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetArchivedStickers(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { offsetId, limit } = req.query

        const result = await client.invoke(
          new Api.messages.GetArchivedStickers({
            offsetId: bigInt(String(offsetId)),
            limit: Number(limit),
          })
        );

        res.status(200).json({
          success: true,
          message: "Barcha archive stickerlar",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetAvailableReactions(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        const result = await client.invoke(
          new Api.messages.GetAvailableReactions({
            hash: 0,
          })
        );

        res.status(200).json({
          success: true,
          message: "Mavjud reaksiyalar",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

    static async GetChatInviteImporters(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        let { groupId, offset, limit, link, requested } = req.query

        let group = await Groups.checkGroupType(client, String(groupId))

        const result = await client.invoke(
          new Api.messages.GetChatInviteImporters({
            peer: group,
            offsetDate: Number(offset),
            limit: Number(limit),
            q:"",
            offsetUser: new Api.InputPeerSelf(),
            requested: Boolean(requested),
            link: String(link),
          })
        );

        res.status(200).json({
          success: true,
          message: "Link orqali kirganlar haqida ma'lumot",
          data: result,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }
}
