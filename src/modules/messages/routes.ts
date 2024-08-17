import { Router } from "express";
import { getMessagesQueryDto, validate, sendMessageDto, editMessageDto, deleteMessageDto  } from "@middlewares"
import { Messages } from "./messages"

const MessageRouter = Router()

MessageRouter
    .get("/all", validate(getMessagesQueryDto, "query"), Messages.GetMessages)
    // .post("/send", validate(sendMessageDto), Messages.SendMessage)
    .post("/forward-messages", Messages.ForwardMessages)
    .put("/edit", validate(editMessageDto), Messages.EditMessage)
    .delete("/delete", validate(deleteMessageDto), Messages.DeleteMessage)


export  {MessageRouter}