import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@middlewares";
import { ErrorHandler } from "@errors";
import { tgClient, tgApi } from "@config";
import { Api } from "telegram";
import { CustomFile } from "telegram/client/uploads";
import path from "path";
import * as fs from "fs";
import bigInt from "big-integer";
import { Messages } from "../messages";


export class Stories {
  static async GetMeAllStories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let result = await client.invoke(new Api.stories.GetAllStories({}));

      res.status(200).json({
        success: true,
        message: "Storylar",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetOthersStories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      let { peerId } = req.query

      let peer = await Messages.getPeer(client, peerId)

      let result = await client.invoke(new Api.stories.GetPeerStories({
        peer
      }));

      res.status(200).json({
        success: true,
        message: "Storylar",
        data: result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateStory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { peerId, me, pinned, noforwards, period } = req.body;
       const file = req.file as Express.Multer.File | undefined;

        let mediaObject = await Messages.createMediaObject(req, res, next, client, file)

        let filePath = "";
        if(file){
          filePath = path.join(process.cwd(), "uploads", file.fieldname);
        }

        let peer
        if(peerId){
          peer = await Messages.getPeer(client, peerId)
        }

        let result = await client.invoke(
          new Api.stories.SendStory({
            peer: (!peerId && me === "true") || (!peerId && me === true) ? new Api.InputPeerSelf(): peer,
            media: mediaObject,
            period: Number(period),
            privacyRules: [new Api.InputPrivacyValueAllowAll()],
            pinned: pinned == "true" || pinned === true ? true : false,
            noforwards: noforwards === "true" || noforwards === true ? true : false

          })
        );

        res.status(200).json({
          success: true,
          message: "Story yaratildi",
          data: result,
        });
        fs.unlink(filePath, (err) => {})
    } catch (error: any) {
      if(error.message.includes("STORIES_TOO_MUCH")){
        next(new ErrorHandler("Limitingiz tugadi", 400));
        return
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async EditStory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { peerId, id, me } = req.body;
      const file = req.file as Express.Multer.File | undefined;

      if(!file){
        res.status(400).send({
          success: false,
          message: "File mavjud emas"
        })
      }

      let mediaObject = await Messages.createMediaObject(req, res, next, client, file)

      let filePath = "";
      if(file){
        filePath = path.join(process.cwd(), "uploads", file.fieldname);
      }

      let peer
      if(peerId){
        peer = await Messages.getPeer(client, peerId)
      }

        let result = await client.invoke(
          new Api.stories.EditStory({
            peer: me === "true" || me === true ? new Api.InputPeerSelf(): peer,
            id: Number(id),
            media: mediaObject
          })
        );

        res.status(200).json({
          success: true,
          message: "Yangilandi",
          data: result,
        });

        fs.unlink(filePath,(err) => {})
    } catch (error: any) {
      if(error.message.includes("STORIES_TOO_MUCH")){
        next(new ErrorHandler("Limitingiz tugadi", 400));
        return
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteStory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { peerId, id, me } = req.body;

      let peer

      if(peerId){
        peer = await Messages.getPeer(client, peerId)
      }

        let result = await client.invoke(
          new Api.stories.DeleteStories({
            peer: me === "true" || me === true ? new Api.InputPeerSelf(): peer,
            id: [Number(id)]
          })
        );

        res.status(200).json({
          success: true,
          message: "O'chirildi",
          data: result,
        });

    } catch (error: any) {
      if(error.message.includes("STORIES_TOO_MUCH")){
        next(new ErrorHandler("Limitingiz tugadi", 400));
        return
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async ExportStoryLink(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionString = req.headers.string_session as string;
      const client = tgClient(sessionString);
      await client.connect();

      const { peerId, id} = req.body;

      let peer

      if(peerId){
        peer = await Messages.getPeer(client, peerId)
      }

        let result = await client.invoke(
          new Api.stories.ExportStoryLink({
            peer,
            id: Number(id)
          })
        );

        res.status(200).json({
          success: true,
          message: "Link",
          data: result,
        });

    } catch (error: any) {
      if(error.message.includes("STORIES_TOO_MUCH")){
        next(new ErrorHandler("Limitingiz tugadi", 400));
        return
      }
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
