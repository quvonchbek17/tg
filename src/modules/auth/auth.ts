import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import dotenv from "dotenv"
dotenv.config()
import { Api } from "telegram"


interface VerificationEntry {
  phoneNumber: string;
  code: number;
  phoneCodeHash: string;
}

export class Auth {
  static async SendCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { phoneNumber } = req.body;

      // Create a new Telegram client instance
      const client = tgClient("");
      await client.connect();

      await client.connect();
      const result = await client.invoke(
        new tgApi.auth.SendCode({
          phoneNumber,
          apiId: Number(process.env.apiId),
          apiHash: process.env.apiHash,
          settings: new tgApi.CodeSettings({

          }),
        })
      );

      console.log(result);



      res.status(200).json({
        success: true,
        message: "Kod yuborildi",
        phoneCodeHash: result.phoneCodeHash, // bu kodni verify route'da ishlatishingiz kerak
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async VerifyCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { phoneNumber, code, phoneCodeHash } = req.body;

      const client = tgClient("");
      await client.connect();

      await client.connect();

      const result = await client.invoke(
        new tgApi.auth.SignIn({
          phoneNumber: phoneNumber,
          phoneCodeHash: phoneCodeHash,
          phoneCode: code,
        })
      );

      console.log(result);

      const stringSession = client.session.save();

      res.status(200).json({
        success: true,
        message: "Tizimga muvaffaqiyatli kirdingiz",
        stringSession,
      });
    } catch (error: any) {
      console.log(error);
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
