import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";

export class Groups {

   // Guruh turi (oddiy yoki superguruh) ekanligini tekshirish uchun yordamchi funksiya
   static async checkGroupType(client: any, groupId: string) {
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
      throw new ErrorHandler("Guruh topilmadi", 404);
    }

    const group = chat.chats ? chat.chats[0]: chat;
    if (group.className === "Channel" && group.megagroup !== true) {
      throw new ErrorHandler("Kanal uchun amal qilmaydi", 400);
    }

    return group;
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

      const groups = dialogs.filter((el: any) => el.isGroup).map((dialog:any) => ({
        id: dialog.id,
        name: dialog.title || dialog.name,
        type: 'group',
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

  static async GetGroupMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, limit = 100, page = 1} = req.query;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result = await client.invoke(
        new tgApi.messages.GetHistory({
          peer: group,
          offset_id: (Number(page)-1)*Number(limit) ,
          limit: Number(limit),
        })
      );

      res.status(200).json({
        success: true,
        data: result.messages
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async BlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, userId } = req.body;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result;

      if (group.className === 'Channel' && group.megagroup) {
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
        )
      } else if (group.className === 'Chat') {
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
      if(error.message.includes("USER_NOT_PARTICIPANT")){
        next(new ErrorHandler("Bu user guruh a'zosi emas", 400));
        return
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }
   // UnBlock User
  static async UnBlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, userId } = req.body;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result;

      if (group.className === 'Channel' && group.megagroup) {
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
              embedLinks: false
            })
          })
        )
      } else if (group.className === 'Chat') {
        result = await client.invoke(
          new tgApi.messages.AddChatUser({
            chatId: groupId,
            userId
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
   static async GetGroupInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId } = req.query;

      await Groups.checkGroupType(client, String(groupId));

      const result = await client.getEntity(groupId)

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

   //  Get Group Members
   static async GetGroupMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId } = req.query;

      const group = await Groups.checkGroupType(client, String(groupId));

      let result;
      if (group.className === 'Channel' && group.megagroup) {
        result = await client.invoke(
          new tgApi.channels.GetParticipants({
            channel: groupId,
            filter: new tgApi.ChannelParticipantsRecent(),
            limit: 100
          })
        );
      } else if (group.className === 'Chat') {
        result = await client.invoke(
          new tgApi.messages.GetFullChat({
            chatId: BigInt(Number(groupId))
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

  static async PinMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, messageId } = req.body;

      let group = await Groups.checkGroupType(client, groupId);

      let result;

      if (group.className === 'Channel' && group.megagroup) {
        result = await client.invoke(
          new tgApi.channels.UpdatePinnedMessage({
            channel: groupId,
            id: messageId,
            pinned: true
          })
        );
      } else if (group.className === 'Chat') {
        result = await client.invoke(
          new tgApi.messages.UpdatePinnedMessage({
            peer: groupId,
            id: messageId,
            pinned: true
          })
        );
      }

      res.status(200).json({
        success: true,
        message: "Xabar muvaffaqiyatli pin qilindi",
        data: result,
      })
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // UnPin Message
  static async UnPinMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { groupId, messageId } = req.body;

      let group = await Groups.checkGroupType(client, groupId);

      let result;

      if (group.className === 'Channel' && group.megagroup) {
        result = await client.invoke(
          new tgApi.channels.UpdatePinnedMessage({
            channel: groupId,
            id: messageId,
            unpin: true
          })
        );
      } else if (group.className === 'Chat') {
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
      })
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

    // Get Invite Link
    static async GetInviteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const sessionString = req.headers.string_session as string;
        const client = tgClient(sessionString);
        await client.connect();

        const { groupId } = req.query;

        await Groups.checkGroupType(client, String(groupId));

        let result = await client.invoke(
          new tgApi.messages.GetFullChat({
            chatId: BigInt(Number(groupId))
          })
        )
        res.status(200).json({
          success: true,
          data: result.fullChat?.exportedInvite?.link,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, error.status));
      }
    }

}
