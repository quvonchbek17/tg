import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import { Api } from "telegram";
import path from "path";
import { CustomFile } from "telegram/client/uploads";
import bigInt from "big-integer";
import * as fs from "fs";

export class Profile {
  static async GetMyProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as String;
      let client = tgClient(sessionString);
      await client.connect();

      const me = await client.getMe();
      res.status(200).json({
        success: true,
        data: me,
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

      // const { userId } = req.body;
      const result = await client.invoke(
        new Api.photos.GetUserPhotos({ userId: await client.getMe() })
      );

      res
        .status(200)
        .json({ success: true, message: "Profile rasmlari", data: result });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as String;
      let client = tgClient(sessionString);
      await client.connect();

      let { firstName, lastName, about } = req.body;
      const result = await client.invoke(
        new Api.account.UpdateProfile({
          firstName,
          lastName,
          about,
        })
      );
      res.status(200).json({
        success: true,
        message: "Updated",
        data: result,
      });
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

      const { username } = req.body;
      const result = await client.invoke(
        new Api.account.UpdateUsername({ username })
      );

      res
        .status(200)
        .json({ success: true, message: "Username yangilandi", data: result });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateProfilePhotoOrVideo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const file = req.file as Express.Multer.File;
      const filePath = path.join(process.cwd(), "uploads", file.filename);
      const inputFile = await client.uploadFile({
        file: new CustomFile(file.originalname, file.size, filePath),
        workers: 1,
      });

      let result;
      if (file.mimetype.includes("photo") || file.mimetype.includes("image")) {
        result = await client.invoke(
          new Api.photos.UploadProfilePhoto({
            file: inputFile,
          })
        );
      } else if (file.mimetype.includes("video")) {
        result = await client.invoke(
          new Api.photos.UploadProfilePhoto({
            video: inputFile,
            videoStartTs: 0.0,
          })
        );
      } else {
        res.status(400).json({
          success: false,
          message: "Xato formatdagi file. Video yoki rasm yuklang",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile rasmi/videosi yangilandi",
        data: result,
      });

      fs.unlink(filePath, (err) => {
        if (err) console.error("File deletion failed:", err);
      });
    } catch (error: any) {
      if (error.message.includes("VIDEO_FILE_INVALID")) {
        next(
          new ErrorHandler(
            "Video file 1080x1080 hajmgacha bo'lgan kvadrat shakldagi video bo'lishi kerak",
            400
          )
        );
        return;
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteProfilePhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { photoId, accessHash, file, fileReference } = req.body;

      const inputPhoto = new Api.InputPhoto({
        id: bigInt(photoId), // photoId ni to'g'ri formatga o'tkazish
        accessHash: bigInt(accessHash), // accessHashni to'g'ri formatga o'tkazish
        fileReference: Buffer.from(fileReference, "base64"), // fileReference ni buffer formatida kiritish
      });

      const result = await client.invoke(
        new Api.photos.DeletePhotos({
          id: [inputPhoto],
        })
      );

      res.status(200).json({
        success: true,
        message: "Profile rasmi o'chirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetActiveSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      // Faol seanslarni olish
      const result = await client.invoke(new Api.account.GetAuthorizations());

      res.status(200).json({
        success: true,
        message: "Faol seanslar ro'yxati",
        data: result.authorizations,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async TerminateSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { hash } = req.body;




      // Faol seansni tugatish
      const result = await client.invoke(
        new Api.account.ResetAuthorization({
          hash // sessionId ni to'g'ri formatga o'tkazish
        })
      );

      res.status(200).json({
        success: true,
        message: "Seans muvaffaqiyatli tugatildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetPrivacySettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const result = await client.invoke(
        new Api.account.GetPrivacy({
          key: new Api.InputPrivacyKeyStatusTimestamp(),
        })
      );

      res
        .status(200)
        .json({
          success: true,
          message: "Maxfiylik sozlamalari",
          data: result,
        });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
