import {Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";

const verifyStringSession = async(req: Request, res: Response, next: NextFunction) => {
  try {

    const stringSession = req.headers.string_session

    if (stringSession && typeof stringSession === "string") {
       next()
    } else {
        res.status(400).send({
            success: false,
            message: "stringSession is required"
          })
    }
  } catch (error: any) {
    res.status(error.status || 500).send({
      success: false,
      message: error.message || "VerifyStringSession error"
    })
    return
  }
}

export {verifyStringSession};