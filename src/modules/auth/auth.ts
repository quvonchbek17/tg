import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '@errors';
import { tgClient, tgApi } from '@config';
import dotenv from 'dotenv';
dotenv.config();
import { Api } from 'telegram';

const client = tgClient('');

export class Auth {
  static async SendCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { phoneNumber } = req.body;

      await client.connect();

      const result = await client.invoke(
        new tgApi.auth.SendCode({
          phoneNumber,
          apiId: Number(process.env.apiId),
          apiHash: process.env.apiHash,
          settings: new tgApi.CodeSettings({})
        })
      );

      res.status(200).json({
        success: true,
        message: 'Kod yuborildi',
        phoneCodeHash: result.phoneCodeHash
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async VerifyCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, code, phoneCodeHash } = req.body;

      await client.connect();

      const result = await client.invoke(
        new tgApi.auth.SignIn({
          phoneNumber,
          phoneCodeHash,
          phoneCode: code
        })
      );

      const stringSession = client.session.save();

      res.status(200).json({
        success: true,
        message: 'Tizimga muvaffaqiyatli kirdingiz',
        stringSession,
        result
      });
    } catch (error: any) {
      if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
        return res.status(200).json({
          success: true,
          message: "Parolni /verifyPassword routega jo'nating"
        });
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // static async VerifyPassword(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const { password } = req.body;

  //     await client.connect();
  //     console.log('KELDI');
  //     const result = await client.invoke(
  //       new tgApi.auth.CheckPassword({
  //         password: Buffer.from(password)
  //       })
  //     );
  //     console.log(result);

  //     const stringSession = client.session.save();

  //     res.status(200).json({
  //       success: true,
  //       message: 'Tizimga muvaffaqiyatli kirdingiz',
  //       stringSession,
  //       result
  //     });
  //   } catch (error: any) {
  //     next(new ErrorHandler(error.message, error.status));
  //   }
  // }
}
