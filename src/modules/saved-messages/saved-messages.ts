import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
const {CustomFile} = require("telegram/client/uploads");
import * as fs from "fs"
import path from "path";

export class SavedMessages {

  static async GetSavedMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { limit } = req.query;
      const result = await client.invoke(
        new tgApi.messages.GetHistory({
          peer: new tgApi.InputPeerSelf(),
          limit: Number(limit) || 20,
        })
      );

      res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { message } = req.body;
      const file = req.file as  Express.Multer.File | undefined;

      if (!file) {
        const result = await client.invoke(
          new tgApi.messages.SendMessage({
            peer: new tgApi.InputPeerSelf(),
            message: message,
            randomId: BigInt(-Math.floor(Math.random() * 1e18)),
          })
        );
         res.status(200).json({
          success: true,
          message: "Message send succesfully",
        });
         return
      }

      // Faylni xotiraga yuklash
      const filePath = path.join(process.cwd(), "uploads", file.fieldname);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, filePath), // Faylni xotiradan yuborish
        workers: 1,
      });
      let mediaObject;
      if (!req.query.type || req.query.type == "photo") {
        mediaObject = new tgApi.InputMediaUploadedPhoto({
          file: inputFile,
          mimeType: file.mimetype || 'application/octet-stream',
          attributes: [
            new tgApi.DocumentAttributeFilename({
              fileName: file.originalname || 'untitled',
            }),
          ],
        });
      }
      // Media obyektini yaratish
     else if (req.query.type == "document") {
       mediaObject = new tgApi.InputMediaUploadedDocument({
         file: inputFile,
         mimeType: file.mimetype || 'application/octet-stream',
         attributes: [
           new tgApi.DocumentAttributeFilename({
             fileName: file.originalname || 'untitled',
           }),
         ],
       });
     }

      console.log({mediaObject})
      const result = await client.invoke(
        new tgApi.messages.SendMedia({
          peer: new tgApi.InputPeerSelf(),
          media: mediaObject,
          message: message,
          randomId: BigInt(-Math.floor(Math.random() * 1e18)),
          noforwards: true,
        })
      );

      res.status(200).json({
        success: true,
        message: "Message with file sent successfully",
        data: result,
      });

      fs.unlink(filePath, (err) => {})
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateMultiSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { message } = req.body;
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        const result = await client.invoke(
          new tgApi.messages.SendMessage({
            peer: new tgApi.InputPeerSelf(),
            message: message,
            randomId: BigInt(-Math.floor(Math.random() * 1e18)),
          })
        );
        res.status(200).json({
          success: true,
          message: "Message sent successfully",
          data: result,
        });
        return;
      }

      const multiMedia = [];

      for (const file of files) {
        const filePath = path.join(process.cwd(), "uploads", file.fieldname);

        const inputFile = await client.uploadFile({
          file: new CustomFile(file.originalname, file.size, filePath),
          workers: 1,
        });

        const mediaObject = new tgApi.InputSingleMedia({
          media: await client.invoke(
            new tgApi.messages.UploadMedia({
              peer: new tgApi.InputPeerSelf(),
              media: new tgApi.InputMediaUploadedPhoto({
                file: inputFile,
                  workers: 1,
                }),
              }),
          ),
          randomId: BigInt(-Math.floor(Math.random() * 1e18)),
          message: message || "",
        });

        multiMedia.push(mediaObject);

        fs.unlinkSync(filePath);
      }


      const result = await client.invoke(
        new tgApi.messages.SendMultiMedia({
          peer: new tgApi.InputPeerSelf(),
          multiMedia,
          noforwards: true,
        })
      );

      res.status(200).json({
        success: true,
        message: "Message with multiple files sent successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { message, message_id } = req.body;
      const file = req.file as Express.Multer.File | undefined;
      let messageId = message_id*1

      // Xabarni yangilash
      if (file) {
        // Faylni xotiraga yuklash
        const filePath = path.join(process.cwd(), "uploads", file.fieldname);
        const inputFile = await client.uploadFile({
          file: new CustomFile(file.originalname, file.size, filePath), // Faylni xotiradan yuborish
          workers: 1,
        });

        // Media obyektini yaratish
        const mediaObject = new tgApi.InputMediaUploadedDocument({
          file: inputFile,
          mimeType: file.mimetype || 'application/octet-stream',
          attributes: [
            new tgApi.DocumentAttributeFilename({
              fileName: file.originalname || 'untitled',
            }),
          ],
        });

        const result = await client.invoke(
          new tgApi.messages.EditMessage({
            peer: new tgApi.InputPeerSelf(),
            id: messageId,
            message: message || "",
            media: mediaObject
          })
        );

        res.status(200).json({
          success: true,
          message: "Message updated with file successfully",
          data: result,
        });

        fs.unlink(filePath, (err) => {})
      } else if (message) {
        // Agar faqat matnni yangilash kerak bo'lsa
        const result = await client.invoke(
          new tgApi.messages.EditMessage({
            peer: new tgApi.InputPeerSelf(),
            id: messageId,
            message: message,
          })
        );

        res.status(200).json({
          success: true,
          message: "Message updated successfully",
          data: result,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "No file or message provided",
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { messageId } = req.body;

      const result = await client.invoke(
        new tgApi.messages.DeleteMessages({
          id: [messageId],
          revoke: true, // Bu parametr o'chirilishi mumkinligini bildiradi
        })
      );
      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
