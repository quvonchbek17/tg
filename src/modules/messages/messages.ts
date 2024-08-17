import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";
import { tgClient } from "@config";
import { CustomFile } from "telegram/client/uploads";
import path from "path";
import * as fs from "fs"
import { Api } from "telegram";
import bigInt from "big-integer";


let filePath = ""
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

  static async getPeer(client: any, id: string) {
    let chat;
    try {
      chat = await client.invoke(
        new Api.messages.GetChats({
          id: [bigInt(id)],
        })
      );
    } catch (error) {
      try {
        chat = await client.getEntity("-" + id);
      } catch (error: any) {
          if(error.message.includes("CHAT_ID_INVALID")){
            chat = await client.getEntity(id)
          }
      }
    }

    if (chat.chats?.length === 0 && chat.chats) {
      throw new ErrorHandler("Guruh topilmadi", 404);
    }

    const peer = chat.chats ? chat.chats[0] : chat;
    return peer;
  }

  static async SendDinamicMessage(req: Request, res:Response, next: NextFunction, group: any, chat: any, isSavedMessage: boolean) {
    try {


      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { message, scheduleDate } = req.body
      const file = req.file as Express.Multer.File | undefined;

      let peer: any;

      if (group) {
        peer = group;
      } else if (chat) {
        peer = chat
      } else if (isSavedMessage) {
        peer = new Api.InputPeerSelf();
      } else {
        throw new Error('Hech bo‘lmaganda bitta groupId, chatId yoki isSavedMessage parametri bo‘lishi kerak.');
      }

      if (!file) {
        // Faylsiz xabar yuborish
        const result = await client.invoke(
          new Api.messages.SendMessage({
            peer: peer,
            message: message,
            randomId: bigInt(-Math.floor(Math.random() * 1e18)),
            scheduleDate: Number(scheduleDate)
          })
        );
        res.status(200).json({
          success: true,
          message: "Xabar muvaffaqiyatli yuborildi",
          data: result,
        });
        return;
      }

      filePath = path.join(process.cwd(), "uploads", file.fieldname);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, filePath),
        workers: 1,
      });

      let mediaObject;
      if(file.mimetype.includes("photo") || file.mimetype.includes("image")){
        mediaObject = new Api.InputMediaUploadedPhoto({
          file: inputFile,
        });
      } else if(file.mimetype.includes("video")){
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || 'video/mp4',
          attributes: [
            new Api.DocumentAttributeVideo({
              duration: 0,
              w: 640,
              h: 480
            }),
          ],
        });
      } else if(file.mimetype.includes("audio")){
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || 'audio/mpeg',
          attributes: [
            new Api.DocumentAttributeAudio({
              title: file.originalname || 'untitled',
              duration: 0
            }),
          ],
        });
      } else {
        mediaObject = new Api.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || 'application/octet-stream',
          attributes: [
            new Api.DocumentAttributeFilename({
              fileName: file.originalname || 'untitled',
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
          scheduleDate: Number(scheduleDate)
        })
      );

      res.status(200).json({
        success: true,
        message: "Xabar yuborildi",
        data: result,
      });

     fs.unlink(filePath, (err) => {})
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
      fs.unlink(filePath, (err) => {})
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
        new Api.messages.EditMessage({
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

      // const result = await client.invoke(
      //   new Api.messages.DeleteMessages({
      //     peer: chatId,
      //     id: [messageId],
      //   })
      // );

      // res.status(200).json({
      //   success: true,
      //   message: "Message deleted successfully",
      //   data: result,
      // });
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
        throw new Error('fromId, toId va messageIds kerak');
      }

      const fromPeer = await Messages.getPeer(client, fromId);
      const toPeer = await Messages.getPeer(client, toId);

      const result = await client.invoke(
        new Api.messages.ForwardMessages({
          fromPeer,
          id: messageIds.map((id: string) => parseInt(id)),
          randomId: messageIds.map(() => BigInt(Math.floor(Math.random() * 10_000_000_000_000))),
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
        message: 'Xabar(lar) muvaffaqiyatli forward qilindi',
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
