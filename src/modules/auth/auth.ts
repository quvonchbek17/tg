import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '@errors';
import { tgClient, tgApi } from '@config';
import dotenv from 'dotenv';
dotenv.config();
import { Api } from 'telegram';
import NodeCache from "node-cache"
import { v4 as uuidv4 } from 'uuid';
import QRCode from "qrcode"

const cache = new NodeCache({
  stdTTL: 180
})

function saveToCache(uuid: string, session: string) {
  cache.set(uuid, session)
}

function getFromCache(uuid: string) {
  return cache.get(uuid);
}

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

  static async generateLoginToken(req: Request, res: Response, next: NextFunction) {
    try {
      await client.connect(); // Connect and ensure client is authenticated

      let newUUID = uuidv4()
      const user = await client.signInUserWithQrCode(
          {
            apiId: Number(process.env.apiId),
            apiHash: process.env.apiHash,
            exceptIds: [],
          },
          {
            onError: async function(p1: Error) {
              console.log("error", p1);
              // true = stop the authentication process
              return true;
            },
            qrCode: async (code: any) => {
              const base64Token = code.token.toString("base64url");
              const loginUrl = `tg://login?token=${base64Token}`;

              const qrCodeDataUrl = await QRCode.toDataURL(loginUrl);

              // res.send(`<img src="${qrCodeDataUrl}"/>`);
              res.json({
                success: true,
                qrCodeDataUrl,
                session_id: newUUID,
                expires_in: code.expires

              })
            },
            password: async (hint: any) => {
              // password if needed
              return "1111";
            }
          }
      );

      const stringSession = client.session.save();
      saveToCache(newUUID, stringSession)

      console.log("Saved to cache")
    } catch (error: any) {
      console.error('Error generating login token:', error.message);
      next(new ErrorHandler(error.message, error.status || 500));
    }
  }

  static async checkLoginToken(req: Request, res: Response, next: NextFunction) {
    try {
      const {uuid} = req.params;
      const sessionString = getFromCache(uuid)
      if(sessionString) {
        return res.json({
          success: true,
          sessionString
        })
      }
      return res.json({
        success: false,
        message: "You haven't scanned QR!"
      })
    } catch (error: any) {
      console.error('Error checking login token:', error.message);
      next(new ErrorHandler(error.message, error.status || 500));
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
