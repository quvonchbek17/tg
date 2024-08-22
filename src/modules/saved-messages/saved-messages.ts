import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
const {CustomFile} = require("telegram/client/uploads");
import * as fs from "fs"
import path from "path";
import { Messages } from "../messages";

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
        message: "Saqlangan xabarlar",
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

      await Messages.SendDinamicMessage(req, res, next, null, null, true)
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async EditSavedMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      await Messages.DinamicEditMessage(req, res, next, null, null, true)
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
