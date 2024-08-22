import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import { Messages } from "../messages";
import { Api } from "telegram";

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

  static async GetBlocks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as String;
      let client = tgClient(sessionString);
      await client.connect();

      let { page = 1, limit = 100 } = req.query;

      const result = await client.invoke(
        new Api.contacts.GetBlocked({
          offset: (Number(page) - 1) * Number(limit),
          limit: Number(limit),
        })
      );
      res.status(200).json({
        success: true,
        message: "Bloklanganlar",
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

      let { username, phone, firstName, lastName, addPhonePrivacyException } =
        req.body;

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

  static async EditContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let sessionString = req.headers.string_session as string; // Asserting the type as string
      let client = tgClient(sessionString);
      await client.connect();

      let { userId, phone, firstName, lastName, addPhonePrivacyException } = req.body;

      let user = await Messages.getPeer(client, userId)

      await client.invoke(
        new tgApi.contacts.DeleteContacts({
          id: [user || phone]
        })
      );

      const result = await client.invoke(
        new tgApi.contacts.AddContact({
          id: user || "",
          phone: phone || "",
          firstName: firstName || "",
          lastName: lastName || "",
          addPhonePrivacyException: addPhonePrivacyException || false,
        })
      );
      res.status(200).json({
        success: true,
        message: "Kontakt ma'lumotlari yangilandi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async BlockUserOrContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { userId } = req.body;

      let peer = await Messages.getPeer(client, userId);

      await client.invoke(
        new Api.contacts.Block({
          id: peer,
        })
      );

      res.status(200).json({
        success: true,
        message: "Bloklandi",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UnBlockUserOrContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { userId } = req.body;

      let peer = await Messages.getPeer(client, userId);

      await client.invoke(
        new Api.contacts.Unblock({
          id: peer,
        })
      );

      res.status(200).json({
        success: true,
        message: "Bloklandan chiqarildi",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async SearchContact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { search, limit = 100 } = req.body;

      const result = await client.invoke(
        new Api.contacts.Search({
          q: search,
          limit,
        })
      );

      res.status(200).json({
        success: true,
        message: "Qidiruv natijalari",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetContactInfoByPhone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { phone } = req.query;

      const result = await client.invoke(
        new Api.contacts.ResolvePhone({
          phone: String(phone),
        })
      );

      res.status(200).json({
        success: true,
        message: "Natija",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetContactInfoByUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { username } = req.query;

      const result = await client.invoke(
        new Api.contacts.ResolveUsername({
          username: String(username),
        })
      );

      res.status(200).json({
        success: true,
        message: "Natija",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteContacts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { userIds } = req.body;

      const result = await client.invoke(
        new Api.contacts.DeleteContacts({
          id: [...userIds],
        })
      );

      res.status(200).json({
        success: true,
        message: "Kontaktlar o'chirildi",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
