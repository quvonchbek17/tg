import { Router } from "express";
import {validate, searchDto, searchGlobalDto, sendReactionDto, setTypingChatDto, getProfilePhotosDto, setMessagesTtlDto  } from "@middlewares"
import { Messages } from "./messages"
import { upload } from "@config";

const MessageRouter = Router()

MessageRouter
    .get("/emoji-keywords", Messages.GetEmojiKeywords)
    .get("/profile-photos", validate(getProfilePhotosDto, "query"), Messages.GetProfilePhotos)

    .post("/forward-messages", Messages.ForwardMessages)
    .post("/search", validate(searchDto), Messages.Search)
    .post("/set-typing", validate(setTypingChatDto), Messages.SetTyping)
    .post("/search-global", validate(searchGlobalDto), Messages.SearchGlobal)
    .post("/send-reaction", validate(sendReactionDto), Messages.SendReaction)
    .post("/set-messages-ttl", validate(setMessagesTtlDto), Messages.SetHistoryTTL)



export  {MessageRouter}