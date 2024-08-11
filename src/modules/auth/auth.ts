import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import dotenv from "dotenv"
dotenv.config()

interface VerificationEntry {
  phoneNumber: string;
  code: number;
  phoneCodeHash: string;
}

let verificationStore: { [key: string]: VerificationEntry } = {};

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

      const result = await client.invoke(
        new tgApi.auth.SendCode({
          phoneNumber,
          apiId: process.env.apiId,
          apiHash: process.env.apiHash,
          settings: new tgApi.CodeSettings({
            allowFlashcall: true,
            currentNumber: true,
            allowAppHash: true,
            allowMissedCall: true,
            logoutTokens: [Buffer.from("arbitrary data here")],
          }),
        })
      );

      console.log(result);


      // Store the phone number, code, and timestamp
      verificationStore[phoneNumber] = {
        phoneNumber,
        code: result.phoneCodeHash,
        phoneCodeHash: result.phoneCodeHash,
      };

      setTimeout(() => {
        delete verificationStore[phoneNumber]
      }, 2*60*1000)

      res.status(200).json({
        success: true,
        message: "Verification code sent successfully"
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
      const { phoneNumber, code } = req.body;

      const verificationData = verificationStore[phoneNumber];

      if (!verificationData) {
        throw new Error("Invalid verification ID");
      }

      // Create a new Telegram client instance
      const client = tgClient("")
      await client.connect();
       console.log(verificationStore[phoneNumber].phoneCodeHash);

      // Verify the code

      const result = await client.invoke(
        new tgApi.auth.SignIn({
          phoneNumber,
          phoneCodeHash: verificationStore[phoneNumber].phoneCodeHash,
          phoneCode: code,
        })
      );

      // console.log(result);


      // Generate a new session string
      const sessionString = client.session.save();

      console.log(sessionString);


      // Remove the used verification data
      delete verificationStore[phoneNumber];

      res.status(200).json({
        success: true,
        message: "Verification successful",
        sessionString,
      });
    } catch (error: any) {
      console.log(error);
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
