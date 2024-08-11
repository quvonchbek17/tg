import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";

export class Contacts {
  static async GetContacts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as String;
      let client = tgClient(sessionString);
      await client.connect();

      const result = await client.invoke(
        new tgApi.contacts.GetContacts({
          hash: BigInt("-4156887774564"),
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
            id: username || "",
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
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // static async GetMyContacts(req: Request,res: Response,next: NextFunction): Promise<void> {
  //      try {
  //         await tgClient.connect()
  //         const result = await tgClient.invoke(
  //             new tgApi.contacts.GetContacts({
  //               hash: BigInt("-4156887774564"),
  //             })
  //           );
  //         res.status(200).json({
  //             success: true,
  //             data: result
  //         })
  //      } catch (error: any) {
  //         next(new ErrorHandler(error.message, error.status))
  //      }
  // }
}
