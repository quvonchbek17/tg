import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";
import { tgClient } from "@config";
import { CustomFile } from "telegram/client/uploads";
import path from "path";
import * as fs from "fs";
import { Api } from "telegram";
import bigInt from "big-integer";

export class Messages {
  static async getPeer(client: any, id: any) {
    let chat;

    try {
      chat = await client.invoke(
        new Api.messages.GetChats({
          id: [bigInt(id)],
        })
      );
    } catch (error) {
      try {
        chat = await client.getEntity(id.startsWith('-') ? id : "-" + id);
      } catch (error: any) {
        if (error.message.includes("CHAT_ID_INVALID")) {
          chat = await client.getEntity(id)
       }
      }
    }
    const peer = chat?.chats ? chat.chats[0] : chat;
    return peer;
  }

  static async createMediaObject(
    req: Request,
    res: Response,
    next: NextFunction,
    client: any,
    file: any
  ) {
    let filePath = "";
    try {
      filePath = path.join(process.cwd(), "uploads", file.fieldname);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, filePath),
        workers: 1,
      });

      let mediaObject;
      if (file.mimetype.includes("photo") || file.mimetype.includes("image")) {
        mediaObject = new Api.InputMediaUploadedPhoto({
          file: inputFile,
        });
      } else if (file.mimetype.includes("video")) {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "video/mp4",
          attributes: [
            new Api.DocumentAttributeVideo({
              duration: 0,
              w: 640,
              h: 480,
            }),
          ],
        });
      } else if (file.mimetype.includes("audio")) {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "audio/mpeg",
          attributes: [
            new Api.DocumentAttributeAudio({
              title: file.originalname || "untitled",
              duration: 0,
            }),
          ],
        });
      } else {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "application/octet-stream",
          attributes: [
            new Api.DocumentAttributeFilename({
              fileName: file.originalname || "untitled",
            }),
          ],
        });
      }
      return mediaObject;
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SendDinamicMessage(
    req: Request,
    res: Response,
    next: NextFunction,
    group: any,
    chat: any,
    isSavedMessage: boolean
  ) {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { message, scheduleDate } = req.body;
      const file = req.file as Express.Multer.File | undefined;

      let peer: any;

      if (group) {
        peer = group;
      } else if (chat) {
        peer = chat;
      } else if (isSavedMessage) {
        peer = new Api.InputPeerSelf();
      } else {
        throw new Error(
          "Hech bo‘lmaganda bitta groupId, chatId yoki isSavedMessage parametri bo‘lishi kerak."
        );
      }

      if (!file) {
        // Faylsiz xabar yuborish
        const result = await client.invoke(
          new Api.messages.SendMessage({
            peer: peer,
            message: message,
            randomId: bigInt(-Math.floor(Math.random() * 1e18)),
            scheduleDate: Number(scheduleDate),
          })
        );
        res.status(200).json({
          success: true,
          message: "Xabar muvaffaqiyatli yuborildi",
          data: result,
        });
        return;
      }
      let filePath = "";
      filePath = path.join(process.cwd(), "uploads", file.fieldname);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, filePath),
        workers: 1,
      });

      let mediaObject;
      if (file.mimetype.includes("photo") || file.mimetype.includes("image")) {
        mediaObject = new Api.InputMediaUploadedPhoto({
          file: inputFile,
        });
      } else if (file.mimetype.includes("video")) {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "video/mp4",
          attributes: [
            new Api.DocumentAttributeVideo({
              duration: 0,
              w: 640,
              h: 480,
            }),
          ],
        });
      } else if (file.mimetype.includes("audio")) {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "audio/mpeg",
          attributes: [
            new Api.DocumentAttributeAudio({
              title: file.originalname || "untitled",
              duration: 0,
            }),
          ],
        });
      } else {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "application/octet-stream",
          attributes: [
            new Api.DocumentAttributeFilename({
              fileName: file.originalname || "untitled",
            }),
          ],
        });
      }

      const result = await client.invoke(
        new Api.messages.SendMedia({
          peer: peer,
          media: mediaObject,
          message: message,
          randomId: bigInt(-Math.floor(Math.random() * 1e18)),
          noforwards: true,
          scheduleDate: Number(scheduleDate),
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabar yuborildi",
        data: result,
      });

      fs.unlink(filePath, (err) => {});
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SetTyping(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { chatId } = req.body;

      let chat = await Messages.getPeer(client, String(chatId));

      const result = await client.invoke(
        new Api.messages.SetTyping({
          peer: chat,
          action: new Api.SendMessageTypingAction(),
        })
      );

      res.status(200).json({
        success: true,
        message: "Typing hodisasi o'rnatildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DinamicEditMessage(
    req: Request,
    res: Response,
    next: NextFunction,
    group: any,
    chat: any,
    isSavedMessage: boolean
  ) {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { newMessage, messageId, scheduleDate } = req.body;
      const file = req.file as Express.Multer.File | undefined;

      let peer: any;

      if (group) {
        peer = group;
      } else if (chat) {
        peer = chat;
      } else if (isSavedMessage) {
        peer = new Api.InputPeerSelf();
      } else {
        throw new Error(
          "Hech bo‘lmaganda bitta groupId, chatId yoki isSavedMessage parametri bo‘lishi kerak."
        );
      }

      if (!file) {
        // Faylsiz xabar yuborish
        const result = await client.invoke(
          new Api.messages.EditMessage({
            peer: peer,
            id: Number(messageId),
            message: newMessage,
            scheduleDate: Number(scheduleDate),
          })
        );
        res.status(200).json({
          success: true,
          message: "Xabar muvaffaqiyatli edit qilindi",
          data: result,
        });
        return;
      }

      let editFilePath = "";
      editFilePath = path.join(process.cwd(), "uploads", file.fieldname);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, editFilePath),
        workers: 1,
      });

      let mediaObject;
      if (file.mimetype.includes("photo") || file.mimetype.includes("image")) {
        mediaObject = new Api.InputMediaUploadedPhoto({
          file: inputFile,
        });
      } else if (file.mimetype.includes("video")) {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "video/mp4",
          attributes: [
            new Api.DocumentAttributeVideo({
              duration: 0,
              w: 640,
              h: 480,
            }),
          ],
        });
      } else if (file.mimetype.includes("audio")) {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "audio/mpeg",
          attributes: [
            new Api.DocumentAttributeAudio({
              title: file.originalname || "untitled",
              duration: 0,
            }),
          ],
        });
      } else {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || "application/octet-stream",
          attributes: [
            new Api.DocumentAttributeFilename({
              fileName: file.originalname || "untitled",
            }),
          ],
        });
      }

      const result = await client.invoke(
        new Api.messages.EditMessage({
          peer: peer,
          id: Number(messageId),
          media: mediaObject,
          message: newMessage,
          scheduleDate: Number(scheduleDate),
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabar tahrirlandi",
        data: result,
      });

      fs.unlink(editFilePath, (err) => {});
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async ForwardMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { fromId, toId, messageIds } = req.body;
      if (!fromId || !toId || !messageIds || !messageIds.length) {
        throw new Error("fromId, toId va messageIds kerak");
      }

      const fromPeer = await Messages.getPeer(client, fromId);
      const toPeer = await Messages.getPeer(client, toId);

      const result = await client.invoke(
        new Api.messages.ForwardMessages({
          fromPeer,
          id: messageIds.map((id: string) => parseInt(id)),
          randomId: messageIds.map(() =>
            BigInt(Math.floor(Math.random() * 10_000_000_000_000))
          ),
          toPeer,
          withMyScore: false,
          dropAuthor: false,
          dropMediaCaptions: false,
          noforwards: false,
          scheduleDate: 0,
          sendAs: undefined,
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabar(lar) muvaffaqiyatli forward qilindi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async Search(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { peerId, search, limit, fromId, minDate, maxDate } = req.body;

      let peer = await Messages.getPeer(client, peerId);

      let fromPeer;
      if (fromId) {
        fromPeer = await Messages.getPeer(client, fromId);
      }

      const result = await client.invoke(
        new Api.messages.Search({
          peer,
          q: search,
          filter: new Api.InputMessagesFilterEmpty(),
          limit,
          fromId: fromId,
          minDate: minDate || 0,
          maxDate: maxDate || 0,
        })
      );

      res.status(200).json({
        success: true,
        message: "Natijalar",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SearchGlobal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { search, limit, minDate, maxDate } = req.body;

      const result = await client.invoke(
        new Api.messages.SearchGlobal({
          q: search,
          filter: new Api.InputMessagesFilterEmpty(),
          minDate: minDate || 0,
          maxDate: maxDate || 0,
          offsetPeer: new Api.InputPeerSelf(),
          limit,
        })
      );

      res.status(200).json({
        success: true,
        message: "Natijalar",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SendReaction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { peerId, msgId, reaction, big } = req.body;

      let peer = await Messages.getPeer(client, peerId);

      const result = await client.invoke(
        new Api.messages.SendReaction({
          peer,
          msgId,
          big: big || false,
          reaction: [new Api.ReactionEmoji({ emoticon: reaction })],
        })
      );

      res.status(200).json({
        success: true,
        message: "Reaksiya bosildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetEmojiKeywords(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const result = await client.invoke(
        new Api.messages.GetEmojiKeywords({
          langCode: "en", // Agar langCode berilmasa, 'en' qabul qilinadi
        })
      );

      res.status(200).json({
        success: true,
        message: "Emojilar",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateNotificationSettings(
    req: Request,
    res: Response,
    next: NextFunction,
    peer: any
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { mute, muteUntil, showPreviews } = req.body;

      const result = await client.invoke(
        new Api.account.UpdateNotifySettings({
          peer,
          settings: new Api.InputPeerNotifySettings({
            showPreviews,
            muteUntil: mute && muteUntil ? muteUntil : mute ? 2147483647 : 0,
            sound: new Api.NotificationSoundDefault(),
          }),
        })
      );

      res.status(200).json({
        success: true,
        message: "Bildirishnomalar holati yangilandi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetProfilePhotos(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { peerId, limit } = req.query;

      let peer = await Messages.getPeer(client, peerId);
      const photos = await client.invoke(
        new Api.photos.GetUserPhotos({
          userId: peer,
          offset: 0,
          limit: Number(limit) || 100,
        })
      );
      res.status(200).json({
        success: true,
        data: photos,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SetHistoryTTL(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { peerId, ttl } = req.body;

      let peer = await Messages.getPeer(client, peerId);

      const result = await client.invoke(
        new Api.messages.SetHistoryTTL({
          peer,
          period: ttl,
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabarlar uchun yashash muddati o'zgartirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
